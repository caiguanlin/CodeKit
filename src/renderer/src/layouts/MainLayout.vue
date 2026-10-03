<template>
  <div class="h-full w-full flex-1 min-h-0 flex overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)] transition-colors duration-200">
    <!-- 侧边导航栏 -->
    <aside
      class="h-full flex flex-col shrink-0 border-r border-[var(--border-color)] bg-[var(--sidebar-bg)] transition-all duration-200 select-none"
      :class="settingsStore.isSidebarCollapsed ? 'w-16' : 'w-60'"
    >
      <!-- 侧边栏头部折叠切换 -->
      <div
        class="h-10 px-3 flex items-center border-b border-[var(--border-color)] shrink-0"
        :class="settingsStore.isSidebarCollapsed ? 'justify-center px-0' : 'justify-between'"
      >
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
      <div class="flex-1 min-h-0 overflow-y-auto px-2 py-3 space-y-4">
        <!-- 常用工具（最近打开的三个工具） -->
        <div v-if="recentToolsList.length > 0">
          <div v-if="!settingsStore.isSidebarCollapsed" class="px-2 mb-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            常用工具
          </div>
          <div v-else class="my-1.5 mx-auto w-6 border-t border-[var(--border-sub-color)]"></div>
          <div class="space-y-0.5">
            <button
              v-for="tool in recentToolsList"
              :key="tool.id"
              type="button"
              @click="navigateToTool(tool)"
              class="w-full flex items-center rounded-md text-xs transition-colors cursor-pointer"
              :class="[
                settingsStore.isSidebarCollapsed ? 'justify-center p-1.5' : 'px-2.5 py-1.5',
                toolStore.activeToolId === tool.id ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'
              ]"
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
          <div v-else class="my-1.5 mx-auto w-6 border-t border-[var(--border-sub-color)]"></div>
          <div class="space-y-0.5">
            <button
              v-for="tool in getToolsByCategory(cat.key)"
              :key="tool.id"
              type="button"
              @click="navigateToTool(tool)"
              class="w-full flex items-center rounded-md text-xs transition-colors cursor-pointer"
              :class="[
                settingsStore.isSidebarCollapsed ? 'justify-center p-1.5' : 'px-2.5 py-1.5',
                toolStore.activeToolId === tool.id ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'
              ]"
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

      <!-- 侧边栏底部：本地隐私安全标识与设置菜单项（固定在最底部） -->
      <div class="p-2 border-t border-[var(--border-color)] space-y-1 shrink-0 mt-auto bg-[var(--sidebar-bg)]">
        <!-- 本地隐私安全标识 -->
        <div
          class="px-2.5 py-1 text-[11px] text-zinc-400 dark:text-zinc-500 flex items-center space-x-2"
          :class="settingsStore.isSidebarCollapsed ? 'justify-center px-0' : ''"
          :title="settingsStore.isSidebarCollapsed ? '本地优先 · 隐私安全' : ''"
        >
          <svg class="w-3.5 h-3.5 text-emerald-500/80 dark:text-emerald-400/80 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span v-if="!settingsStore.isSidebarCollapsed" class="truncate">本地优先 · 隐私安全</span>
        </div>

        <!-- 设置菜单项 (移动至最底部) -->
        <button
          type="button"
          @click="navigateToSettings"
          class="w-full flex items-center rounded-md text-xs transition-colors cursor-pointer"
          :class="[
            settingsStore.isSidebarCollapsed ? 'justify-center p-1.5' : 'px-2.5 py-1.5',
            isSettingsActive ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-medium' : 'text-zinc-600 hover:text-zinc-900 hover:bg-black/5 dark:text-zinc-400 dark:hover:bg-white/5 dark:hover:text-zinc-200'
          ]"
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
      </div>
    </aside>

    <!-- 主工作区 -->
    <main class="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden bg-[var(--app-bg)]">


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
import { computed, watch, onMounted, onBeforeUnmount } from 'vue'
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

// 响应式自适应：监听窗口尺寸缩放与放大
function handleWindowResize(): void {
  const width = window.innerWidth
  // 当窗口缩窄（< 960px）且用户未手动强制锁定侧边栏时，自适应折叠为图标模式，以保障主内容视窗
  if (width < 960) {
    if (!settingsStore.isSidebarCollapsed && !settingsStore.isSidebarManuallyToggled) {
      settingsStore.setSidebarCollapsed(true, false)
    }
  } else if (width >= 1080) {
    // 当窗口放大或最大化（>= 1080px）时，若此前为自适应折叠，则自动恢复展开
    if (settingsStore.isSidebarCollapsed && !settingsStore.isSidebarManuallyToggled) {
      settingsStore.setSidebarCollapsed(false, false)
    }
  }
}

onMounted(() => {
  window.addEventListener('resize', handleWindowResize)
  handleWindowResize()
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleWindowResize)
})
</script>
