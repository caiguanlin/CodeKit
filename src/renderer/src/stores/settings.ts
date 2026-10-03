import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'dark' | 'light'>('dark')
  const isSidebarCollapsed = ref(false)
  const isSidebarManuallyToggled = ref(false)
  const isCommandPaletteOpen = ref(false)

  function applyThemeClass(t: 'dark' | 'light'): void {
    if (typeof document !== 'undefined') {
      if (t === 'dark') {
        document.documentElement.classList.add('dark')
        document.documentElement.classList.remove('light')
      } else {
        document.documentElement.classList.remove('dark')
        document.documentElement.classList.add('light')
      }
    }
  }

  // 从本地持久化存储初始化
  async function init(): Promise<void> {
    if (window.electronAPI) {
      const savedTheme = await window.electronAPI.getStore('theme', 'dark')
      if (savedTheme === 'light' || savedTheme === 'dark') {
        theme.value = savedTheme
      }

      const savedSidebar = await window.electronAPI.getStore('isSidebarCollapsed', false)
      isSidebarCollapsed.value = savedSidebar
    }
    applyThemeClass(theme.value)
  }

  async function setTheme(targetTheme: 'dark' | 'light'): Promise<void> {
    theme.value = targetTheme
    applyThemeClass(targetTheme)
    if (window.electronAPI) {
      await window.electronAPI.setStore('theme', theme.value)
    }
  }

  async function toggleTheme(): Promise<void> {
    const next = theme.value === 'dark' ? 'light' : 'dark'
    await setTheme(next)
  }

  function toggleSidebar(): void {
    isSidebarManuallyToggled.value = true
    isSidebarCollapsed.value = !isSidebarCollapsed.value
    if (window.electronAPI) {
      window.electronAPI.setStore('isSidebarCollapsed', isSidebarCollapsed.value)
    }
  }

  function setSidebarCollapsed(val: boolean, isManual = false): void {
    if (isManual) {
      isSidebarManuallyToggled.value = true
      if (window.electronAPI) {
        window.electronAPI.setStore('isSidebarCollapsed', val)
      }
    }
    isSidebarCollapsed.value = val
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
    isSidebarCollapsed,
    isSidebarManuallyToggled,
    isCommandPaletteOpen,
    init,
    setTheme,
    toggleTheme,
    toggleSidebar,
    setSidebarCollapsed,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette
  }
})
