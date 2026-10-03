<template>
  <div class="flex-1 min-h-0 flex overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)] transition-colors duration-200">
    <!-- 侧边导航栏 -->
    <aside
      class="h-full flex flex-col border-r border-[var(--border-color)] bg-[var(--sidebar-bg)] transition-all duration-200 select-none"
      :class="settingsStore.isSidebarCollapsed ? 'w-16' : 'w-60'"
    >
      <!-- 侧边栏头部折叠切换 -->
      <div class="h-10 px-3 flex items-center justify-between border-b border-[var(--border-color)]">
        <span v-if="!settingsStore.isSidebarCollapsed" class="text-xs font-semibold text-zinc-600 dark:text-zinc-400">工具导航</span>
        <button
          type="button"
          @click="settingsStore.toggleSidebar()"
          class="p-1.5 rounded hover:bg-black/5 dark:hover:bg-white/10 text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200 cursor-pointer transition-colors"
          :title="settingsStore.isSidebarCollapsed ? '展开侧边栏' : '收起侧边栏'"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
          </svg>
        </button>
      </div>

      <!-- 工具列表滚动区域 -->
      <div class="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        <!-- 常用工具（最近打开的三个工具） -->
        <div v-if="recentToolsList.length > 0">
          <div v-if="!settingsStore.isSidebarCollapsed" class="px-2 mb-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            常用工具
          </div>
          <div class="space-y-0.5">
            <button
              v-for="tool in recentToolsList"
              :key="tool.id"
              type="button"
              @click="navigateToTool(tool)"
              class="w-full flex items-center px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
              :class="toolStore.activeToolId === tool.id ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'"
              :title="tool.name"
            >
              <div
                class="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0"
                :style="{ backgroundColor: `${tool.accentColor}25`, color: tool.accentColor }"
              >
                {{ tool.shortName.slice(0, 1) }}
              </div>
              <span v-if="!settingsStore.isSidebarCollapsed" class="ml-2.5 truncate text-left">{{ tool.name }}</span>
            </button>
          </div>
        </div>

        <!-- 按分类列出全部工具 -->
        <div v-for="cat in TOOL_CATEGORIES" :key="cat.key">
          <div v-if="!settingsStore.isSidebarCollapsed" class="px-2 mb-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            {{ cat.name }}
          </div>
          <div class="space-y-0.5">
            <button
              v-for="tool in getToolsByCategory(cat.key)"
              :key="tool.id"
              type="button"
              @click="navigateToTool(tool)"
              class="w-full flex items-center px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
              :class="toolStore.activeToolId === tool.id ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'"
              :title="tool.name"
            >
              <div
                class="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0"
                :style="{ backgroundColor: `${tool.accentColor}25`, color: tool.accentColor }"
              >
                {{ tool.shortName.slice(0, 1) }}
              </div>
              <span v-if="!settingsStore.isSidebarCollapsed" class="ml-2.5 truncate text-left">{{ tool.name }}</span>
            </button>
          </div>
        </div>
      </div>

      <!-- 侧边栏底部：设置菜单项与本地隐私安全标识 -->
      <div class="p-2 border-t border-[var(--border-color)] space-y-1">
        <!-- 设置菜单项 -->
        <button
          type="button"
          @click="navigateToSettings"
          class="w-full flex items-center px-2.5 py-1.5 rounded-md text-xs transition-colors cursor-pointer"
          :class="isSettingsActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'"
          :title="settingsStore.isSidebarCollapsed ? '偏好设置' : ''"
        >
          <div
            class="w-5 h-5 rounded flex items-center justify-center font-bold text-[10px] shrink-0"
            :class="isSettingsActive ? 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400' : 'text-zinc-500 dark:text-zinc-400'"
          >
            <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <span v-if="!settingsStore.isSidebarCollapsed" class="ml-2.5 truncate text-left">设置</span>
        </button>

        <!-- 本地隐私安全标识 -->
        <div class="px-2.5 py-1 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center space-x-2">
          <svg class="w-3.5 h-3.5 text-emerald-500/80 dark:text-emerald-400/80 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span v-if="!settingsStore.isSidebarCollapsed" class="truncate">本地优先 · 隐私安全</span>
        </div>
      </div>
    </aside>

    <!-- 主工作区 -->
    <main class="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-[var(--app-bg)]">
      <!-- 顶部当前工具标头 -->
      <header v-if="currentTool" class="h-12 px-6 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--header-bg)] shrink-0 transition-colors duration-200">
        <div class="flex items-center space-x-3">
          <div
            class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs"
            :style="{ backgroundColor: `${currentTool.accentColor}20`, color: currentTool.accentColor }"
          >
            {{ currentTool.shortName.slice(0, 2) }}
          </div>
          <div>
            <h1 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <span>{{ currentTool.name }}</span>
            </h1>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">{{ currentTool.description }}</p>
          </div>
        </div>
      </header>

      <!-- 设置页面顶部标头 -->
      <header v-else-if="isSettingsActive" class="h-12 px-6 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--header-bg)] shrink-0 transition-colors duration-200">
        <div class="flex items-center space-x-3">
          <div class="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
            <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
          </div>
          <div>
            <h1 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100 flex items-center space-x-2">
              <span>偏好设置</span>
            </h1>
            <p class="text-[11px] text-zinc-500 dark:text-zinc-400">外观主题切换、常规配置与应用说明</p>
          </div>
        </div>
      </header>

      <!-- 动态视图容器 (支持视图状态缓存与平滑滚动) -->
      <section class="flex-1 min-h-0 overflow-y-auto p-4">
        <router-view v-slot="{ Component }">
          <keep-alive>
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useToolStore } from '@/stores/tools'
import { TOOLS, TOOL_CATEGORIES, getToolsByCategory, getToolById } from '@/registry'
import type { ToolMetadata } from '@/types/tool'

const router = useRouter()
const route = useRoute()
const settingsStore = useSettingsStore()
const toolStore = useToolStore()

// 常用工具：显示最近打开的三个工具
const recentToolsList = computed(() => {
  return toolStore.recentTools
    .slice(0, 3)
    .map((id) => getToolById(id))
    .filter((tool): tool is ToolMetadata => Boolean(tool))
})

const isSettingsActive = computed(() => route.path === '/settings')

const currentTool = computed(() => {
  const currentPath = route.path
  if (currentPath === '/settings') {
    return null
  }
  return TOOLS.find((t) => t.route === currentPath) || getToolById(toolStore.activeToolId)
})

// 监听路由变化，自动记录当前打开的工具
watch(
  () => route.path,
  (path) => {
    const matched = TOOLS.find((t) => t.route === path)
    if (matched) {
      toolStore.setActiveTool(matched.id)
    }
  },
  { immediate: true }
)

function navigateToTool(tool: ToolMetadata): void {
  toolStore.setActiveTool(tool.id)
  router.push(tool.route)
}

function navigateToSettings(): void {
  router.push('/settings')
}
</script>
