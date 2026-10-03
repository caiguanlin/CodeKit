import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'dark' | 'light'>('dark')
  const isAlwaysOnTop = ref(false)
  const isSidebarCollapsed = ref(false)
  const isCommandPaletteOpen = ref(false)

  // 从本地持久化存储初始化
  async function init(): Promise<void> {
    if (window.electronAPI) {
      const savedTheme = await window.electronAPI.getStore('theme', 'dark')
      if (savedTheme) theme.value = savedTheme

      const savedTop = await window.electronAPI.isAlwaysOnTop()
      isAlwaysOnTop.value = savedTop

      const savedSidebar = await window.electronAPI.getStore('isSidebarCollapsed', false)
      isSidebarCollapsed.value = savedSidebar
    }
  }

  async function toggleTheme(): Promise<void> {
    theme.value = theme.value === 'dark' ? 'light' : 'dark'
    if (window.electronAPI) {
      await window.electronAPI.setStore('theme', theme.value)
    }
  }

  async function toggleAlwaysOnTop(): Promise<void> {
    if (window.electronAPI) {
      const newState = await window.electronAPI.toggleAlwaysOnTop()
      isAlwaysOnTop.value = newState
    } else {
      isAlwaysOnTop.value = !isAlwaysOnTop.value
    }
  }

  function toggleSidebar(): void {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    if (window.electronAPI) {
      window.electronAPI.setStore('isSidebarCollapsed', isSidebarCollapsed.value)
    }
  }

  function openCommandPalette(): void {
    isCommandPaletteOpen.value = true
  }

  function closeCommandPalette(): void {
    isCommandPaletteOpen.value = false
  }

  function toggleCommandPalette(): void {
    isCommandPaletteOpen.value = !isCommandPaletteOpen.value
  }

  return {
    theme,
    isAlwaysOnTop,
    isSidebarCollapsed,
    isCommandPaletteOpen,
    init,
    toggleTheme,
    toggleAlwaysOnTop,
    toggleSidebar,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette
  }
})
