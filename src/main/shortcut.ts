import { globalShortcut } from 'electron'
import { getMainWindow } from './window'

export function registerGlobalShortcuts(): void {
  // 全局唤醒快捷键：Alt+Space (或 macOS 上的 Option+Space)
  const shortcutKey = 'Alt+Space'

  try {
    const ret = globalShortcut.register(shortcutKey, () => {
      const win = getMainWindow()
      if (!win) return

      if (win.isVisible() && win.isFocused()) {
        win.hide()
      } else {
        win.show()
        win.focus()
      }
    })

    if (!ret) {
      console.warn(`Failed to register global shortcut: ${shortcutKey}`)
    }
  } catch (err) {
    console.error('Error registering global shortcut:', err)
  }
}

export function unregisterGlobalShortcuts(): void {
  globalShortcut.unregisterAll()
}
