<template>
  <div class="json-viewer-container w-full h-full overflow-auto p-4 bg-white dark:bg-[#18181c] rounded-md border border-[var(--border-color)] transition-colors select-text">
    <div v-if="parsedData !== undefined" class="min-w-fit">
      <JsonNode
        :val="parsedData"
        :key-name="null"
        :is-last="true"
        :depth="0"
        path="root"
      />
    </div>
    <div v-else class="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xs font-mono">
      暂无可解析的 JSON 数据
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import JsonNode from './JsonNode.vue'

const props = withDefaults(
  defineProps<{
    json?: string | any
    initialFontSize?: number
  }>(),
  {
    json: '',
    initialFontSize: 15
  }
)

const fontSize = ref(props.initialFontSize || 15)
const collapsedSet = ref<Set<string>>(new Set())

const parsedData = computed(() => {
  if (props.json === '' || props.json === null || props.json === undefined) {
    return undefined
  }
  if (typeof props.json === 'object') {
    return props.json
  }
  try {
    return JSON.parse(props.json)
  } catch {
    return undefined
  }
})

// 提供给子孙节点的依赖注入
provide('jsonViewerCollapsedSet', collapsedSet)
provide('jsonViewerFontSize', fontSize)
provide('jsonViewerToggleCollapse', (path: string) => {
  if (collapsedSet.value.has(path)) {
    collapsedSet.value.delete(path)
  } else {
    collapsedSet.value.add(path)
  }
  // 触发响应式更新
  collapsedSet.value = new Set(collapsedSet.value)
})

function expandAll(): void {
  collapsedSet.value = new Set()
}

function collapseAll(): void {
  const newSet = new Set<string>()

  function collect(val: any, path: string): void {
    if (Array.isArray(val)) {
      newSet.add(path)
      val.forEach((item, idx) => collect(item, `${path}[${idx}]`))
    } else if (val !== null && typeof val === 'object') {
      newSet.add(path)
      for (const [k, v] of Object.entries(val)) {
        collect(v, `${path}.${k}`)
      }
    }
  }

  if (parsedData.value !== undefined) {
    collect(parsedData.value, 'root')
  }
  collapsedSet.value = newSet
}

function increaseFontSize(): void {
  if (fontSize.value < 22) {
    fontSize.value += 1
  }
}

function decreaseFontSize(): void {
  if (fontSize.value > 12) {
    fontSize.value -= 1
  }
}

function setFontSize(size: number): void {
  if (size >= 12 && size <= 22) {
    fontSize.value = size
  }
}

defineExpose({
  expandAll,
  collapseAll,
  increaseFontSize,
  decreaseFontSize,
  setFontSize,
  fontSize
})
</script>

<style scoped>
.json-viewer-container {
  /* 允许水平滚动同时保留等宽排版 */
  font-family: 'JetBrains Mono', 'Fira Code', 'Cascadia Code', Consolas, Menlo, Monaco, monospace;
}
</style>
