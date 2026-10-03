import { contextBridge, ipcRenderer } from 'electron'

// 暴露给渲染进程的安全 API 接口
const electronAPI = {
  // 窗口控制
  minimizeWindow: (): Promise<void> => ipcRenderer.invoke('window:minimize'),
  maximizeWindow: (): Promise<boolean> => ipcRenderer.invoke('window:maximize'),
  closeWindow: (): Promise<void> => ipcRenderer.invoke('window:close'),
  isMaximized: (): Promise<boolean> => ipcRenderer.invoke('window:isMaximized'),
  toggleAlwaysOnTop: (): Promise<boolean> => ipcRenderer.invoke('window:toggleAlwaysOnTop'),
  isAlwaysOnTop: (): Promise<boolean> => ipcRenderer.invoke('window:isAlwaysOnTop'),

  // 本地配置读写
  getStore: (key: string, defaultValue?: any): Promise<any> =>
    ipcRenderer.invoke('store:get', key, defaultValue),
  setStore: (key: string, value: any): Promise<boolean> =>
    ipcRenderer.invoke('store:set', key, value),
  deleteStore: (key: string): Promise<boolean> =>
    ipcRenderer.invoke('store:delete', key),

  // 剪贴板
  readClipboard: (): Promise<string> => ipcRenderer.invoke('clipboard:readText'),
  writeClipboard: (text: string): Promise<boolean> =>
    ipcRenderer.invoke('clipboard:writeText', text),

  // 系统操作
  openExternal: (url: string): Promise<void> =>
    ipcRenderer.invoke('shell:openExternal', url),
  getAppInfo: (): Promise<{
    version: string
    name: string
    platform: string
    arch: string
  }> => ipcRenderer.invoke('app:getInfo')
}

// 通过 contextBridge 安全注入到 window
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electronAPI', electronAPI)
  } catch (error) {
    console.error('Failed to expose electronAPI:', error)
  }
} else {
  // @ts-ignore (fallback for non-context-isolated)
  window.electronAPI = electronAPI
}
