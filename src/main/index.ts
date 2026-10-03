import { app, BrowserWindow } from 'electron'
import { electronApp, optimizer } from '@electron-toolkit/utils'
import { createMainWindow, getMainWindow } from './window'
import { registerIpcHandlers } from './ipc'
import { setupTray } from './tray'
import { registerGlobalShortcuts, unregisterGlobalShortcuts } from './shortcut'

// 单实例锁定：确保桌面应用同一时刻只有一个实例运行
const gotTheLock = app.requestSingleInstanceLock()

if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', () => {
    const win = getMainWindow()
    if (win) {
      if (win.isMinimized()) win.restore()
      win.show()
      win.focus()
    }
  })

  app.whenReady().then(() => {
    // 设置 Windows 应用用户模型 ID
    electronApp.setAppUserModelId('com.codekit.app')

    // 默认优化窗口 F12 与 DevTools 快捷键 (开发模式)
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    // 注册 IPC 调度管道
    registerIpcHandlers()

    // 创建主窗口
    createMainWindow()

    // 托盘管理器
    setupTray()

    // 注册全局唤醒热键
    registerGlobalShortcuts()

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createMainWindow()
      }
    })
  })

  app.on('will-quit', () => {
    unregisterGlobalShortcuts()
  })

  // 关闭全部窗口时不立即退出（支持后台托盘常驻，若用户需完全退出可通过托盘或直接退出）
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      // 保持托盘运行
    }
  })
}
