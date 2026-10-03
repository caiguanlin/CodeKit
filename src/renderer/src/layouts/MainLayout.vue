<template>
  <div class="flex-1 flex overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)] transition-colors duration-200">
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
        <!-- 常用收藏 -->
        <div>
          <div v-if="!settingsStore.isSidebarCollapsed" class="px-2 mb-1.5 text-[11px] font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
            常用工具
          </div>
          <div class="space-y-0.5">
            <button
              v-for="tool in favoriteTools"
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

      <!-- 侧边栏底部：本地隐私安全标识 -->
      <div class="p-2.5 border-t border-[var(--border-color)] text-[11px] text-zinc-500 flex items-center space-x-2">
        <svg class="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
        <span v-if="!settingsStore.isSidebarCollapsed" class="truncate">本地优先 · 隐私安全</span>
      </div>
    </aside>

    <!-- 主工作区 -->
    <main class="flex-1 flex flex-col overflow-hidden bg-[var(--app-bg)]">
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

        <!-- 右侧收藏切换 -->
        <button
          type="button"
          @click="toolStore.toggleFavorite(currentTool.id)"
          class="flex items-center space-x-1 px-2.5 py-1 rounded text-xs transition-colors cursor-pointer"
          :class="toolStore.isFavorite(currentTool.id) ? 'bg-amber-500/10 text-amber-500 dark:text-amber-400 border border-amber-500/30' : 'text-zinc-500 dark:text-zinc-400 hover:bg-black/5 dark:hover:bg-white/5 border border-zinc-200 dark:border-transparent'"
          :title="toolStore.isFavorite(currentTool.id) ? '取消收藏' : '添加收藏'"
        >
          <span class="text-xs">★</span>
          <span>{{ toolStore.isFavorite(currentTool.id) ? '已收藏' : '收藏' }}</span>
        </button>
      </header>

      <!-- 动态视图容器 -->
      <section class="flex-1 overflow-auto p-4">
        <router-view />
      </section>
    </main>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useToolStore } from '@/stores/tools'
import { TOOLS, TOOL_CATEGORIES, getToolsByCategory, getToolById } from '@/registry'
import type { ToolMetadata } from '@/types/tool'

const router = useRouter()
const route = useRoute()
const settingsStore = useSettingsStore()
const toolStore = useToolStore()

const favoriteTools = computed(() => {
  return toolStore.favorites
    .map((id) => getToolById(id))
    .filter((tool): tool is ToolMetadata => Boolean(tool))
})

const currentTool = computed(() => {
  const currentPath = route.path
  return TOOLS.find((t) => t.route === currentPath) || getToolById(toolStore.activeToolId)
})

function navigateToTool(tool: ToolMetadata): void {
  toolStore.setActiveTool(tool.id)
  router.push(tool.route)
}
</script>
