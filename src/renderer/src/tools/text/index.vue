<template>
  <div class="h-full flex flex-col min-h-0 space-y-3">
    <div class="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] shrink-0 transition-colors">
      <h1 class="m-0 text-sm font-semibold">双栏 Diff 差异对比</h1>
    </div>
    <div class="flex-1 flex flex-col min-h-0 space-y-2 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 overflow-hidden transition-colors">
      <div class="flex items-center justify-between">
        <div class="flex items-center space-x-3">
          <span class="text-xs text-zinc-500 dark:text-zinc-400">对比语言:</span>
          <n-select v-model:value="diffLanguage" size="small" :options="languageOptions" class="w-32" />
          <n-switch v-model:value="sideBySide" size="small">
            <template #checked>双栏分栏</template>
            <template #unchecked>单栏混排</template>
          </n-switch>
        </div>
        <div class="flex items-center space-x-2">
          <n-button size="small" secondary @click="loadDiffSample">加载差异示例</n-button>
          <n-button size="small" quaternary @click="clearDiff">清空</n-button>
        </div>
      </div>

      <div class="flex-1 min-h-0">
        <MonacoDiffEditor
          v-model:original="diffOriginal"
          v-model:modified="diffModified"
          :language="diffLanguage"
          :side-by-side="sideBySide"
          :theme="settingsStore.theme === 'dark' ? 'vs-dark' : 'vs'"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import MonacoDiffEditor from '@/components/MonacoDiffEditor.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const diffLanguage = ref('json')
const sideBySide = ref(true)
const diffOriginal = ref('{\n  "name": "CodeKit",\n  "version": "1.0.0",\n  "theme": "dark"\n}')
const diffModified = ref('{\n  "name": "CodeKit",\n  "version": "1.1.0",\n  "theme": "auto",\n  "shortcuts": true\n}')

const languageOptions = [
  { label: 'JSON', value: 'json' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'Python', value: 'python' },
  { label: 'SQL', value: 'sql' }
]

function loadDiffSample(): void {
  diffOriginal.value = `function calculateSum(a, b) {
  // 原有实现
  return a + b;
}`
  diffModified.value = `function calculateSum(a: number, b: number): number {
  // 现代 TypeScript 增强实现
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Invalid arguments');
  }
  return a + b;
}`
  diffLanguage.value = 'typescript'
}

function clearDiff(): void {
  diffOriginal.value = ''
  diffModified.value = ''
}
</script>
