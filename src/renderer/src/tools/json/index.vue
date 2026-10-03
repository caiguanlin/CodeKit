<template>
  <div class="h-full flex flex-col md:flex-row gap-3 min-h-0">
    <!-- 左侧：用户输入的 JSON 格式内容 -->
    <div
      class="flex-1 min-w-0 h-full flex flex-col rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden transition-colors shadow-sm"
    >
      <!-- 左侧顶部工具栏 -->
      <div
        class="h-10 px-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--card-sub-bg)] shrink-0"
      >
        <div class="flex items-center space-x-2">
          <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">JSON 输入</span>
          <span class="text-[11px] text-zinc-400 dark:text-zinc-500">原始数据</span>
        </div>

        <div class="flex items-center space-x-1.5">
          <n-button size="tiny" secondary @click="loadSample()">
            示例
          </n-button>
          <n-button size="tiny" secondary @click="copyContent(jsonInput, '输入内容')">
            复制
          </n-button>
          <n-button size="tiny" quaternary @click="clearContent">
            清空
          </n-button>
        </div>
      </div>

      <!-- 左侧编辑器区域 -->
      <div class="flex-1 min-h-0 p-2">
        <MonacoEditor
          ref="editorRef"
          v-model="jsonInput"
          language="json"
          :theme="monacoTheme"
          :font-size="viewerFontSize"
        />
      </div>

      <!-- 左侧底部状态指示栏 -->
      <div
        class="h-9 px-3 flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--card-sub-bg)] shrink-0 text-xs"
      >
        <div class="flex items-center space-x-2 min-w-0 mr-2">
          <span
            v-if="validationStatus === 'valid'"
            class="flex items-center text-emerald-600 dark:text-emerald-400 font-medium"
          >
            <span class="w-2 h-2 rounded-full bg-emerald-500 mr-1.5 animate-pulse shrink-0"></span>
            JSON 格式有效
          </span>
          <span
            v-else-if="validationStatus === 'invalid'"
            class="flex items-center text-red-500 dark:text-red-400 font-medium truncate"
            :title="errorMessage"
          >
            <span class="w-2 h-2 rounded-full bg-red-500 mr-1.5 shrink-0"></span>
            <span class="truncate">{{ errorMessage }}</span>
          </span>
          <span v-else class="text-zinc-400 dark:text-zinc-500">就绪</span>
        </div>

        <div class="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] shrink-0">
          <span>字符: {{ jsonInput.length }}</span>
          <span>行数: {{ lineCount }}</span>
          <span>大小: {{ jsonByteSize }} KB</span>
        </div>
      </div>
    </div>

    <!-- 右侧：转换输出结果栏（默认显示格式化后的内容，可折叠对象/集合，底部提供各项转换功能） -->
    <div
      class="flex-1 min-w-0 h-full flex flex-col rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden transition-colors shadow-sm"
    >
      <!-- 右侧顶部工具栏 -->
      <div
        class="h-10 px-3 flex items-center justify-between border-b border-[var(--border-color)] bg-[var(--card-sub-bg)] shrink-0 gap-2"
      >
        <div class="flex items-center space-x-2 shrink-0">
          <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">转换结果</span>
          <n-tag size="small" :bordered="false" type="primary" class="text-[11px]">
            {{ currentModeTitle }}
          </n-tag>

          <!-- 当处于 JSON 格式化模式时，允许在树形折叠视图和纯代码视图之间切换 -->
          <div v-if="isJsonFormattedMode" class="flex items-center bg-black/5 dark:bg-white/5 rounded p-0.5 ml-1">
            <button
              type="button"
              class="px-2 py-0.5 text-xs rounded transition-colors"
              :class="viewType === 'tree' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-medium' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'"
              @click="viewType = 'tree'"
            >
              高亮折叠
            </button>
            <button
              type="button"
              class="px-2 py-0.5 text-xs rounded transition-colors"
              :class="viewType === 'code' ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm font-medium' : 'text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200'"
              @click="viewType = 'code'"
            >
              纯代码
            </button>
          </div>
        </div>

        <div class="flex items-center space-x-1.5 shrink-0">
          <!-- 树形视图专有操作：全部展开 / 全部折叠 -->
          <template v-if="isJsonFormattedMode && viewType === 'tree'">
            <n-button size="tiny" quaternary @click="handleExpandAll">
              全部展开
            </n-button>
            <n-button size="tiny" quaternary @click="handleCollapseAll">
              全部折叠
            </n-button>
          </template>

          <!-- 字号调节器 (A- / 15px / A+) -->
          <div class="flex items-center space-x-0.5 bg-black/5 dark:bg-white/5 rounded px-1 py-0.5 text-xs text-zinc-500 dark:text-zinc-400 font-mono">
            <button
              type="button"
              class="px-1 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold"
              title="减小字号"
              @click="handleDecreaseFontSize"
            >
              A-
            </button>
            <span class="px-1 text-[11px] select-none">{{ viewerFontSize }}px</span>
            <button
              type="button"
              class="px-1 hover:text-zinc-900 dark:hover:text-zinc-100 font-bold"
              title="增大字号"
              @click="handleIncreaseFontSize"
            >
              A+
            </button>
          </div>

          <n-button
            v-if="jsonOutput"
            size="tiny"
            quaternary
            title="将转换结果应用覆盖到左侧输入框"
            @click="applyOutputToInput"
          >
            覆盖到输入
          </n-button>
          <n-button
            size="tiny"
            type="primary"
            secondary
            @click="copyContent(jsonOutput, '转换结果')"
          >
            复制结果
          </n-button>
        </div>
      </div>

      <!-- 右侧主体展示区域 -->
      <div class="flex-1 min-h-0 p-2">
        <!-- 1. 树形折叠高亮展示 (参考 JSON.cn 风格，支持对象和集合单独折叠收缩) -->
        <JsonViewer
          v-if="isJsonFormattedMode && viewType === 'tree' && isOutputJsonValid"
          ref="jsonViewerRef"
          :json="jsonOutput"
          :initial-font-size="viewerFontSize"
        />

        <!-- 2. Monaco 代码编辑器模式 (用于纯代码视图、压缩单行、TS / Go 结构体等) -->
        <MonacoEditor
          v-else
          v-model="jsonOutput"
          :language="outputLanguage"
          :theme="monacoTheme"
          :font-size="viewerFontSize"
          :read-only="true"
        />
      </div>

      <!-- 右侧底部转换功能栏（4空格、紧凑压缩、转义字符串等） -->
      <div
        class="min-h-9 px-3 py-1.5 flex items-center justify-between flex-wrap gap-1.5 border-t border-[var(--border-color)] bg-[var(--card-sub-bg)] shrink-0"
      >
        <!-- 转换操作按钮组 -->
        <div class="flex items-center space-x-1 flex-wrap gap-y-1">
          <n-button
            size="tiny"
            :type="currentMode === 'format2' ? 'primary' : 'default'"
            :secondary="currentMode !== 'format2'"
            @click="switchMode('format2')"
          >
            格式化 (2空格)
          </n-button>
          <n-button
            size="tiny"
            :type="currentMode === 'format4' ? 'primary' : 'default'"
            :secondary="currentMode !== 'format4'"
            @click="switchMode('format4')"
          >
            4空格
          </n-button>
          <n-button
            size="tiny"
            :type="currentMode === 'minify' ? 'primary' : 'default'"
            :secondary="currentMode !== 'minify'"
            @click="switchMode('minify')"
          >
            紧凑压缩
          </n-button>
          <n-button
            size="tiny"
            :type="currentMode === 'escape' ? 'primary' : 'default'"
            :secondary="currentMode !== 'escape'"
            @click="switchMode('escape')"
          >
            转义字符串
          </n-button>
          <n-button
            size="tiny"
            :type="currentMode === 'unescape' ? 'primary' : 'default'"
            :secondary="currentMode !== 'unescape'"
            @click="switchMode('unescape')"
          >
            去除转义
          </n-button>
          <n-button
            size="tiny"
            :type="currentMode === 'ts' ? 'primary' : 'default'"
            :secondary="currentMode !== 'ts'"
            @click="switchMode('ts')"
          >
            转 TS 接口
          </n-button>
          <n-button
            size="tiny"
            :type="currentMode === 'go' ? 'primary' : 'default'"
            :secondary="currentMode !== 'go'"
            @click="switchMode('go')"
          >
            转 Go 结构体
          </n-button>
        </div>

        <!-- 右侧输出统计 -->
        <div class="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] shrink-0 ml-auto">
          <span>字符: {{ jsonOutput.length }}</span>
          <span>行数: {{ outputLineCount }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import MonacoEditor from '@/components/MonacoEditor.vue'
import JsonViewer from '@/components/JsonViewer/JsonViewer.vue'
import { useSettingsStore } from '@/stores/settings'

type ConversionMode = 'format2' | 'format4' | 'minify' | 'escape' | 'unescape' | 'ts' | 'go'

const message = useMessage()
const settingsStore = useSettingsStore()

const jsonInput = ref('')
const jsonOutput = ref('')
const currentMode = ref<ConversionMode>('format2')
const viewType = ref<'tree' | 'code'>('tree')
const viewerFontSize = ref(15)
const validationStatus = ref<'valid' | 'invalid' | 'empty'>('empty')
const errorMessage = ref('')
const editorRef = ref<InstanceType<typeof MonacoEditor> | null>(null)
const jsonViewerRef = ref<InstanceType<typeof JsonViewer> | null>(null)

const modeNames: Record<ConversionMode, string> = {
  format2: '格式化 (2空格)',
  format4: '4空格缩进',
  minify: '紧凑压缩',
  escape: '转义字符串',
  unescape: '去除转义',
  ts: 'TypeScript 接口',
  go: 'Go 结构体'
}

const currentModeTitle = computed(() => modeNames[currentMode.value] || '格式化 (2空格)')

const isJsonFormattedMode = computed(() => {
  return currentMode.value === 'format2' || currentMode.value === 'format4'
})

const isOutputJsonValid = computed(() => {
  if (!jsonOutput.value.trim()) return false
  try {
    JSON.parse(jsonOutput.value)
    return true
  } catch {
    return false
  }
})

const monacoTheme = computed(() => {
  return settingsStore.theme === 'dark' ? 'codekit-dark' : 'codekit-light'
})

const outputLanguage = computed(() => {
  switch (currentMode.value) {
    case 'ts':
      return 'typescript'
    case 'go':
      return 'go'
    case 'escape':
    case 'unescape':
    case 'format2':
    case 'format4':
    case 'minify':
    default:
      return 'json'
  }
})

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

const lineCount = computed(() => {
  if (!jsonInput.value) return 0
  return jsonInput.value.split('\n').length
})

const jsonByteSize = computed(() => {
  if (!jsonInput.value) return '0.00'
  return (new Blob([jsonInput.value]).size / 1024).toFixed(2)
})

const outputLineCount = computed(() => {
  if (!jsonOutput.value) return 0
  return jsonOutput.value.split('\n').length
})

// 监听输入变化，自动校验并实时刷新右侧转换结果
watch(jsonInput, () => {
  validateJson()
  updateOutput(false)
})

// 监听字号调整同步给 JsonViewer
watch(viewerFontSize, (newSize) => {
  jsonViewerRef.value?.setFontSize(newSize)
})

onMounted(() => {
  loadSample(true)
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

function unescapeContent(input: string): string {
  const raw = input.trim()
  if (!raw) return ''
  try {
    if (raw.startsWith('"') && raw.endsWith('"')) {
      const parsed = JSON.parse(raw)
      return typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2)
    }
  } catch {
    // 忽略解析错误，回退到正则替换
  }
  return raw
    .replace(/\\"/g, '"')
    .replace(/\\\\/g, '\\')
    .replace(/\\n/g, '\n')
    .replace(/\\r/g, '\r')
    .replace(/\\t/g, '\t')
}

function updateOutput(isManual = false): void {
  if (!jsonInput.value.trim()) {
    jsonOutput.value = ''
    return
  }

  // 1. 转义字符串模式 (允许任意文本)
  if (currentMode.value === 'escape') {
    try {
      jsonOutput.value = JSON.stringify(jsonInput.value)
      if (isManual) message.success('已转义为字符串')
    } catch (err: any) {
      jsonOutput.value = `// 转义失败: ${err.message}`
      if (isManual) message.error(err.message)
    }
    return
  }

  // 2. 去除转义模式
  if (currentMode.value === 'unescape') {
    try {
      jsonOutput.value = unescapeContent(jsonInput.value)
      if (isManual) message.success('已去除转义')
    } catch (err: any) {
      jsonOutput.value = `// 去除转义失败: ${err.message}`
      if (isManual) message.error(err.message)
    }
    return
  }

  // 3. 基于 JSON 语法的模式 (format2, format4, minify, ts, go)
  const isValid = validateJson()
  if (!isValid) {
    if (isManual) {
      message.error('左侧 JSON 格式有误，无法转换')
      jsonOutput.value = `// 无法转换：左侧 JSON 语法错误\n// 错误信息: ${errorMessage.value}`
    } else {
      jsonOutput.value = `// 等待左侧输入有效的 JSON 内容...\n// 错误信息: ${errorMessage.value}`
    }
    return
  }

  try {
    const parsed = JSON.parse(jsonInput.value)
    switch (currentMode.value) {
      case 'format2':
        jsonOutput.value = JSON.stringify(parsed, null, 2)
        if (isManual) message.success('已格式化 (2空格缩进)')
        break
      case 'format4':
        jsonOutput.value = JSON.stringify(parsed, null, 4)
        if (isManual) message.success('已格式化 (4空格缩进)')
        break
      case 'minify':
        jsonOutput.value = JSON.stringify(parsed)
        if (isManual) message.success('已紧凑压缩为单行')
        break
      case 'ts':
        jsonOutput.value = generateTypeScriptInterface(parsed, 'RootObject')
        if (isManual) message.success('已生成 TypeScript 接口')
        break
      case 'go':
        jsonOutput.value = generateGoStruct(parsed, 'RootObject')
        if (isManual) message.success('已生成 Go Struct 结构体')
        break
    }
  } catch (err: any) {
    jsonOutput.value = `// 转换异常: ${err.message}`
    if (isManual) message.error(err.message)
  }
}

function switchMode(mode: ConversionMode): void {
  currentMode.value = mode
  updateOutput(true)
}

function loadSample(silent = false): void {
  jsonInput.value = JSON.stringify(sampleJson, null, 2)
  validateJson()
  updateOutput(false)
  if (!silent) {
    message.success('已载入示例数据')
  }
}

async function copyContent(text: string, label = '内容'): Promise<void> {
  if (!text) {
    message.warning('没有可复制的内容')
    return
  }
  try {
    if ((window as any).electronAPI) {
      await (window as any).electronAPI.writeClipboard(text)
    } else {
      await navigator.clipboard.writeText(text)
    }
    message.success(`已复制${label}到剪贴板`)
  } catch (err: any) {
    message.error(`复制失败: ${err.message}`)
  }
}

function applyOutputToInput(): void {
  if (!jsonOutput.value) {
    message.warning('输出内容为空，无法覆盖')
    return
  }
  jsonInput.value = jsonOutput.value
  message.success('已将转换结果覆盖到左侧输入')
}

function clearContent(): void {
  jsonInput.value = ''
  jsonOutput.value = ''
  validationStatus.value = 'empty'
  errorMessage.value = ''
  message.info('已清空内容')
}

function handleExpandAll(): void {
  jsonViewerRef.value?.expandAll()
  message.success('已展开全部集合与对象')
}

function handleCollapseAll(): void {
  jsonViewerRef.value?.collapseAll()
  message.success('已折叠全部集合与对象')
}

function handleIncreaseFontSize(): void {
  if (viewerFontSize.value < 22) {
    viewerFontSize.value += 1
  }
}

function handleDecreaseFontSize(): void {
  if (viewerFontSize.value > 12) {
    viewerFontSize.value -= 1
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
</script>
