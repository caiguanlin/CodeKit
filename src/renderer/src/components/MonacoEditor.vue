<template>
  <div ref="containerRef" class="w-full h-full relative overflow-hidden rounded-md border border-[var(--border-color)] transition-colors"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    language?: string
    readOnly?: boolean
    theme?: string
    wordWrap?: 'on' | 'off'
    minimap?: boolean
  }>(),
  {
    modelValue: '',
    language: 'json',
    readOnly: false,
    theme: 'vs-dark',
    wordWrap: 'on',
    minimap: false
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

  editorInstance = monaco.editor.create(containerRef.value, {
    value: props.modelValue,
    language: props.language,
    theme: props.theme,
    readOnly: props.readOnly,
    wordWrap: props.wordWrap,
    minimap: { enabled: props.minimap },
    automaticLayout: true,
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    renderLineHighlight: 'all',
    tabSize: 2,
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
    monaco.editor.setTheme(newTheme)
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
