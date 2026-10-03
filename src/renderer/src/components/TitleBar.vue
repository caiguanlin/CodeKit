<template>
  <header class="h-10 w-full flex items-center justify-between px-3 select-none border-b border-[#27272a] bg-[#18181c] text-[#a1a1aa] z-50 drag-region">
    <!-- 左侧：应用图标与标题 -->
    <div class="flex items-center space-x-2 no-drag">
      <div class="w-5 h-5 rounded flex items-center justify-center bg-emerald-500/10 text-emerald-400 font-bold text-xs">
        { / }
      </div>
      <span class="text-xs font-semibold tracking-wide text-zinc-200">CodeKit</span>
      <span class="text-[11px] text-zinc-500 hidden sm:inline">代码工具盒</span>
    </div>

    <!-- 中间：全局搜索快速触发条 (Ctrl+K) -->
    <div class="flex-1 max-w-sm mx-4 no-drag">
      <button
        type="button"
        @click="settingsStore.openCommandPalette()"
        class="w-full h-7 px-2.5 rounded flex items-center justify-between text-xs bg-[#242429] hover:bg-[#2c2c32] text-zinc-400 hover:text-zinc-200 border border-[#333338] transition-colors cursor-pointer"
      >
        <span class="flex items-center space-x-1.5 truncate">
          <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"></circle>
            <path d="m21 21-4.35-4.35"></path>
          </svg>
          <span class="text-[11px]">搜索工具或功能...</span>
        </span>
        <kbd class="px-1.5 py-0.5 text-[10px] font-mono rounded bg-[#18181c] text-zinc-400 border border-[#3a3a42]">Ctrl K</kbd>
      </button>
    </div>

    <!-- 右侧：置顶、主题切换与窗口操作控制按钮 -->
    <div class="flex items-center space-x-1 no-drag">
      <!-- 窗口置顶按钮 -->
      <button
        type="button"
        @click="settingsStore.toggleAlwaysOnTop()"
        :title="settingsStore.isAlwaysOnTop ? '取消窗口置顶' : '窗口置顶'"
        class="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 transition-colors cursor-pointer"
        :class="settingsStore.isAlwaysOnTop ? 'text-emerald-400' : 'text-zinc-400 hover:text-zinc-200'"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v8"></path>
          <path d="m5 10 7-8 7 8"></path>
          <path d="M4 14h16"></path>
          <path d="M12 14v8"></path>
        </svg>
      </button>

      <!-- 主题切换 -->
      <button
        type="button"
        @click="settingsStore.toggleTheme()"
        :title="settingsStore.theme === 'dark' ? '切换为浅色主题' : '切换为深色主题'"
        class="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
      >
        <svg v-if="settingsStore.theme === 'dark'" class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="4"></circle>
          <path d="M12 2v2"></path>
          <path d="M12 20v2"></path>
          <path d="m4.93 4.93 1.41 1.41"></path>
          <path d="m17.66 17.66 1.41 1.41"></path>
          <path d="M2 12h2"></path>
          <path d="M20 12h2"></path>
          <path d="m6.34 17.66-1.41 1.41"></path>
          <path d="m19.07 4.93-1.41 1.41"></path>
        </svg>
        <svg v-else class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"></path>
        </svg>
      </button>

      <!-- 最小化 -->
      <button
        type="button"
        @click="minimizeWindow"
        title="最小化"
        class="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M5 12h14"></path>
        </svg>
      </button>

      <!-- 最大化 / 还原 -->
      <button
        type="button"
        @click="maximizeWindow"
        :title="isMax ? '还原窗口' : '最大化窗口'"
        class="w-7 h-7 flex items-center justify-center rounded hover:bg-white/10 text-zinc-400 hover:text-zinc-200 transition-colors cursor-pointer"
      >
        <svg v-if="isMax" class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="13" height="13" x="3" y="8" rx="1.5"></rect>
          <path d="M8 8V5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-3"></path>
        </svg>
        <svg v-else class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect width="16" height="16" x="4" y="4" rx="2"></rect>
        </svg>
      </button>

      <!-- 关闭窗口 -->
      <button
        type="button"
        @click="closeWindow"
        title="关闭"
        class="w-7 h-7 flex items-center justify-center rounded hover:bg-red-500 hover:text-white text-zinc-400 transition-colors cursor-pointer"
      >
        <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M18 6 6 18"></path>
          <path d="m6 6 12 12"></path>
        </svg>
      </button>
    </div>
  </header>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const isMax = ref(false)

async function checkMaximized(): Promise<void> {
  if (window.electronAPI) {
    isMax.value = await window.electronAPI.isMaximized()
  }
}

onMounted(() => {
  checkMaximized()
})

function minimizeWindow(): void {
  window.electronAPI?.minimizeWindow()
}

async function maximizeWindow(): Promise<void> {
  if (window.electronAPI) {
    isMax.value = await window.electronAPI.maximizeWindow()
  }
}

function closeWindow(): void {
  window.electronAPI?.closeWindow()
}
</script>

<style scoped>
.drag-region {
  -webkit-app-region: drag;
}
.no-drag {
  -webkit-app-region: no-drag;
}
</style>
