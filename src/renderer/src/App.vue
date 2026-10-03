<template>
  <n-config-provider
    :theme="settingsStore.theme === 'dark' ? darkTheme : null"
    :theme-overrides="currentThemeOverrides"
  >
    <n-message-provider>
      <n-dialog-provider>
        <div class="h-full w-full flex flex-col overflow-hidden bg-[var(--app-bg)] text-[var(--text-primary)] transition-colors duration-200">
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
import { computed, onMounted, onBeforeUnmount } from 'vue'
import { darkTheme, type GlobalThemeOverrides } from 'naive-ui'
import TitleBar from '@/components/TitleBar.vue'
import MainLayout from '@/layouts/MainLayout.vue'
import CommandPalette from '@/components/CommandPalette.vue'
import { useSettingsStore } from '@/stores/settings'
import { useToolStore } from '@/stores/tools'

const settingsStore = useSettingsStore()
const toolStore = useToolStore()

// 深色主题配置
const darkThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#10b981',
    primaryColorHover: '#34d399',
    primaryColorPressed: '#059669',
    primaryColorSuppl: '#10b981',
    bodyColor: '#121214',
    cardColor: '#18181c',
    modalColor: '#1e1e24',
    popoverColor: '#1e1e24',
    borderColor: '#27272a',
    textColorBase: '#f4f4f5',
    textColor1: '#f4f4f5',
    textColor2: '#d4d4d8',
    textColor3: '#71717a'
  },
  Button: {
    textColorPrimary: '#ffffff'
  },
  Input: {
    color: '#202026',
    border: '1px solid #2e2e38',
    borderHover: '1px solid #10b981',
    borderFocus: '1px solid #10b981'
  },
  Tabs: {
    tabTextColorSegment: '#a1a1aa',
    tabTextColorActiveSegment: '#f4f4f5',
    tabColorSegment: '#121214'
  }
}

// 浅色主题配置
const lightThemeOverrides: GlobalThemeOverrides = {
  common: {
    primaryColor: '#10b981',
    primaryColorHover: '#059669',
    primaryColorPressed: '#047857',
    primaryColorSuppl: '#10b981',
    bodyColor: '#f4f4f5',
    cardColor: '#ffffff',
    modalColor: '#ffffff',
    popoverColor: '#ffffff',
    borderColor: '#e4e4e7',
    textColorBase: '#18181b',
    textColor1: '#18181b',
    textColor2: '#52525b',
    textColor3: '#a1a1aa'
  },
  Button: {
    textColorPrimary: '#ffffff'
  },
  Input: {
    color: '#ffffff',
    border: '1px solid #e4e4e7',
    borderHover: '1px solid #10b981',
    borderFocus: '1px solid #10b981'
  },
  Tabs: {
    tabTextColorSegment: '#71717a',
    tabTextColorActiveSegment: '#18181b',
    tabColorSegment: '#f4f4f5'
  }
}

const currentThemeOverrides = computed<GlobalThemeOverrides>(() => {
  return settingsStore.theme === 'dark' ? darkThemeOverrides : lightThemeOverrides
})

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
