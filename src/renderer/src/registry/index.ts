import type { ToolMetadata, CategoryItem, ToolCategory } from '@/types/tool'

export const TOOL_CATEGORIES: CategoryItem[] = [
  {
    key: 'format',
    name: '数据转换',
    icon: 'LayersOutline',
    description: 'JSON、代码转换与格式化工具'
  },
  {
    key: 'timestamp',
    name: '时间日期',
    icon: 'TimeOutline',
    description: 'Unix 时间戳互转与实时时钟'
  },
  {
    key: 'codec',
    name: '编解码/加密',
    icon: 'KeyOutline',
    description: 'Base64、URL、Unicode 与哈希散列计算'
  },
  {
    key: 'generator',
    name: '研发生成器',
    icon: 'ConstructOutline',
    description: 'UUID、雪花 ID、密码批量生成'
  },
  {
    key: 'text',
    name: '文本与正则',
    icon: 'DocumentTextOutline',
    description: '文本双栏 Diff 对比、正则表达式测试'
  },
  {
    key: 'cron',
    name: '任务调度',
    icon: 'CalendarOutline',
    description: 'Cron 表达式解析与未来时间预测'
  }
]

export const TOOLS: ToolMetadata[] = [
  {
    id: 'json',
    name: 'JSON 工具盒',
    shortName: 'JSON',
    description: 'JSON 格式化、压缩与语法校验',
    category: 'format',
    icon: 'CodeSlashOutline',
    accentColor: '#10b981',
    keywords: ['json', 'format', 'minify', 'validate', 'geshihua', 'yasuo'],
    route: '/tools/json',
    component: () => import('@/tools/json/index.vue')
  },
  {
    id: 'timestamp',
    name: '时间戳转换器',
    shortName: '时间戳',
    description: '10位/13位时间戳与日期格式互转、实时毫秒时钟、时区计算',
    category: 'timestamp',
    icon: 'TimeOutline',
    accentColor: '#3b82f6',
    keywords: ['timestamp', 'time', 'date', 'shijianchuo', 'clock', 'utc', 'unix'],
    route: '/tools/timestamp',
    component: () => import('@/tools/timestamp/index.vue')
  },
  {
    id: 'codec',
    name: '编解码与哈希',
    shortName: '编解码/哈希',
    description: 'Base64、URL 编解码、Unicode、Hex 及 MD5/SHA 哈希计算',
    category: 'codec',
    icon: 'KeyOutline',
    accentColor: '#8b5cf6',
    keywords: ['base64', 'url', 'encode', 'decode', 'md5', 'sha256', 'hash', 'hex', 'unicode'],
    route: '/tools/codec',
    component: () => import('@/tools/codec/index.vue')
  },
  {
    id: 'generator',
    name: '万能生成器',
    shortName: '生成器',
    description: '批量生成 UUID v4/v7、雪花 ID 和高强度密码',
    category: 'generator',
    icon: 'ConstructOutline',
    accentColor: '#f59e0b',
    keywords: ['id', 'uuid', 'guid', 'snowflake', '雪花', 'xuehua', 'password', 'generator', 'shengchengqi', 'random', 'mima'],
    route: '/tools/generator',
    component: () => import('@/tools/generator/index.vue')
  },
  {
    id: 'text',
    name: '文本处理与对比',
    shortName: '文本与Diff',
    description: 'Monaco 双栏文本差异对比、正则表达式测试器、文本多维统计',
    category: 'text',
    icon: 'DocumentTextOutline',
    accentColor: '#ec4899',
    keywords: ['diff', 'compare', 'regex', 'zhengze', 'words', 'duibi'],
    route: '/tools/text',
    component: () => import('@/tools/text/index.vue')
  },
  {
    id: 'naming',
    name: '命名格式转换',
    shortName: '命名转换',
    description: '批量转换驼峰、下划线、中划线及大写命名，支持逐条复制与全部复制',
    category: 'text',
    icon: 'TextOutline',
    accentColor: '#6366f1',
    keywords: ['naming', 'case', 'camelcase', 'pascalcase', 'snake', 'kebab', 'constant', 'uppercase', 'mingming', '驼峰', '下划线', '中划线', '大写'],
    route: '/tools/naming',
    component: () => import('@/tools/naming/index.vue')
  },
  {
    id: 'cron',
    name: 'Cron 表达式解析',
    shortName: 'Cron 表达式',
    description: 'Cron 规则中文语义翻译、未来执行时间预测与常用模版',
    category: 'cron',
    icon: 'CalendarOutline',
    accentColor: '#06b6d4',
    keywords: ['cron', 'crontab', 'schedule', 'dingshirenwu', 'plan', 'time'],
    route: '/tools/cron',
    component: () => import('@/tools/cron/index.vue')
  }
]

export function getToolById(id: string): ToolMetadata | undefined {
  return TOOLS.find((tool) => tool.id === id)
}

export function getToolsByCategory(category: ToolCategory): ToolMetadata[] {
  return TOOLS.filter((tool) => tool.category === category)
}
