<template>
  <div class="max-w-4xl mx-auto py-2 px-1 pb-16 space-y-6">
    <!-- 主题切换卡片 -->
    <section class="p-4 sm:p-5 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between transition-colors">
      <div class="text-sm font-semibold text-zinc-900 dark:text-zinc-100">主题</div>

      <!-- 右侧微缩视窗选项：浅色 / 深色 -->
      <div class="flex items-center space-x-3">
        <!-- 1. 浅色模式 -->
        <button
          type="button"
          @click="settingsStore.setTheme('light')"
          title="浅色模式"
          class="relative w-[76px] h-[52px] rounded-xl p-0.5 cursor-pointer transition-all duration-150 select-none overflow-hidden"
          :class="[
            settingsStore.theme === 'light'
              ? 'ring-2 ring-emerald-500 border-2 border-emerald-500 shadow-sm'
              : 'border-2 border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-500'
          ]"
        >
          <div class="w-full h-full rounded-lg bg-[#f4f4f5] p-1.5 flex flex-col justify-between shadow-inner">
            <div class="flex items-start space-x-1.5">
              <!-- 微型齿轮图标 -->
              <svg class="w-2.5 h-2.5 text-zinc-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <!-- 模拟文字行 -->
              <div class="flex-1 space-y-1">
                <div class="w-8 h-[2px] bg-emerald-500 rounded-full"></div>
                <div class="w-10 h-[2px] bg-zinc-300 rounded-full"></div>
                <div class="w-7 h-[2px] bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            <!-- 底部开关条 -->
            <div class="h-2.5 rounded-full border border-zinc-200 bg-white flex items-center justify-end px-1 shadow-xs">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </button>

        <!-- 2. 深色模式 -->
        <button
          type="button"
          @click="settingsStore.setTheme('dark')"
          title="深色模式"
          class="relative w-[76px] h-[52px] rounded-xl p-0.5 cursor-pointer transition-all duration-150 select-none overflow-hidden"
          :class="[
            settingsStore.theme === 'dark'
              ? 'ring-2 ring-emerald-500 border-2 border-emerald-500 shadow-sm'
              : 'border-2 border-zinc-200 dark:border-zinc-700/60 hover:border-zinc-300 dark:hover:border-zinc-500'
          ]"
        >
          <div class="w-full h-full rounded-lg bg-[#18181c] p-1.5 flex flex-col justify-between shadow-inner">
            <div class="flex items-start space-x-1.5">
              <!-- 微型齿轮图标 -->
              <svg class="w-2.5 h-2.5 text-zinc-500 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
              </svg>
              <!-- 模拟文字行 -->
              <div class="flex-1 space-y-1">
                <div class="w-8 h-[2px] bg-emerald-500 rounded-full"></div>
                <div class="w-10 h-[2px] bg-zinc-600 rounded-full"></div>
                <div class="w-7 h-[2px] bg-emerald-500 rounded-full"></div>
              </div>
            </div>

            <!-- 底部开关条 -->
            <div class="h-2.5 rounded-full border border-[#2e2e38] bg-[#101014] flex items-center justify-end px-1 shadow-xs">
              <div class="w-1.5 h-1.5 rounded-full bg-emerald-500"></div>
            </div>
          </div>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
</script>
