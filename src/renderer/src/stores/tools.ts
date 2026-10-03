import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useToolStore = defineStore('tools', () => {
  const favorites = ref<string[]>(['json', 'timestamp', 'codec'])
  const recentTools = ref<string[]>([])
  const activeToolId = ref<string>('json')

  async function init(): Promise<void> {
    if (window.electronAPI) {
      const savedFavorites = await window.electronAPI.getStore('favorites', ['json', 'timestamp', 'codec'])
      if (Array.isArray(savedFavorites)) favorites.value = savedFavorites

      const savedRecents = await window.electronAPI.getStore('recentTools', ['json', 'timestamp'])
      if (Array.isArray(savedRecents)) recentTools.value = savedRecents
    }
  }

  function toggleFavorite(id: string): void {
    const idx = favorites.value.indexOf(id)
    if (idx >= 0) {
      favorites.value.splice(idx, 1)
    } else {
      favorites.value.push(id)
    }
    if (window.electronAPI) {
      window.electronAPI.setStore('favorites', [...favorites.value])
    }
  }

  function isFavorite(id: string): boolean {
    return favorites.value.includes(id)
  }

  function addRecent(id: string): void {
    recentTools.value = [id, ...recentTools.value.filter((item) => item !== id)].slice(0, 8)
    if (window.electronAPI) {
      window.electronAPI.setStore('recentTools', [...recentTools.value])
    }
  }

  function setActiveTool(id: string): void {
    activeToolId.value = id
    addRecent(id)
  }

  return {
    favorites,
    recentTools,
    activeToolId,
    init,
    toggleFavorite,
    isFavorite,
    addRecent,
    setActiveTool
  }
})
