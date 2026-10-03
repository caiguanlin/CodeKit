import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useSettingsStore = defineStore('settings', () => {
  const theme = ref<'dark' | 'light'>('dark')
  const isAlwaysOnTop = ref(false)
  const isSidebarCollapsed = ref(false)
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

      const savedTop = await window.electronAPI.isAlwaysOnTop()
      isAlwaysOnTop.value = savedTop

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
    setTheme,
    toggleTheme,
    toggleAlwaysOnTop,
    toggleSidebar,
    openCommandPalette,
    closeCommandPalette,
    toggleCommandPalette
  }
})
