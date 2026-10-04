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
    name: '加/解密',
    icon: 'KeyOutline',
    description: 'Base64、哈希与 AES / RSA 加解密'
  },
  {
    key: 'generator',
    name: '研发生成器',
    icon: 'ConstructOutline',
    description: 'UUID、雪花 ID、密码批量生成与二维码生成'
  },
  {
    key: 'text',
    name: '文本与正则',
    icon: 'DocumentTextOutline',
    description: '文本双栏 Diff 对比、正则表达式测试'
  }
]

export const TOOLS: ToolMetadata[] = [
  {
    id: 'json',
    name: 'JSON 工具盒',
    shortName: 'JSON',
    description: 'JSON 格式化、压缩、JSON 字符串转 JSON 与语法校验，保留大整数精度',
    category: 'format',
    icon: 'CodeSlashOutline',
    accentColor: '#10b981',
    keywords: ['json', 'format', 'minify', 'validate', 'unescape', 'geshihua', 'yasuo', '字符串', '转义', '还原', 'debug'],
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
    name: '加/解密',
    shortName: '加/解密',
    description: 'Base64 编解码、MD5/SHA 哈希、AES/RSA 密钥生成与加解密',
    category: 'codec',
    icon: 'KeyOutline',
    accentColor: '#8b5cf6',
    keywords: ['base64', 'encode', 'decode', 'md5', 'sha1', 'sha256', 'sha512', 'hash', 'aes', 'rsa', '密钥', '公钥', '私钥', '对称', '非对称', '加密', '解密', '哈希', 'jiami', 'jiemi'],
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
    id: 'qrcode',
    name: '二维码工具',
    shortName: '二维码',
    description: '文本与链接生成二维码，支持微信扫码与导出 PNG 图片',
    category: 'generator',
    icon: 'QrCodeOutline',
    accentColor: '#06b6d4',
    keywords: ['qrcode', 'qr', 'erweima', '二维码', '微信', '扫码', 'png'],
    route: '/tools/qrcode',
    component: () => import('@/tools/qrcode/index.vue')
  },
  {
    id: 'text',
    name: '文本处理与对比',
    shortName: '文本与Diff',
    description: 'Monaco 双栏文本差异对比，支持多种语言与单栏混排',
    category: 'text',
    icon: 'DocumentTextOutline',
    accentColor: '#ec4899',
    keywords: ['diff', 'compare', 'text', 'wenben', 'duibi', '文本', '对比'],
    route: '/tools/text',
    component: () => import('@/tools/text/index.vue')
  },
  {
    id: 'regex',
    name: '正则表达式',
    shortName: '正则',
    description: '正则实时匹配、捕获组查看、常用预设与 JavaScript / TypeScript 代码一键复制',
    category: 'text',
    icon: 'CodeSlashOutline',
    accentColor: '#14b8a6',
    keywords: ['regex', 'regexp', 'zhengze', '正则', '表达式', '匹配'],
    route: '/tools/regex',
    component: () => import('@/tools/regex/index.vue')
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
  }
]

export function getToolById(id: string): ToolMetadata | undefined {
  return TOOLS.find((tool) => tool.id === id)
}

export function getToolsByCategory(category: ToolCategory): ToolMetadata[] {
  return TOOLS.filter((tool) => tool.category === category)
}
