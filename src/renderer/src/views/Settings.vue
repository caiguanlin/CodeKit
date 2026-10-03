<template>
  <div class="max-w-4xl mx-auto py-2 px-1 pb-16 space-y-6">
    <!-- 外观与主题设置区 -->
    <section class="p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-4 transition-colors">
      <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-3">
        <div class="flex items-center space-x-2.5">
          <div class="w-8 h-8 rounded-lg bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <svg class="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="12" cy="12" r="5"></circle>
              <line x1="12" y1="1" x2="12" y2="3"></line>
              <line x1="12" y1="21" x2="12" y2="23"></line>
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
              <line x1="1" y1="12" x2="3" y2="12"></line>
              <line x1="21" y1="12" x2="23" y2="12"></line>
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
            </svg>
          </div>
          <div>
            <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">外观主题</h2>
            <p class="text-xs text-zinc-500 dark:text-zinc-400">选择您偏好的界面色彩模式，支持浅色与深色独立无缝切换</p>
          </div>
        </div>

        <span class="text-xs px-2.5 py-1 rounded-full font-medium" :class="settingsStore.theme === 'dark' ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-700'">
          当前：{{ settingsStore.theme === 'dark' ? '深色主题' : '浅色主题' }}
        </span>
      </div>

      <!-- 主题卡片网格 -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
        <!-- 浅色主题卡片 -->
        <div
          role="button"
          tabindex="0"
          @click="settingsStore.setTheme('light')"
          @keydown.enter="settingsStore.setTheme('light')"
          class="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between"
          :class="[
            settingsStore.theme === 'light'
              ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-950/10 shadow-sm ring-1 ring-emerald-500/20'
              : 'border-[var(--border-color)] bg-[var(--card-sub-bg)] hover:border-zinc-300 dark:hover:border-zinc-700'
          ]"
        >
          <!-- 选中指示徽章 -->
          <div
            v-if="settingsStore.theme === 'light'"
            class="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs"
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <!-- 浅色视觉微缩视窗预览 -->
          <div class="w-full h-28 rounded-lg border border-zinc-200 bg-[#f4f4f5] overflow-hidden flex flex-col p-1.5 shadow-inner mb-3">
            <div class="h-4 bg-white border border-zinc-200 rounded flex items-center px-1.5 justify-between">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <div class="w-12 h-1.5 bg-zinc-200 rounded"></div>
              <div class="flex space-x-1">
                <div class="w-1.5 h-1.5 bg-zinc-300 rounded-full"></div>
                <div class="w-1.5 h-1.5 bg-zinc-300 rounded-full"></div>
              </div>
            </div>
            <div class="flex-1 flex mt-1 space-x-1 min-h-0">
              <div class="w-1/4 bg-white border border-zinc-200 rounded p-1 space-y-1">
                <div class="w-full h-1.5 bg-emerald-100 rounded"></div>
                <div class="w-3/4 h-1.5 bg-zinc-100 rounded"></div>
                <div class="w-4/5 h-1.5 bg-zinc-100 rounded"></div>
              </div>
              <div class="flex-1 bg-white border border-zinc-200 rounded p-1.5 flex flex-col justify-between">
                <div class="space-y-1">
                  <div class="w-1/2 h-2 bg-zinc-200 rounded"></div>
                  <div class="w-3/4 h-1.5 bg-zinc-100 rounded"></div>
                </div>
                <div class="w-10 h-3 bg-emerald-500 rounded flex items-center justify-center">
                  <div class="w-6 h-1 bg-white/80 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="12" cy="12" r="5"></circle>
                <line x1="12" y1="1" x2="12" y2="3"></line>
                <line x1="12" y1="21" x2="12" y2="23"></line>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                <line x1="1" y1="12" x2="3" y2="12"></line>
                <line x1="21" y1="12" x2="23" y2="12"></line>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
              </svg>
            </div>
            <div>
              <div class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">浅色模式 (Light)</div>
              <div class="text-[11px] text-zinc-500 dark:text-zinc-400">明亮清爽，适合白天或充足光线环境</div>
            </div>
          </div>
        </div>

        <!-- 深色主题卡片 -->
        <div
          role="button"
          tabindex="0"
          @click="settingsStore.setTheme('dark')"
          @keydown.enter="settingsStore.setTheme('dark')"
          class="relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 select-none flex flex-col justify-between"
          :class="[
            settingsStore.theme === 'dark'
              ? 'border-emerald-500 bg-emerald-950/20 shadow-sm ring-1 ring-emerald-500/20'
              : 'border-[var(--border-color)] bg-[var(--card-sub-bg)] hover:border-zinc-300 dark:hover:border-zinc-700'
          ]"
        >
          <!-- 选中指示徽章 -->
          <div
            v-if="settingsStore.theme === 'dark'"
            class="absolute top-3 right-3 w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-xs"
          >
            <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <polyline points="20 6 9 17 4 12"></polyline>
            </svg>
          </div>

          <!-- 深色视觉微缩视窗预览 -->
          <div class="w-full h-28 rounded-lg border border-[#2a2a34] bg-[#121214] overflow-hidden flex flex-col p-1.5 shadow-inner mb-3">
            <div class="h-4 bg-[#18181c] border border-[#27272a] rounded flex items-center px-1.5 justify-between">
              <div class="w-2.5 h-2.5 rounded-full bg-emerald-500"></div>
              <div class="w-12 h-1.5 bg-[#2a2a34] rounded"></div>
              <div class="flex space-x-1">
                <div class="w-1.5 h-1.5 bg-[#3a3a46] rounded-full"></div>
                <div class="w-1.5 h-1.5 bg-[#3a3a46] rounded-full"></div>
              </div>
            </div>
            <div class="flex-1 flex mt-1 space-x-1 min-h-0">
              <div class="w-1/4 bg-[#161619] border border-[#27272a] rounded p-1 space-y-1">
                <div class="w-full h-1.5 bg-emerald-950/60 rounded"></div>
                <div class="w-3/4 h-1.5 bg-[#26262e] rounded"></div>
                <div class="w-4/5 h-1.5 bg-[#26262e] rounded"></div>
              </div>
              <div class="flex-1 bg-[#18181c] border border-[#27272a] rounded p-1.5 flex flex-col justify-between">
                <div class="space-y-1">
                  <div class="w-1/2 h-2 bg-[#2d2d38] rounded"></div>
                  <div class="w-3/4 h-1.5 bg-[#24242c] rounded"></div>
                </div>
                <div class="w-10 h-3 bg-emerald-600 rounded flex items-center justify-center">
                  <div class="w-6 h-1 bg-white/90 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <div class="w-6 h-6 rounded-md bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0">
              <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
              </svg>
            </div>
            <div>
              <div class="text-xs font-semibold text-zinc-900 dark:text-zinc-100">深色模式 (Dark)</div>
              <div class="text-[11px] text-zinc-500 dark:text-zinc-400">暗黑低眩光，沉浸护眼，适合专注编程</div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 窗口与常规选项 -->
    <section class="p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-4 transition-colors">
      <div class="border-b border-[var(--border-color)] pb-3">
        <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">常规与窗口行为</h2>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">配置窗口呈现与界面布局习惯</p>
      </div>

      <div class="space-y-3">
        <!-- 侧边栏折叠 -->
        <div class="flex items-center justify-between p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)]">
          <div class="space-y-0.5">
            <div class="text-xs font-medium text-zinc-900 dark:text-zinc-100">收起侧边栏导航</div>
            <div class="text-[11px] text-zinc-500 dark:text-zinc-400">将左侧工具导航折叠为极简图标模式，获取更宽广的代码视窗空间</div>
          </div>
          <n-switch
            :value="settingsStore.isSidebarCollapsed"
            @update:value="settingsStore.toggleSidebar"
          />
        </div>
      </div>
    </section>

    <!-- 快捷键速查清单 -->
    <section class="p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-3 transition-colors">
      <div class="border-b border-[var(--border-color)] pb-3">
        <h2 class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">全局键盘快捷键</h2>
        <p class="text-xs text-zinc-500 dark:text-zinc-400">常用操作与全局指令触发快捷键</p>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
        <div class="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] text-xs">
          <span class="text-zinc-600 dark:text-zinc-300">唤起全局指令搜索面板</span>
          <div class="flex items-center space-x-1">
            <kbd class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-[#18181c] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-[#3a3a42]">Ctrl</kbd>
            <span class="text-zinc-400">+</span>
            <kbd class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-[#18181c] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-[#3a3a42]">K</kbd>
          </div>
        </div>

        <div class="flex items-center justify-between p-2.5 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] text-xs">
          <span class="text-zinc-600 dark:text-zinc-300">关闭搜索面板 / 弹出层</span>
          <kbd class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-white dark:bg-[#18181c] text-zinc-600 dark:text-zinc-300 border border-zinc-200 dark:border-[#3a3a42]">Esc</kbd>
        </div>
      </div>
    </section>

    <!-- 关于与本地安全说明 -->
    <section class="p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] transition-colors">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <img src="/logo.svg" alt="CodeKit Logo" class="w-10 h-10 rounded-xl drop-shadow-sm select-none" />
          <div>
            <div class="flex items-center space-x-2">
              <span class="text-sm font-bold text-zinc-900 dark:text-zinc-100">CodeKit</span>
              <span class="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">v1.0.0</span>
            </div>
            <p class="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">面向现代软件开发者的桌面代码全能工具盒</p>
          </div>
        </div>

        <div class="flex items-center space-x-1.5 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect width="18" height="11" x="3" y="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
          <span class="font-medium">100% 离线运算 · 本地优先</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
</script>
