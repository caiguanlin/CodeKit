import { defineStore, acceptHMRUpdate } from 'pinia'
import { ref } from 'vue'

export const useToolStore = defineStore('tools', () => {
  const recentTools = ref<string[]>(['codec', 'timestamp', 'json'])
  const activeToolId = ref<string>('codec')

  async function init(): Promise<void> {
    if (window.electronAPI) {
      const savedRecents = await window.electronAPI.getStore('recentTools', ['codec', 'timestamp', 'json'])
      if (Array.isArray(savedRecents) && savedRecents.length > 0) {
        recentTools.value = savedRecents.slice(0, 3)
      }
    }
  }

  function addRecent(id: string): void {
    if (!id) return
    // 若该工具已在当前常用工具（前3个）中，则保持原有位置与排序不变，绝不重复置顶
    if (recentTools.value.slice(0, 3).includes(id)) {
      return
    }
    // 只有当访问了不在前三中的新工具时，才将其加入最前并保留最近3个
    recentTools.value = [id, ...recentTools.value.filter((item) => item !== id)].slice(0, 3)
    if (window.electronAPI) {
      window.electronAPI.setStore('recentTools', [...recentTools.value])
    }
  }

  function setActiveTool(id: string): void {
    activeToolId.value = id
    addRecent(id)
  }

  return {
    recentTools,
    activeToolId,
    init,
    addRecent,
    setActiveTool
  }
})

if (import.meta.hot) {
  import.meta.hot.accept(acceptHMRUpdate(useToolStore, import.meta.hot))
}
