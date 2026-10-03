<template>
  <n-config-provider
    :theme="settingsStore.theme === 'dark' ? darkTheme : null"
    :theme-overrides="themeOverrides"
  >
    <n-message-provider>
      <n-dialog-provider>
        <div class="h-screen w-screen flex flex-col overflow-hidden bg-[#121214] text-[#e4e4e7]">
          <!-- 自定义无边框标题栏 -->
          <TitleBar />

          <!-- 主界面布局与工作区 -->
          <MainLayout />

          <!-- 全局指令搜索面板 (Ctrl+K) -->
          <CommandPalette />
        </div>
      </n-dialog-provider>
    </n-message-provider>
  </n-config-provider>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import TitleBar from '@/components/TitleBar.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import { useSettingsStore } from '@/stores/settings'
import { useToolStore } from '@/stores/tools'

const settingsStore = useSettingsStore()
const toolStore = useToolStore()

// 极客翠绿主题配色定制
const themeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#10b981',
    primaryColorHover: '#34d399',
    primaryColorPressed: '#059669',
    primaryColorSuppl: '#10b981',
    bodyColor: '#121214',
    cardColor: '#18181c',
    borderColor: '#27272a'
  },
  Button: {
    textColorPrimary: '#ffffff'
  },
  Input: {
    color: '#202026',
    border: '1px solid #2e2e38'
  }
}

function handleGlobalKeydown(e: KeyboardEvent): void {
  // Ctrl+K 或 Cmd+K 呼出指令面板
  if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
    e.preventDefault()
    settingsStore.toggleCommandPalette()
  }
}

onMounted(() => {
  settingsStore.init()
  toolStore.init()
  window.addEventListener('keydown', handleGlobalKeydown)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleGlobalKeydown)
})
</script>
