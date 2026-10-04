<template>
  <div class="json-viewer-container w-full h-full overflow-auto p-4 bg-white dark:bg-[#18181c] rounded-md border border-[var(--border-color)] transition-colors select-text">
    <div
      v-if="parsedData !== undefined"
      class="json-tree min-w-fit"
      :class="{ 'has-line-numbers': showLineNumbers }"
      :style="{ fontSize: `${fontSize}px`, '--json-gutter-width': `${Math.max(2, String(lineLayout.total).length) + 2}ch` }"
    >
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
import { isLosslessNumber, parse } from 'lossless-json'

const props = withDefaults(
  defineProps<{
    json?: string | any
    initialFontSize?: number
    showLineNumbers?: boolean
  }>(),
  {
    json: '',
    initialFontSize: 15,
    showLineNumbers: false
  }
)

const emit = defineEmits<{
  (e: 'collapseChange', hasCollapsed: boolean): void
}>()

const fontSize = ref(props.initialFontSize || 15)
const collapsedSet = ref<Set<string>>(new Set())

watch(
  () => props.json,
  () => {
    collapsedSet.value = new Set()
    emit('collapseChange', false)
  }
)

const parsedData = computed(() => {
  if (props.json === '' || props.json === null || props.json === undefined) {
    return undefined
  }
  if (typeof props.json === 'object') {
    return props.json
  }
  try {
    return parse(props.json)
  } catch {
    return undefined
  }
})

// 使用完整格式化结果的行号，折叠时隐藏子行，但不改变后续行号。
const lineLayout = computed(() => {
  const lines = new Map<string, { start: number; end: number }>()
  let nextLine = 1

  function visit(value: any, path: string): void {
    const start = nextLine++
    const entries = value !== null && typeof value === 'object' && !isLosslessNumber(value) ? Object.entries(value) : []
    for (const [key, child] of entries) {
      visit(child, Array.isArray(value) ? `${path}[${key}]` : `${path}[${JSON.stringify(key)}]`)
    }
    const end = entries.length > 0 ? nextLine++ : start
    lines.set(path, { start, end })
  }

  if (parsedData.value !== undefined) visit(parsedData.value, 'root')
  return { lines, total: nextLine - 1 }
})

// 提供给子孙节点的依赖注入
provide('jsonViewerLineNumbers', computed(() => lineLayout.value.lines))
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
  emit('collapseChange', collapsedSet.value.size > 0)
})

function expandAll(): void {
  collapsedSet.value = new Set()
  emit('collapseChange', false)
}

function collapseAll(): void {
  const newSet = new Set<string>()

  function collect(val: any, path: string): void {
    if (Array.isArray(val)) {
      newSet.add(path)
      val.forEach((item, idx) => collect(item, `${path}[${idx}]`))
    } else if (val !== null && typeof val === 'object' && !isLosslessNumber(val)) {
      newSet.add(path)
      for (const [k, v] of Object.entries(val)) {
        collect(v, `${path}[${JSON.stringify(k)}]`)
      }
    }
  }

  if (parsedData.value !== undefined) {
    collect(parsedData.value, 'root')
  }
  collapsedSet.value = newSet
  emit('collapseChange', newSet.size > 0)
}

function toggleExpandCollapse(): boolean {
  if (collapsedSet.value.size > 0) {
    expandAll()
    return false
  } else {
    collapseAll()
    return true
  }
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
  toggleExpandCollapse,
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

.json-tree {
  --json-indent: 25px;
}

.json-tree.has-line-numbers {
  padding-left: var(--json-gutter-width);
}

.has-line-numbers :deep(.json-line::before) {
  content: attr(data-line-number);
  position: absolute;
  top: 1px;
  left: calc(-1 * var(--json-depth) * var(--json-indent) - var(--json-gutter-width));
  width: var(--json-gutter-width);
  padding-right: 16px;
  color: var(--text-muted);
  text-align: right;
  font-weight: 400;
  font-variant-numeric: tabular-nums;
  user-select: none;
  pointer-events: none;
}
</style>
