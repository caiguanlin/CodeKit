<template>
  <div class="json-node font-mono select-text" :style="nodeStyle">
    <!-- 1. 对象类型 -->
    <template v-if="isObject">
      <!-- 空对象 -->
      <div v-if="keys.length === 0" class="json-line" :data-line-number="lineNumbers?.start">
        <span v-if="keyName" class="json-key">"{{ keyName }}"</span>
        <span v-if="keyName" class="json-colon">: </span>
        <span class="json-bracket">{}</span>
        <span v-if="!isLast" class="json-comma">,</span>
      </div>

      <!-- 非空对象 -->
      <div v-else>
        <!-- 对象起始行 -->
        <div class="json-line flex items-center flex-wrap" :data-line-number="lineNumbers?.start">
          <span v-if="keyName" class="json-key">"{{ keyName }}"</span>
          <span v-if="keyName" class="json-colon">: </span>

          <!-- 折叠切换按钮 [-] / [+] -->
          <button
            type="button"
            class="json-toggle-btn"
            :class="{ 'is-collapsed': isCollapsed }"
            :title="isCollapsed ? '展开此对象' : '折叠此对象'"
            @click.stop="toggleCollapse"
          >
            <svg v-if="isCollapsed" class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <svg v-else class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <span class="json-bracket">{</span>

          <!-- 折叠时的简略摘要 -->
          <template v-if="isCollapsed">
            <span class="json-collapsed-summary" @click.stop="toggleCollapse">
              {{ keys.length }} 属性 ...
            </span>
            <span class="json-bracket">}</span>
            <span v-if="!isLast" class="json-comma">,</span>
          </template>
        </div>

        <!-- 展开时的子属性列表 -->
        <div
          v-if="!isCollapsed"
          class="json-children border-l border-zinc-200 dark:border-zinc-800 my-0.5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
        >
          <JsonNode
            v-for="(k, idx) in keys"
            :key="k"
            :val="val[k]"
            :key-name="k"
            :is-last="idx === keys.length - 1"
            :depth="depth + 1"
            :path="`${path}[${JSON.stringify(k)}]`"
          />
        </div>

        <!-- 对象闭合行 -->
        <div v-if="!isCollapsed" class="json-line" :data-line-number="lineNumbers?.end">
          <span class="json-bracket">}</span>
          <span v-if="!isLast" class="json-comma">,</span>
        </div>
      </div>
    </template>

    <!-- 2. 数组类型 -->
    <template v-else-if="isArray">
      <!-- 空数组 -->
      <div v-if="val.length === 0" class="json-line" :data-line-number="lineNumbers?.start">
        <span v-if="keyName" class="json-key">"{{ keyName }}"</span>
        <span v-if="keyName" class="json-colon">: </span>
        <span class="json-bracket">[]</span>
        <span v-if="!isLast" class="json-comma">,</span>
      </div>

      <!-- 非空数组 -->
      <div v-else>
        <!-- 数组起始行 -->
        <div class="json-line flex items-center flex-wrap" :data-line-number="lineNumbers?.start">
          <span v-if="keyName" class="json-key">"{{ keyName }}"</span>
          <span v-if="keyName" class="json-colon">: </span>

          <!-- 折叠切换按钮 [-] / [+] -->
          <button
            type="button"
            class="json-toggle-btn"
            :class="{ 'is-collapsed': isCollapsed }"
            :title="isCollapsed ? '展开此集合' : '折叠此集合'"
            @click.stop="toggleCollapse"
          >
            <svg v-if="isCollapsed" class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <svg v-else class="w-2.5 h-2.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
          </button>

          <span class="json-bracket">[</span>

          <!-- 折叠时的简略摘要 -->
          <template v-if="isCollapsed">
            <span class="json-collapsed-summary" @click.stop="toggleCollapse">
              {{ val.length }} 项 ...
            </span>
            <span class="json-bracket">]</span>
            <span v-if="!isLast" class="json-comma">,</span>
          </template>
        </div>

        <!-- 展开时的元素列表 -->
        <div
          v-if="!isCollapsed"
          class="json-children border-l border-zinc-200 dark:border-zinc-800 my-0.5 hover:border-zinc-400 dark:hover:border-zinc-600 transition-colors"
        >
          <JsonNode
            v-for="(item, idx) in val"
            :key="idx"
            :val="item"
            :key-name="null"
            :is-last="idx === val.length - 1"
            :depth="depth + 1"
            :path="`${path}[${idx}]`"
          />
        </div>

        <!-- 数组闭合行 -->
        <div v-if="!isCollapsed" class="json-line" :data-line-number="lineNumbers?.end">
          <span class="json-bracket">]</span>
          <span v-if="!isLast" class="json-comma">,</span>
        </div>
      </div>
    </template>

    <!-- 3. 基本类型 (字符串 / 数字 / 布尔 / null) -->
    <div v-else class="json-line" :data-line-number="lineNumbers?.start">
      <span v-if="keyName" class="json-key">"{{ keyName }}"</span>
      <span v-if="keyName" class="json-colon">: </span>

      <!-- 字符串值 -->
      <span v-if="typeof val === 'string'" class="json-string">"{{ val }}"</span>
      <!-- 数字值 -->
      <span v-else-if="typeof val === 'number'" class="json-number">{{ val }}</span>
      <!-- 布尔值 -->
      <span v-else-if="typeof val === 'boolean'" class="json-boolean">{{ val }}</span>
      <!-- null -->
      <span v-else-if="val === null" class="json-null">null</span>
      <!-- 其他 -->
      <span v-else class="json-other">{{ String(val) }}</span>

      <!-- 逗号 -->
      <span v-if="!isLast" class="json-comma">,</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'

const props = defineProps<{
  val: any
  keyName: string | null
  isLast: boolean
  depth: number
  path: string
}>()

const collapsedSet = inject<Ref<Set<string>>>('jsonViewerCollapsedSet')
const fontSize = inject<Ref<number>>('jsonViewerFontSize')
const toggleCollapseGlobal = inject<(path: string) => void>('jsonViewerToggleCollapse')
const lineNumberMap = inject<Ref<Map<string, { start: number; end: number }>>>('jsonViewerLineNumbers')
const lineNumbers = computed(() => lineNumberMap?.value.get(props.path))

const isArray = computed(() => Array.isArray(props.val))
const isObject = computed(() => {
  return props.val !== null && typeof props.val === 'object' && !Array.isArray(props.val)
})

const keys = computed(() => {
  if (!isObject.value) return []
  return Object.keys(props.val)
})

const isCollapsed = computed(() => {
  return collapsedSet?.value ? collapsedSet.value.has(props.path) : false
})

const nodeStyle = computed(() => {
  const size = fontSize?.value || 15
  return {
    fontSize: `${size}px`,
    lineHeight: `${Math.round(size * 1.65)}px`,
    '--json-depth': props.depth
  }
})

function toggleCollapse(): void {
  toggleCollapseGlobal?.(props.path)
}
</script>

<style scoped>
.json-line {
  position: relative;
  white-space: pre-wrap;
  word-break: break-all;
  padding: 1px 0;
}

.json-children {
  margin-left: 10px;
  padding-left: calc(var(--json-indent) - 11px);
}

/* 键名颜色：紫红色 (JSON.cn 经典高亮色) */
.json-key {
  color: #92278f;
  font-weight: 600;
}
:root.dark .json-key,
html.dark .json-key {
  color: #c084fc;
}

/* 冒号与逗号 */
.json-colon,
.json-comma {
  color: #475569;
}
:root.dark .json-colon,
html.dark .json-comma {
  color: #94a3b8;
}

/* 括号 */
.json-bracket {
  color: #334155;
  font-weight: 600;
}
:root.dark .json-bracket,
html.dark .json-bracket {
  color: #e2e8f0;
}

/* 字符串值：鲜绿色 */
.json-string {
  color: #00a65a;
  word-break: break-word;
}
:root.dark .json-string,
html.dark .json-string {
  color: #4ade80;
}

/* 数字值：蓝色 */
.json-number {
  color: #2563eb;
  font-weight: 500;
}
:root.dark .json-number,
html.dark .json-number {
  color: #60a5fa;
}

/* 布尔值：红橙色 */
.json-boolean {
  color: #f43f5e;
  font-weight: 600;
}
:root.dark .json-boolean,
html.dark .json-boolean {
  color: #fb7185;
}

/* null 值：紫色 */
.json-null {
  color: #9333ea;
  font-weight: 600;
}
:root.dark .json-null,
html.dark .json-null {
  color: #d8b4fe;
}

/* 红色圆形折叠按钮 [-] / [+] */
.json-toggle-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 14px;
  height: 14px;
  border-radius: 9999px;
  border: 1px solid #ef4444;
  color: #ef4444;
  background-color: transparent;
  cursor: pointer;
  margin: 0 4px;
  padding: 0;
  line-height: 1;
  transition: all 0.15s ease;
  vertical-align: middle;
}

.json-toggle-btn:hover {
  background-color: rgba(239, 68, 68, 0.15);
  transform: scale(1.15);
}

.json-toggle-btn.is-collapsed {
  background-color: rgba(239, 68, 68, 0.1);
}

:root.dark .json-toggle-btn,
html.dark .json-toggle-btn {
  border-color: #f87171;
  color: #f87171;
}

:root.dark .json-toggle-btn:hover,
html.dark .json-toggle-btn:hover {
  background-color: rgba(248, 113, 113, 0.2);
}

/* 折叠后的摘要徽章 */
.json-collapsed-summary {
  display: inline-flex;
  align-items: center;
  padding: 0 6px;
  margin: 0 4px;
  border-radius: 4px;
  font-size: 11px;
  background-color: rgba(0, 0, 0, 0.05);
  color: #64748b;
  cursor: pointer;
  transition: all 0.15s ease;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
}

:root.dark .json-collapsed-summary,
html.dark .json-collapsed-summary {
  background-color: rgba(255, 255, 255, 0.08);
  color: #94a3b8;
}

.json-collapsed-summary:hover {
  background-color: rgba(239, 68, 68, 0.12);
  color: #ef4444;
}

:root.dark .json-collapsed-summary:hover,
html.dark .json-collapsed-summary:hover {
  background-color: rgba(248, 113, 113, 0.2);
  color: #f87171;
}
</style>
