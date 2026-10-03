import type { Component } from 'vue'

export type ToolCategory =
  | 'format'
  | 'timestamp'
  | 'codec'
  | 'generator'
  | 'text'
  | 'cron'

export interface CategoryItem {
  key: ToolCategory
  name: string
  icon: string
  description: string
}

export interface ToolMetadata {
  id: string
  name: string
  shortName: string
  description: string
  category: ToolCategory
  icon: string
  accentColor?: string
  keywords: string[]
  route: string
  component: () => Promise<Component | any>
}
