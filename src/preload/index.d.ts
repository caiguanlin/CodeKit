export interface IElectronAPI {
  minimizeWindow: () => Promise<void>
  maximizeWindow: () => Promise<boolean>
  closeWindow: () => Promise<void>
  isMaximized: () => Promise<boolean>
  toggleAlwaysOnTop: () => Promise<boolean>
  isAlwaysOnTop: () => Promise<boolean>

  getStore: (key: string, defaultValue?: any) => Promise<any>
  setStore: (key: string, value: any) => Promise<boolean>
  deleteStore: (key: string) => Promise<boolean>

  readClipboard: () => Promise<string>
  writeClipboard: (text: string) => Promise<boolean>

  openExternal: (url: string) => Promise<void>
  getAppInfo: () => Promise<{
    version: string
    name: string
    platform: string
    arch: string
  }>
}

declare global {
  interface Window {
    electronAPI: IElectronAPI
  }
}
