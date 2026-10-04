<template>
  <div class="h-full flex flex-col space-y-3 min-h-0">
    <!-- 转换功能 -->
    <div
      class="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap shrink-0 shadow-sm transition-colors"
    >
      <!-- 左侧：转换模式切换按钮组 -->
      <div class="flex items-center space-x-1.5 flex-wrap gap-y-1">
        <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mr-1 shrink-0">转换功能:</span>

        <n-button
          size="tiny"
          :type="currentMode === 'format4' ? 'primary' : 'default'"
          :secondary="currentMode !== 'format4'"
          @click="switchMode('format4')"
        >
          格式化
        </n-button>
        <n-button
          size="tiny"
          :type="currentMode === 'minify' ? 'primary' : 'default'"
          :secondary="currentMode !== 'minify'"
          @click="switchMode('minify')"
        >
          压缩
        </n-button>
      </div>

      <div class="shrink-0 ml-auto">
        <n-button
          v-if="jsonOutput"
          size="tiny"
          quaternary
          title="将转换结果应用覆盖到左侧输入框"
          @click="applyOutputToInput"
        >
          覆盖到输入
        </n-button>
      </div>
    </div>

    <!-- 主工作区：左侧输入 + 右侧输出（高度完全一致，两端严格对齐） -->
    <div class="flex-1 min-h-0 flex flex-col md:flex-row gap-3">
      <!-- 左侧：用户输入的 JSON 格式内容 -->
      <div
        class="flex-1 min-w-0 h-full flex flex-col rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden transition-colors shadow-sm"
      >
        <!-- 输入工具栏 -->
        <div class="json-panel-header">
          <div class="flex items-center space-x-2">
            <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">JSON 输入</span>
            <span class="text-[11px] text-zinc-400 dark:text-zinc-500">原始数据</span>
          </div>

          <div class="flex items-center space-x-1">
            <n-button
              size="tiny"
              secondary
              title="复制"
              aria-label="复制"
              @click="copyContent(jsonInput, '输入内容')"
            >
              <template #icon>
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
              </template>
            </n-button>
            <n-button
              size="tiny"
              quaternary
              title="清空"
              aria-label="清空"
              @click="clearContent"
            >
              <template #icon>
                <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M3 6h18"></path>
                  <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                  <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                  <line x1="10" y1="11" x2="10" y2="17"></line>
                  <line x1="14" y1="11" x2="14" y2="17"></line>
                </svg>
              </template>
            </n-button>
          </div>
        </div>

        <!-- 左侧编辑器区域 -->
        <div class="flex-1 min-h-0 p-2">
          <MonacoEditor
            ref="editorRef"
            class="json-input-editor"
            v-model="jsonInput"
            language="json"
            :theme="monacoTheme"
            :font-size="DEFAULT_FONT_SIZE"
            :line-numbers="false"
            :render-line-highlight="jsonInput.trim() ? 'all' : 'none'"
            compact-gutter
          />
        </div>

        <!-- 左侧底部状态指示栏 (固定 h-9 高度) -->
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

      <!-- 右侧：转换输出结果栏 -->
      <div
        class="flex-1 min-w-0 h-full flex flex-col rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden transition-colors shadow-sm"
      >
        <!-- 结果工具栏 -->
        <div class="json-panel-header">
          <div class="flex items-center space-x-2 shrink-0">
            <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200">转换结果</span>
            <n-tag size="small" :bordered="false" type="primary" class="text-[11px]">
              {{ currentModeTitle }}
            </n-tag>
          </div>

          <div class="json-result-actions">
            <n-popover
              v-model:show="showFontSizePopover"
              trigger="click"
              placement="bottom"
              to="body"
              :show-arrow="false"
              :width="264"
              :theme-overrides="{ borderRadius: '20px', padding: '20px' }"
            >
              <template #trigger>
                <n-tooltip
                  to="body"
                  placement="bottom"
                  :show-arrow="false"
                  :disabled="showFontSizePopover"
                >
                  <template #trigger>
                    <n-button
                      size="tiny"
                      quaternary
                      :aria-label="`调整字号，当前 ${viewerFontSize}px`"
                      :aria-expanded="showFontSizePopover"
                      aria-controls="json-font-size-panel"
                    >
                      <template #icon>
                        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                          <path d="M3 19 9 5l6 14M5 14h8M16 19l3.5-8L23 19M17.3 16h4.4"></path>
                        </svg>
                      </template>
                    </n-button>
                  </template>
                  调整字号
                </n-tooltip>
              </template>
              <div id="json-font-size-panel" class="json-font-panel" @keydown.esc="showFontSizePopover = false">
                <div class="json-font-heading">
                  <div class="json-font-current" aria-live="polite">{{ viewerFontSize }}<span>px</span></div>
                </div>
                <div class="json-font-slider">
                  <input
                    v-model.number="viewerFontSize"
                    type="range"
                    :min="MIN_FONT_SIZE"
                    :max="MAX_FONT_SIZE"
                    step="1"
                    :style="{ '--font-progress': `${((viewerFontSize - MIN_FONT_SIZE) / (MAX_FONT_SIZE - MIN_FONT_SIZE)) * 100}%` }"
                    aria-label="字号"
                    :aria-valuetext="`${viewerFontSize} 像素`"
                  />
                  <div class="json-font-stops" aria-hidden="true"><i v-for="stop in 6" :key="stop"></i></div>
                </div>
                <div class="json-font-range" aria-hidden="true"><span>12 px</span><span>22 px</span></div>
              </div>
            </n-popover>
            <span class="json-action-divider" aria-hidden="true"></span>
            <n-tooltip
              v-if="isJsonFormattedMode"
              to="body"
              placement="bottom"
              :show-arrow="false"
            >
              <template #trigger>
                <n-button
                  size="tiny"
                  quaternary
                  :disabled="!isOutputJsonValid"
                  :aria-label="isTreeCollapsed ? '全部展开' : '全部折叠'"
                  @click="handleToggleExpandCollapse"
                >
                  <template #icon>
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <template v-if="isTreeCollapsed">
                        <polyline points="7 9 12 4 17 9"></polyline>
                        <polyline points="7 15 12 20 17 15"></polyline>
                      </template>
                      <template v-else>
                        <polyline points="7 4 12 9 17 4"></polyline>
                        <polyline points="7 20 12 15 17 20"></polyline>
                      </template>
                    </svg>
                  </template>
                </n-button>
              </template>
              {{ isTreeCollapsed ? '全部展开' : '全部折叠' }}
            </n-tooltip>
            <n-tooltip to="body" placement="bottom" :show-arrow="false">
              <template #trigger>
                <n-button
                  size="tiny"
                  :type="showOutputLineNumbers ? 'primary' : 'default'"
                  :secondary="showOutputLineNumbers"
                  :quaternary="!showOutputLineNumbers"
                  :aria-label="showOutputLineNumbers ? '关闭输出行号' : '开启输出行号'"
                  :aria-pressed="showOutputLineNumbers"
                  @click="showOutputLineNumbers = !showOutputLineNumbers"
                >
                  <template #icon>
                    <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M10 6h11M10 12h11M10 18h11M3 4h1v4M3 8h2M2.5 11.5a1.5 1.5 0 0 1 3 0c0 1-3 2-3 3h3M2.5 17h3l-2 2h.5a1.5 1.5 0 0 1 0 3H2.5"></path>
                    </svg>
                  </template>
                </n-button>
              </template>
              {{ showOutputLineNumbers ? '关闭行号' : '开启行号' }}
            </n-tooltip>
            <n-tooltip to="body" placement="bottom" :show-arrow="false">
              <template #trigger>
                <n-button
                  size="tiny"
                  secondary
                  aria-label="复制结果"
                  @click="copyContent(jsonOutput, '转换结果')"
                >
                  <template #icon>
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </template>
                </n-button>
              </template>
              复制结果
            </n-tooltip>
            <n-tooltip to="body" placement="bottom" :show-arrow="false">
              <template #trigger>
                <n-button
                  size="tiny"
                  quaternary
                  :disabled="!isOutputJsonValid || isDownloading"
                  :loading="isDownloading"
                  aria-label="下载结果"
                  @click="downloadOutput"
                >
                  <template #icon>
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M12 3v12"></path>
                      <polyline points="7 10 12 15 17 10"></polyline>
                    </svg>
                  </template>
                </n-button>
              </template>
              下载结果
            </n-tooltip>
          </div>
        </div>

        <!-- 右侧主体展示区域 -->
        <div class="flex-1 min-h-0 p-2">
          <JsonViewer
            v-if="isJsonFormattedMode && (isOutputJsonValid || !jsonOutput)"
            ref="jsonViewerRef"
            :json="jsonOutput"
            :initial-font-size="viewerFontSize"
            :show-line-numbers="showOutputLineNumbers"
            @collapse-change="(collapsed: boolean) => (isTreeCollapsed = collapsed)"
          />

          <!-- 单行压缩结果或语法错误信息 -->
          <MonacoEditor
            v-else
            v-model="jsonOutput"
            language="json"
            :theme="monacoTheme"
            :font-size="viewerFontSize"
            :read-only="true"
            :line-numbers="showOutputLineNumbers"
            compact-gutter
          />
        </div>

        <!-- 右侧底部状态栏 (固定 h-9 高度，与左侧严格对齐) -->
        <div
          class="h-9 px-3 flex items-center justify-between border-t border-[var(--border-color)] bg-[var(--card-sub-bg)] shrink-0 text-xs"
        >
          <div class="flex items-center space-x-2 min-w-0">
            <span class="text-zinc-400 dark:text-zinc-500 text-[11px]">
              {{ currentModeTitle }}
            </span>
          </div>

          <!-- 右侧输出统计 -->
          <div class="flex items-center space-x-3 text-zinc-500 dark:text-zinc-400 font-mono text-[11px] shrink-0 ml-auto">
            <span>字符: {{ jsonOutput.length }}</span>
            <span>行数: {{ outputLineCount }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useMessage } from 'naive-ui'
import MonacoEditor from '@/components/MonacoEditor.vue'
import JsonViewer from '@/components/JsonViewer/JsonViewer.vue'
import { useSettingsStore } from '@/stores/settings'

type ConversionMode = 'format4' | 'minify'

const DEFAULT_FONT_SIZE = 15
const MIN_FONT_SIZE = 12
const MAX_FONT_SIZE = 22

const message = useMessage()
const settingsStore = useSettingsStore()

const jsonInput = ref('')
const jsonOutput = ref('')
const isDownloading = ref(false)
const currentMode = ref<ConversionMode>('format4')
const viewerFontSize = ref(DEFAULT_FONT_SIZE)
const showFontSizePopover = ref(false)
const showOutputLineNumbers = ref(false)
const isTreeCollapsed = ref(false)
const validationStatus = ref<'valid' | 'invalid' | 'empty'>('empty')
const errorMessage = ref('')
const editorRef = ref<InstanceType<typeof MonacoEditor> | null>(null)
const jsonViewerRef = ref<InstanceType<typeof JsonViewer> | null>(null)

const modeNames: Record<ConversionMode, string> = {
  format4: '格式化',
  minify: '压缩'
}

const currentModeTitle = computed(() => modeNames[currentMode.value])

const isJsonFormattedMode = computed(() => {
  return currentMode.value === 'format4'
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
  updateOutput()
})

watch(jsonOutput, () => {
  isTreeCollapsed.value = false
})

// 监听字号调整同步给 JsonViewer
watch(viewerFontSize, (newSize) => {
  jsonViewerRef.value?.setFontSize(newSize)
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

function updateOutput(): void {
  const isValid = validateJson()
  if (!jsonInput.value.trim()) {
    jsonOutput.value = ''
    return
  }

  if (!isValid) {
    jsonOutput.value = `// 等待左侧输入有效的 JSON 内容...\n// 错误信息: ${errorMessage.value}`
    return
  }

  try {
    const parsed = JSON.parse(jsonInput.value)
    switch (currentMode.value) {
      case 'format4':
        jsonOutput.value = JSON.stringify(parsed, null, 4)
        break
      case 'minify':
        jsonOutput.value = JSON.stringify(parsed)
        break
    }
  } catch (err: any) {
    jsonOutput.value = `// 转换异常: ${err.message}`
  }
}

function switchMode(mode: ConversionMode): void {
  if (currentMode.value !== mode) {
    isTreeCollapsed.value = false
  }
  currentMode.value = mode
  updateOutput()
}

function downloadOutput(): void {
  if (!isOutputJsonValid.value || isDownloading.value) return

  const content = jsonOutput.value
  const compressed = currentMode.value === 'minify'
  isDownloading.value = true
  try {
    // 使用 Electron 内置下载流程，避免热更新时 preload 与主进程接口不同步。
    const url = URL.createObjectURL(new Blob([content], { type: 'application/json;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = compressed ? 'result.min.json' : 'result.json'
    try {
      document.body.appendChild(link)
      link.click()
    } finally {
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  } catch (err: unknown) {
    message.error(`下载失败: ${err instanceof Error ? err.message : String(err)}`)
  } finally {
    isDownloading.value = false
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
  isTreeCollapsed.value = false
  message.info('已清空内容')
}

function handleToggleExpandCollapse(): void {
  if (isTreeCollapsed.value) {
    jsonViewerRef.value?.expandAll()
  } else {
    jsonViewerRef.value?.collapseAll()
  }
}

</script>

<style scoped>
/* Monaco 的默认轮廓被外层裁切后会在输入区顶部留下蓝线。 */
.json-input-editor :deep(.monaco-editor) {
  outline: none;
}

.json-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  flex-shrink: 0;
  min-height: 48px;
  padding: 8px 12px;
  gap: 8px;
  border-bottom: 1px solid var(--border-color);
  background: var(--card-sub-bg);
}

.json-result-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  margin-left: auto;
}

.json-font-panel {
  color: var(--text-primary);
}

.json-font-heading {
  margin-bottom: 16px;
  text-align: center;
}

.json-font-current {
  color: #10b981;
  font-size: 22px;
  line-height: 28px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
}

.json-font-current span {
  margin-left: 4px;
  font-size: 13px;
  font-weight: 400;
}

.json-font-range {
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
  color: var(--text-muted);
  font-size: 11px;
}

.json-font-slider {
  position: relative;
  display: flex;
  align-items: center;
  height: 32px;
}

.json-font-slider input {
  appearance: none;
  width: 100%;
  height: 20px;
  margin: 0;
  border-radius: 999px;
  background: linear-gradient(to right, #10b981 var(--font-progress), var(--border-color) var(--font-progress));
  cursor: pointer;
}

.json-font-slider input::-webkit-slider-thumb {
  position: relative;
  z-index: 1;
  appearance: none;
  width: 28px;
  height: 28px;
  border: 1px solid rgba(0, 0, 0, 0.08);
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.18);
  cursor: grab;
}

.json-font-slider input:active::-webkit-slider-thumb {
  cursor: grabbing;
}

.json-font-slider input:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 4px;
}

.json-font-stops {
  position: absolute;
  inset: 0 14px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  pointer-events: none;
}

.json-font-stops i {
  width: 4px;
  height: 4px;
  border-radius: 50%;
  background: var(--text-muted);
  opacity: 0.6;
}

.json-action-divider {
  width: 1px;
  height: 16px;
  background: var(--border-color);
}

</style>
