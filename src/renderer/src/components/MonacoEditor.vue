<template>
  <div ref="containerRef" class="w-full h-full relative overflow-hidden rounded-md border border-[var(--border-color)] transition-colors"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'

// 注册 CodeKit 专有的 JSON 高亮主题（紫色属性键名、鲜绿字符串、蓝色数字、红橙布尔）
function ensureThemes(): void {
  monaco.editor.defineTheme('codekit-light', {
    base: 'vs',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: '92278f', fontStyle: 'bold' },
      { token: 'string.value.json', foreground: '00a65a' },
      { token: 'number.json', foreground: '2563eb' },
      { token: 'keyword.json', foreground: 'ea580c', fontStyle: 'bold' },
      { token: 'delimiter.bracket.json', foreground: '334155' },
      { token: 'delimiter.comma.json', foreground: '64748b' },
      { token: 'delimiter.colon.json', foreground: '64748b' }
    ],
    colors: {
      'editor.background': '#ffffff',
      'editorLineNumber.foreground': '#94a3b8',
      'editorLineNumber.activeForeground': '#334155'
    }
  })

  monaco.editor.defineTheme('codekit-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [
      { token: 'string.key.json', foreground: 'c084fc', fontStyle: 'bold' },
      { token: 'string.value.json', foreground: '4ade80' },
      { token: 'number.json', foreground: '60a5fa' },
      { token: 'keyword.json', foreground: 'fb7185', fontStyle: 'bold' },
      { token: 'delimiter.bracket.json', foreground: 'cbd5e1' },
      { token: 'delimiter.comma.json', foreground: '94a3b8' },
      { token: 'delimiter.colon.json', foreground: '94a3b8' }
    ],
    colors: {
      'editor.background': '#18181c',
      'editorLineNumber.foreground': '#52525b',
      'editorLineNumber.activeForeground': '#cbd5e1'
    }
  })
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    language?: string
    readOnly?: boolean
    theme?: string
    wordWrap?: 'on' | 'off'
    minimap?: boolean
    fontSize?: number
    tabSize?: number
  }>(),
  {
    modelValue: '',
    language: 'json',
    readOnly: false,
    theme: 'codekit-dark',
    wordWrap: 'on',
    minimap: false,
    fontSize: 14,
    tabSize: 4
  }
)

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
  (e: 'change', value: string): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let editorInstance: monaco.editor.IStandaloneCodeEditor | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!containerRef.value) return

  ensureThemes()

  editorInstance = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    readOnly: props.readOnly,
    wordWrap: props.wordWrap,
    minimap: { enabled: props.minimap },
    automaticLayout: true,
    fontSize: props.fontSize,
    lineHeight: Math.round(props.fontSize * 1.65),
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
    lineNumbers: 'on',
    folding: true,
    showFoldingControls: 'always',
    foldingHighlight: true,
    glyphMargin: true,
    scrollBeyondLastLine: false,
    renderLineHighlight: 'all',
    tabSize: props.tabSize,
    renderWhitespace: 'selection'
  })

  editorInstance.onDidChangeModelContent(() => {
    const val = editorInstance?.getValue() ?? ''
    emit('update:modelValue', val)
    emit('change', val)
  })

  resizeObserver = new ResizeObserver(() => {
    editorInstance?.layout()
  })
  resizeObserver.observe(containerRef.value)
})

watch(
  () => props.modelValue,
  (newVal) => {
    if (editorInstance && editorInstance.getValue() !== newVal) {
      editorInstance.setValue(newVal || '')
    }
  }
)

watch(
  () => props.language,
  (newLang) => {
    if (editorInstance) {
      const model = editorInstance.getModel()
      if (model) {
        monaco.editor.setModelLanguage(model, newLang)
      }
    }
  }
)

watch(
  () => props.theme,
  (newTheme) => {
    ensureThemes()
    monaco.editor.setTheme(newTheme)
  }
)

watch(
  () => props.fontSize,
  (newSize) => {
    if (editorInstance && newSize) {
      editorInstance.updateOptions({
        fontSize: newSize,
        lineHeight: Math.round(newSize * 1.65)
      })
    }
  }
)

function setValue(val: string): void {
  editorInstance?.setValue(val)
}

function getValue(): string {
  return editorInstance?.getValue() ?? ''
}

function format(): void {
  editorInstance?.getAction('editor.action.formatDocument')?.run()
}

defineExpose({
  setValue,
  getValue,
  format,
  getEditor: () => editorInstance
})

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  editorInstance?.dispose()
})
</script>
