import { Tray, Menu, nativeImage, app, BrowserWindow } from 'electron'
import { getMainWindow } from './window'

let tray: Tray | null = null

// 创建默认 16x16 极客绿色托盘图标 (SVG / PNG Base64)
function createDefaultTrayIcon(): Electron.NativeImage {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32">
    <rect width="32" height="32" rx="8" fill="#10b981"/>
    <path d="M10 12 L6 16 L10 20" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M22 12 L26 16 L22 20" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    <path d="M18 9 L14 23" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"/>
  </svg>`
  const buffer = Buffer.from(svg)
  return nativeImage.createFromBuffer(buffer).resize({ width: 16, height: 16 })
}

export function setupTray(): Tray {
  const icon = createDefaultTrayIcon()
  tray = new Tray(icon)
  tray.setToolTip('CodeKit · 代码工具盒')

  const updateContextMenu = (): void => {
    const win = getMainWindow()
    const isVisible = win?.isVisible() ?? false

    const contextMenu = Menu.buildFromTemplate([
      {
        label: isVisible ? '隐藏 CodeKit' : '显示 CodeKit',
        click: () => {
          if (!win) return
          if (win.isVisible()) {
            win.hide()
          } else {
            win.show()
            win.focus()
          }
          updateContextMenu()
        }
      },
      { type: 'separator' },
      {
        label: '退出应用',
        click: () => {
          app.quit()
        }
      }
    ])
    tray?.setContextMenu(contextMenu)
  }

  tray.on('click', () => {
    const win = getMainWindow()
    if (!win) return
    if (win.isVisible()) {
      if (win.isFocused()) {
        win.hide()
      } else {
        win.focus()
      }
    } else {
      win.show()
      win.focus()
    }
    updateContextMenu()
  })

  updateContextMenu()
  return tray
}
