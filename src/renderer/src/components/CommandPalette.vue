<template>
  <div
    v-if="settingsStore.isCommandPaletteOpen"
    class="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-black/60 backdrop-blur-sm"
    @click.self="close"
  >
    <div
      class="w-full max-w-xl overflow-hidden rounded-xl bg-white dark:bg-[#1e1e24] border border-zinc-200 dark:border-[#33333b] shadow-2xl animate-fade-in text-zinc-800 dark:text-zinc-200"
      @keydown.esc="close"
    >
      <!-- 搜索输入框 -->
      <div class="command-search-header">
        <div class="command-search-field" @click="searchInputRef?.focus()">
          <svg class="w-5 h-5 shrink-0 text-emerald-500 dark:text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <input
            ref="searchInputRef"
            v-model="query"
            type="text"
            placeholder="搜索工具或功能…"
            aria-label="搜索工具或功能"
            aria-describedby="command-search-hint"
            autocomplete="off"
            spellcheck="false"
            class="command-search-input"
            @keydown.down.prevent="navigate(1)"
            @keydown.up.prevent="navigate(-1)"
            @keydown.enter.prevent="selectCurrent"
          />
          <button
            v-if="query"
            type="button"
            @click.stop="clearQuery"
            aria-label="清空搜索"
            title="清空搜索"
            class="command-search-clear"
          >
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
              <path d="M18 6 6 18"></path>
              <path d="m6 6 12 12"></path>
            </svg>
          </button>
          <kbd class="command-search-shortcut" title="按 Esc 关闭">Esc</kbd>
        </div>
        <p id="command-search-hint" class="command-search-hint">快速查找，例如 JSON、时间戳、Base64</p>
      </div>

      <!-- 搜索结果列表 -->
      <div class="max-h-80 overflow-y-auto p-2 space-y-1">
        <template v-if="filteredTools.length > 0">
          <div
            v-for="(tool, index) in filteredTools"
            :key="tool.id"
            :class="[
              'flex items-center justify-between px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-xs',
              selectedIndex === index ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30' : 'hover:bg-zinc-100 dark:hover:bg-white/5 text-zinc-700 dark:text-zinc-300'
            ]"
            @mouseenter="selectedIndex = index"
            @click="selectTool(tool)"
          >
            <div class="flex items-center space-x-3 truncate">
              <!-- 图标 -->
              <div
                class="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs"
                :style="{ backgroundColor: `${tool.accentColor}20`, color: tool.accentColor }"
              >
                {{ tool.shortName.slice(0, 2) }}
              </div>
              <div class="flex flex-col truncate">
                <span class="font-medium text-zinc-900 dark:text-zinc-100">{{ tool.name }}</span>
                <span class="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">{{ tool.description }}</span>
              </div>
            </div>

            <!-- 右侧回车提示 -->
            <div class="flex items-center space-x-2 pl-2">
              <span
                v-if="selectedIndex === index"
                class="flex items-center text-[10px] text-emerald-600 dark:text-emerald-400 font-mono"
              >
                <span>Enter</span>
                <svg class="w-3 h-3 ml-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M5 12h14"></path>
                  <path d="m12 5 7 7-7 7"></path>
                </svg>
              </span>
            </div>
          </div>
        </template>

        <!-- 空状态 -->
        <div v-else class="py-12 flex flex-col items-center justify-center text-center text-zinc-400">
          <svg class="w-8 h-8 text-zinc-400 dark:text-zinc-600 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <p class="text-sm font-medium text-zinc-700 dark:text-zinc-300">没有找到相关工具</p>
          <p class="text-xs text-zinc-400 dark:text-zinc-500 mt-1">换一个更简短的关键词试试，如 “json” 或 “base64”</p>
        </div>
      </div>

      <!-- 底部操作提示 -->
      <div class="flex items-center justify-between px-4 py-2 border-t border-zinc-200 dark:border-[#2d2d35] bg-zinc-50 dark:bg-[#1a1a20] text-[11px] text-zinc-500 font-mono">
        <div class="flex items-center space-x-3">
          <span><kbd class="px-1 py-0.2 rounded bg-white dark:bg-[#272730] border border-zinc-200 dark:border-[#3a3a46]">↑</kbd> <kbd class="px-1 py-0.2 rounded bg-white dark:bg-[#272730] border border-zinc-200 dark:border-[#3a3a46]">↓</kbd> 切换</span>
          <span><kbd class="px-1 py-0.2 rounded bg-white dark:bg-[#272730] border border-zinc-200 dark:border-[#3a3a46]">Enter</kbd> 打开</span>
        </div>
        <span>共 {{ TOOLS.length }} 款实用工具 · 偏好设置</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useToolStore } from '@/stores/tools'
import { TOOLS } from '@/registry'
import type { ToolMetadata } from '@/types/tool'

const router = useRouter()
const settingsStore = useSettingsStore()
const toolStore = useToolStore()

const query = ref('')
const selectedIndex = ref(0)
const searchInputRef = ref<HTMLInputElement | null>(null)

// 自动对焦
watch(
  () => settingsStore.isCommandPaletteOpen,
  (open) => {
    if (open) {
      query.value = ''
      selectedIndex.value = 0
      nextTick(() => {
        searchInputRef.value?.focus()
      })
    }
  }
)

const SETTINGS_COMMAND: ToolMetadata = {
  id: 'settings',
  name: '偏好设置',
  shortName: '设置',
  description: '外观主题切换（浅色/深色）、常规窗口行为与应用配置',
  category: 'format',
  icon: 'SettingsOutline',
  accentColor: '#10b981',
  keywords: ['settings', 'shezhi', 'theme', 'dark', 'light', 'zhuti', 'qianse', 'shense', 'waiguan', 'peizhi'],
  route: '/settings',
  component: () => import('@/views/Settings.vue')
}

const ALL_SEARCH_ITEMS = computed<ToolMetadata[]>(() => {
  return [...TOOLS, SETTINGS_COMMAND]
})

const filteredTools = computed(() => {
  const q = query.value.trim().toLowerCase()
  if (!q) return ALL_SEARCH_ITEMS.value
  return ALL_SEARCH_ITEMS.value.filter((tool) => {
    return (
      tool.name.toLowerCase().includes(q) ||
      tool.shortName.toLowerCase().includes(q) ||
      tool.description.toLowerCase().includes(q) ||
      tool.keywords.some((k) => k.toLowerCase().includes(q))
    )
  })
})

watch(filteredTools, () => {
  selectedIndex.value = 0
})

function navigate(direction: number): void {
  const count = filteredTools.value.length
  if (count === 0) return
  selectedIndex.value = (selectedIndex.value + direction + count) % count
}

function selectTool(tool: ToolMetadata): void {
  if (tool.id === 'settings') {
    toolStore.activeToolId = ''
    router.push('/settings')
  } else {
    toolStore.setActiveTool(tool.id)
    router.push(tool.route)
  }
  close()
}

function selectCurrent(): void {
  const tool = filteredTools.value[selectedIndex.value]
  if (tool) {
    selectTool(tool)
  }
}

function clearQuery(): void {
  query.value = ''
  searchInputRef.value?.focus()
}

function close(): void {
  settingsStore.closeCommandPalette()
}
</script>

<style scoped>
.command-search-header {
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--border-color);
}

.command-search-field {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 48px;
  padding: 0 12px;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--card-sub-bg);
  cursor: text;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.command-search-field:focus-within {
  border-color: #10b981;
  box-shadow: 0 0 0 3px rgb(16 185 129 / 10%);
}

/* Reset Chromium's native input chrome inside the shared search surface. */
.command-search-input {
  flex: 1;
  min-width: 0;
  width: 100%;
  height: 46px;
  margin: 0;
  padding: 0;
  border: 0;
  border-radius: 0;
  outline: none;
  box-shadow: none;
  appearance: none;
  background: transparent;
  color: var(--text-primary);
  caret-color: #10b981;
  font: inherit;
  font-size: 14px;
  line-height: 22px;
}

.command-search-input::placeholder {
  color: var(--text-secondary);
  opacity: 0.7;
}

.command-search-clear {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  width: 26px;
  height: 26px;
  border-radius: 6px;
  color: var(--text-secondary);
  transition: background-color 0.15s ease, color 0.15s ease;
}

.command-search-clear:hover {
  background: var(--hover-bg);
  color: var(--text-primary);
}

.command-search-clear:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.command-search-shortcut {
  flex-shrink: 0;
  padding: 2px 5px;
  border: 1px solid var(--border-color);
  border-radius: 5px;
  background: var(--card-bg);
  color: var(--text-secondary);
  font-size: 10px;
  line-height: 16px;
}

.command-search-hint {
  margin: 10px 2px 0;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 16px;
}
</style>
