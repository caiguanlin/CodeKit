import { app } from 'electron'
import { join } from 'path'
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'

class JsonStore {
  private filePath: string
  private data: Record<string, any> = {}

  constructor() {
    const userData = app.getPath('userData')
    const storeDir = join(userData, 'config')
    if (!existsSync(storeDir)) {
      mkdirSync(storeDir, { recursive: true })
    }
    this.filePath = join(storeDir, 'store.json')
    this.load()
  }

  private load(): void {
    try {
      if (existsSync(this.filePath)) {
        const raw = readFileSync(this.filePath, 'utf-8')
        this.data = JSON.parse(raw)
      } else {
        this.data = {}
      }
    } catch {
      this.data = {}
    }
  }

  public get<T = any>(key: string, defaultValue?: T): T {
    return (this.data[key] !== undefined ? this.data[key] : defaultValue) as T
  }

  public set(key: string, value: any): void {
    this.data[key] = value
    try {
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (err) {
      console.error('Failed to write store file:', err)
    }
  }

  public delete(key: string): void {
    delete this.data[key]
    try {
      writeFileSync(this.filePath, JSON.stringify(this.data, null, 2), 'utf-8')
    } catch (err) {
      console.error('Failed to update store file:', err)
    }
  }

  public getAll(): Record<string, any> {
    return { ...this.data }
  }
}

export const store = new JsonStore()
