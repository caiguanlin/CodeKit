<template>
  <div class="h-full flex flex-col space-y-3">
    <!-- 顶部操作工具栏 -->
    <div class="flex items-center justify-between flex-wrap gap-2 px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] transition-colors">
      <div class="flex items-center space-x-2 flex-wrap">
        <n-button size="small" type="primary" secondary @click="formatJson(2)">
          格式化 (2空格)
        </n-button>
        <n-button size="small" secondary @click="formatJson(4)">
          4空格
        </n-button>
        <n-button size="small" secondary @click="minifyJson">
          紧凑压缩
        </n-button>
        <n-button size="small" secondary @click="escapeJson">
          转义字符串
        </n-button>
        <n-button size="small" secondary @click="unescapeJson">
          去除转义
        </n-button>
        <n-button size="small" secondary @click="convertToTs">
          转 TS 接口
        </n-button>
        <n-button size="small" secondary @click="convertToGo">
          转 Go 结构体
        </n-button>
      </div>

      <div class="flex items-center space-x-2">
        <n-button size="small" secondary @click="loadSample">
          示例
        </n-button>
        <n-button size="small" secondary @click="copyContent">
          复制
        </n-button>
        <n-button size="small" quaternary @click="clearContent">
          清空
        </n-button>
      </div>
    </div>

    <!-- 主编辑区域 (支持分栏查看转换代码) -->
    <div class="flex-1 flex space-x-3 min-h-0">
      <!-- 左侧：JSON Monaco 编辑器 -->
      <div class="flex-1 flex flex-col min-w-0 h-full">
        <MonacoEditor
          ref="editorRef"
          v-model="jsonInput"
          language="json"
          :theme="settingsStore.theme === 'dark' ? 'vs-dark' : 'vs'"
          @change="validateJson"
        />
      </div>

      <!-- 右侧：代码转换输出面板 (当转换为 TS / Go 时展开) -->
      <div v-if="convertedCode" class="w-1/2 flex flex-col min-w-0 h-full bg-[var(--card-bg)] border border-[var(--border-color)] rounded-lg overflow-hidden transition-colors">
        <div class="h-9 px-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--card-sub-bg)]">
          <span class="text-xs font-semibold text-emerald-600 dark:text-emerald-400">{{ convertedType === 'ts' ? 'TypeScript 定义' : 'Go Struct 定义' }}</span>
          <div class="flex items-center space-x-1">
            <n-button size="tiny" secondary @click="copyConverted">复制定义</n-button>
            <n-button size="tiny" quaternary @click="convertedCode = ''">关闭</n-button>
          </div>
        </div>
        <div class="flex-1 min-h-0">
          <MonacoEditor
            v-model="convertedCode"
            :language="convertedType === 'ts' ? 'typescript' : 'go'"
            :theme="settingsStore.theme === 'dark' ? 'vs-dark' : 'vs'"
            :read-only="true"
          />
        </div>
      </div>
    </div>

    <!-- 底部状态指示栏 -->
    <div class="h-8 px-3 flex items-center justify-between rounded bg-[var(--card-bg)] border border-[var(--border-color)] text-xs transition-colors">
      <div class="flex items-center space-x-2">
        <span
          v-if="validationStatus === 'valid'"
          class="flex items-center text-emerald-600 dark:text-emerald-400 font-medium"
        >
          <span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse"></span>
          JSON 格式有效
        </span>
        <span
          v-else-if="validationStatus === 'invalid'"
          class="flex items-center text-red-500 dark:text-red-400 font-medium"
        >
          <span class="w-2 h-2 rounded-full bg-red-500 mr-1.5"></span>
          {{ errorMessage }}
        </span>
        <span v-else class="text-zinc-400 dark:text-zinc-500">就绪</span>
      </div>

      <div class="flex items-center space-x-4 text-zinc-500 dark:text-zinc-400 font-mono text-[11px]">
        <span>字符数: {{ jsonInput.length }}</span>
        <span>行数: {{ lineCount }}</span>
        <span>大小: {{ jsonByteSize }} KB</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import MonacoEditor from '@/components/MonacoEditor.vue'
import { useSettingsStore } from '@/stores/settings'

const message = useMessage()
const settingsStore = useSettingsStore()

const jsonInput = ref('')
const convertedCode = ref('')
const convertedType = ref<'ts' | 'go'>('ts')
const validationStatus = ref<'valid' | 'invalid' | 'empty'>('empty')
const errorMessage = ref('')
const editorRef = ref<InstanceType<typeof MonacoEditor> | null>(null)

const sampleJson = {
  name: "CodeKit",
  version: "1.0.0",
  description: "面向开发者的现代化桌面代码工具盒",
  features: ["JSON 格式化", "时间戳互转", "编解码与哈希", "研发生成器", "文本对比与正则", "Cron 表达式"],
  author: {
    name: "CodeKit Team",
    github: "https://github.com/codekit"
  },
  settings: {
    theme: "dark",
    autoFormatOnPaste: true,
    historyLimit: 50
  }
}

onMounted(() => {
  loadSample()
})

const lineCount = computed(() => {
  if (!jsonInput.value) return 0
  return jsonInput.value.split('\n').length
})

const jsonByteSize = computed(() => {
  if (!jsonInput.value) return '0.00'
  return (new Blob([jsonInput.value]).size / 1024).toFixed(2)
})

function validateJson(): boolean {
  if (!jsonInput.value.trim()) {
    validationStatus.value = 'empty'
    errorMessage.value = ''
    return false
  }

  try {
    JSON.parse(jsonInput.value)
    validationStatus.value = 'valid'
    errorMessage.value = ''
    return true
  } catch (err: any) {
    validationStatus.value = 'invalid'
    errorMessage.value = err.message || 'JSON 语法错误'
    return false
  }
}

function formatJson(space = 2): void {
  if (!validateJson()) {
    message.error('当前 JSON 内容无效，无法格式化')
    return
  }
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed, null, space)
    message.success(`已格式化 (${space} 空格缩进)`)
  } catch (err: any) {
    message.error(err.message)
  }
}

function minifyJson(): void {
  if (!validateJson()) {
    message.error('当前 JSON 内容无效，无法压缩')
    return
  }
  try {
    const parsed = JSON.parse(jsonInput.value)
    jsonInput.value = JSON.stringify(parsed)
    message.success('已紧凑压缩为单行')
  } catch (err: any) {
    message.error(err.message)
  }
}

function escapeJson(): void {
  try {
    jsonInput.value = JSON.stringify(jsonInput.value)
    validateJson()
    message.success('已转义为字符串')
  } catch (err: any) {
    message.error(err.message)
  }
}

function unescapeJson(): void {
  try {
    const raw = jsonInput.value.trim()
    if (raw.startsWith('"') && raw.endsWith('"')) {
      jsonInput.value = JSON.parse(raw)
    } else {
      // 替换转义斜杠
      jsonInput.value = raw.replace(/\\"/g, '"').replace(/\\\\/g, '\\')
    }
    validateJson()
    message.success('已去除转义')
  } catch (err: any) {
    message.error(err.message)
  }
}

function convertToTs(): void {
  if (!validateJson()) {
    message.error('请先输入有效的 JSON 数据')
    return
  }
  try {
    const obj = JSON.parse(jsonInput.value)
    convertedType.value = 'ts'
    convertedCode.value = generateTypeScriptInterface(obj, 'RootObject')
    message.success('已生成 TypeScript 接口')
  } catch (err: any) {
    message.error(err.message)
  }
}

function convertToGo(): void {
  if (!validateJson()) {
    message.error('请先输入有效的 JSON 数据')
    return
  }
  try {
    const obj = JSON.parse(jsonInput.value)
    convertedType.value = 'go'
    convertedCode.value = generateGoStruct(obj, 'RootObject')
    message.success('已生成 Go Struct 结构体')
  } catch (err: any) {
    message.error(err.message)
  }
}

function generateTypeScriptInterface(obj: any, rootName = 'RootObject'): string {
  const interfaces: string[] = []

  function parseObject(val: any, name: string): string {
    if (Array.isArray(val)) {
      if (val.length === 0) return 'any[]'
      const firstType = parseObject(val[0], `${name}Item`)
      return `${firstType}[]`
    }
    if (val !== null && typeof val === 'object') {
      const typeName = capitalize(name)
      const lines: string[] = [`export interface ${typeName} {`]
      for (const [key, v] of Object.entries(val)) {
        const propType = parseObject(v, `${name}_${key}`)
        lines.push(`  ${key}: ${propType};`)
      }
      lines.push('}')
      interfaces.push(lines.join('\n'))
      return typeName
    }
    if (val === null) return 'null'
    return typeof val
  }

  parseObject(obj, rootName)
  return interfaces.join('\n\n')
}

function generateGoStruct(obj: any, rootName = 'RootObject'): string {
  const structs: string[] = []

  function parseObject(val: any, name: string): string {
    if (Array.isArray(val)) {
      if (val.length === 0) return '[]interface{}'
      const firstType = parseObject(val[0], `${name}Item`)
      return `[]${firstType}`
    }
    if (val !== null && typeof val === 'object') {
      const typeName = capitalize(name)
      const lines: string[] = [`type ${typeName} struct {`]
      for (const [key, v] of Object.entries(val)) {
        const fieldName = capitalize(key)
        const fieldType = parseObject(v, `${name}_${key}`)
        lines.push(`\t${fieldName} ${fieldType} \`json:"${key}"\``)
      }
      lines.push('}')
      structs.push(lines.join('\n'))
      return typeName
    }
    if (typeof val === 'number') {
      return Number.isInteger(val) ? 'int64' : 'float64'
    }
    if (typeof val === 'boolean') return 'bool'
    if (typeof val === 'string') return 'string'
    return 'interface{}'
  }

  parseObject(obj, rootName)
  return structs.join('\n\n')
}

function capitalize(s: string): string {
  return s ? s.charAt(0).toUpperCase() + s.slice(1).replace(/[^a-zA-Z0-9]/g, '') : ''
}

function loadSample(): void {
  jsonInput.value = JSON.stringify(sampleJson, null, 2)
  validateJson()
}

async function copyContent(): Promise<void> {
  if (!jsonInput.value) return
  if (window.electronAPI) {
    await window.electronAPI.writeClipboard(jsonInput.value)
  } else {
    navigator.clipboard.writeText(jsonInput.value)
  }
  message.success('已复制到剪贴板')
}

async function copyConverted(): Promise<void> {
  if (!convertedCode.value) return
  if (window.electronAPI) {
    await window.electronAPI.writeClipboard(convertedCode.value)
  } else {
    navigator.clipboard.writeText(convertedCode.value)
  }
  message.success('已复制生成的结构代码')
}

function clearContent(): void {
  jsonInput.value = ''
  convertedCode.value = ''
  validationStatus.value = 'empty'
}
</script>
