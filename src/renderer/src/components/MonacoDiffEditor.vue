<template>
  <div ref="containerRef" class="w-full h-full relative overflow-hidden rounded-md border border-[var(--border-color)] transition-colors"></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import * as monaco from 'monaco-editor'

const props = withDefaults(
  defineProps<{
    original?: string
    modified?: string
    language?: string
    theme?: string
    sideBySide?: boolean
  }>(),
  {
    original: '',
    modified: '',
    language: 'plaintext',
    theme: 'vs-dark',
    sideBySide: true
  }
)

const emit = defineEmits<{
  (e: 'update:original', val: string): void
  (e: 'update:modified', val: string): void
}>()

const containerRef = ref<HTMLDivElement | null>(null)
let diffEditorInstance: monaco.editor.IStandaloneDiffEditor | null = null
let originalModel: monaco.editor.ITextModel | null = null
let modifiedModel: monaco.editor.ITextModel | null = null
let resizeObserver: ResizeObserver | null = null

onMounted(() => {
  if (!containerRef.value) return

  diffEditorInstance = monaco.editor.createDiffEditor(containerRef.value, {
    theme: props.theme,
    renderSideBySide: props.sideBySide,
    automaticLayout: true,
    fontSize: 13,
    fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, 'Courier New', monospace",
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    readOnly: false
  })

  originalModel = monaco.editor.createModel(props.original, props.language)
  modifiedModel = monaco.editor.createModel(props.modified, props.language)

  diffEditorInstance.setModel({
    original: originalModel,
    modified: modifiedModel
  })

  originalModel.onDidChangeContent(() => {
    emit('update:original', originalModel?.getValue() ?? '')
  })

  modifiedModel.onDidChangeContent(() => {
    emit('update:modified', modifiedModel?.getValue() ?? '')
  })

  resizeObserver = new ResizeObserver(() => {
    diffEditorInstance?.layout()
  })
  resizeObserver.observe(containerRef.value)
})

watch(
  () => props.original,
  (val) => {
    if (originalModel && originalModel.getValue() !== val) {
      originalModel.setValue(val || '')
    }
  }
)

watch(
  () => props.modified,
  (val) => {
    if (modifiedModel && modifiedModel.getValue() !== val) {
      modifiedModel.setValue(val || '')
    }
  }
)

watch(
  () => props.language,
  (newLang) => {
    if (originalModel) monaco.editor.setModelLanguage(originalModel, newLang)
    if (modifiedModel) monaco.editor.setModelLanguage(modifiedModel, newLang)
  }
)

watch(
  () => props.sideBySide,
  (val) => {
    diffEditorInstance?.updateOptions({ renderSideBySide: val })
  }
)

watch(
  () => props.theme,
  (newTheme) => {
    monaco.editor.setTheme(newTheme)
  }
)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  originalModel?.dispose()
  modifiedModel?.dispose()
  diffEditorInstance?.dispose()
})
</script>
