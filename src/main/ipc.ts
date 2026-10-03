import { ipcMain, BrowserWindow, clipboard, shell, app } from 'electron'
import { store } from './store'

export function registerIpcHandlers(): void {
  // 窗口控制
  ipcMain.handle('window:minimize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.minimize()
  })

  ipcMain.handle('window:maximize', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    if (win) {
      if (win.isMaximized()) {
        win.unmaximize()
      } else {
        win.maximize()
      }
      return win.isMaximized()
    }
    return false
  })

  ipcMain.handle('window:close', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    win?.close()
  })

  ipcMain.handle('window:isMaximized', (event) => {
    const win = BrowserWindow.fromWebContents(event.sender)
    return win?.isMaximized() ?? false
  })

  // 本地配置存储
  ipcMain.handle('store:get', (_event, key: string, defaultValue?: any) => {
    return store.get(key, defaultValue)
  })

  ipcMain.handle('store:set', (event, key: string, value: any) => {
    store.set(key, value)
    if (key === 'theme') {
      const win = BrowserWindow.fromWebContents(event.sender)
      win?.setBackgroundColor(value === 'light' ? '#f4f4f5' : '#121214')
    }
    return true
  })

  ipcMain.handle('store:delete', (_event, key: string) => {
    store.delete(key)
    return true
  })

  // 剪贴板
  ipcMain.handle('clipboard:readText', () => {
    return clipboard.readText()
  })

  ipcMain.handle('clipboard:writeText', (_event, text: string) => {
    clipboard.writeText(text)
    return true
  })

  // 外部链接与系统信息
  ipcMain.handle('shell:openExternal', (_event, url: string) => {
    shell.openExternal(url)
  })

  ipcMain.handle('app:getInfo', () => {
    return {
      version: app.getVersion(),
      name: app.getName(),
      platform: process.platform,
      arch: process.arch
    }
  })
}
