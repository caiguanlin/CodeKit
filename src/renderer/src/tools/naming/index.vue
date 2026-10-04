<template>
  <div class="h-full flex flex-col min-h-0 space-y-3">
    <div class="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap shrink-0 transition-colors">
      <h1 class="m-0 text-sm font-semibold">命名格式转换</h1>
      <span class="text-xs text-zinc-500 dark:text-zinc-400">点击结果复制单条，右上角图标复制该格式全部结果</span>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] p-4 space-y-4 transition-colors">
      <div class="space-y-2">
        <div class="flex items-center justify-between gap-3 text-xs text-zinc-500 dark:text-zinc-400">
          <label for="naming-input" class="font-medium">输入源文本（自动识别空格、换行、逗号或分号分隔的多个字符串）</label>
          <span class="shrink-0" aria-live="polite">共 {{ namingResults.length }} 条</span>
        </div>
        <n-input
          v-model:value="namingInput"
          type="textarea"
          :input-props="{ id: 'naming-input' }"
          :autosize="{ minRows: 4, maxRows: 10 }"
          placeholder="直接粘贴多个字符串，例如：&#10;user_account_info user_account_tip&#10;getUserProfile, user-login-record"
          class="font-mono"
        />
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
        <section
          v-for="format in formats"
          :key="format.key"
          :aria-label="format.label"
          class="min-w-0 p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-2 transition-colors"
        >
          <div class="flex items-center justify-between gap-2 text-zinc-500 dark:text-zinc-400">
            <h2 class="m-0 text-xs font-normal">{{ format.label }}</h2>
            <n-tooltip to="body" placement="bottom" :show-arrow="false">
              <template #trigger>
                <n-button
                  size="tiny"
                  secondary
                  :disabled="!namingResults.some((result) => result[format.key])"
                  :aria-label="`全部复制 ${format.label}`"
                  @click="copyAll(format.key)"
                >
                  <template #icon>
                    <svg class="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
                      <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                  </template>
                </n-button>
              </template>
              全部复制 {{ format.label }}
            </n-tooltip>
          </div>
          <div v-if="namingResults.length" class="space-y-1">
            <button
              v-for="(result, index) in namingResults"
              :key="index"
              type="button"
              class="naming-result flex items-start gap-2 w-full rounded px-2 py-1.5 text-left font-mono hover:bg-[var(--hover-bg)] transition-colors"
              :class="format.color"
              :disabled="!result[format.key]"
              :aria-label="result[format.key] ? `复制 ${result[format.key]}` : `第 ${index + 1} 条无转换结果`"
              @click="copy(result[format.key])"
            >
              <span class="shrink-0 min-w-4 text-right text-zinc-400 dark:text-zinc-500" aria-hidden="true">{{ index + 1 }}</span>
              <span class="flex-1 min-w-0 whitespace-pre-wrap break-all font-bold">{{ result[format.key] || '—' }}</span>
              <span class="naming-result-action" aria-hidden="true">
                <svg class="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                复制
              </span>
            </button>
          </div>
          <div v-else class="py-3 text-zinc-400 dark:text-zinc-500">输入文本后显示转换结果</div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMessage, type MessageReactive } from 'naive-ui'

const message = useMessage()
let copyMessage: MessageReactive | undefined
const namingInput = ref('')

const formats = [
  { key: 'camel', label: 'camelCase (小驼峰)', color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'pascal', label: 'PascalCase (大驼峰)', color: 'text-blue-600 dark:text-blue-400' },
  { key: 'snake', label: 'snake_case (下划线)', color: 'text-amber-600 dark:text-amber-400' },
  { key: 'kebab', label: 'kebab-case (中划线)', color: 'text-purple-600 dark:text-purple-400' },
  { key: 'constant', label: 'CONSTANT_CASE (全大写常量)', color: 'text-red-600 dark:text-red-400' },
  { key: 'upper', label: 'UPPERCASE (全大写)', color: 'text-zinc-800 dark:text-zinc-200' }
] as const

type NamingFormat = (typeof formats)[number]['key']

const namingResults = computed(() => namingInput.value
  .split(/[\s,，;；]+/)
  .filter(Boolean)
  .map(convertNaming))

function convertNaming(input: string): Record<NamingFormat, string> {
  const words = input
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2')
    .replace(/([a-z0-9])([A-Z])/g, '$1 $2')
    .split(/[_\s-]+/)
    .filter(Boolean)
    .map((word) => word.toLowerCase())
  const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1)

  return {
    camel: words.map((word, index) => index === 0 ? word : capitalize(word)).join(''),
    pascal: words.map(capitalize).join(''),
    snake: words.join('_'),
    kebab: words.join('-'),
    constant: words.join('_').toUpperCase(),
    upper: input.toUpperCase()
  }
}

async function copyAll(format: NamingFormat): Promise<void> {
  if (!namingResults.value.some((result) => result[format])) return
  await copy(namingResults.value.map((result) => result[format]).join('\n'), '该格式全部结果')
}

async function copy(text: string, label = '字符串'): Promise<void> {
  if (!text) return
  try {
    if (window.electronAPI) {
      const success = await window.electronAPI.writeClipboard(text)
      if (!success) throw new Error('无法写入剪贴板')
    } else {
      await navigator.clipboard.writeText(text)
    }
    copyMessage?.destroy()
    copyMessage = message.success(`已复制${label}到剪贴板`)
  } catch (error: unknown) {
    copyMessage?.destroy()
    copyMessage = message.error(`复制失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}
</script>

<style scoped>
.naming-result-action {
  display: inline-flex;
  align-items: center;
  flex-shrink: 0;
  gap: 4px;
  color: var(--text-secondary);
  font-family: inherit;
  font-size: 11px;
  line-height: inherit;
  white-space: nowrap;
  opacity: 0;
  transition: opacity 0.15s ease;
}

.naming-result:not(:disabled):hover .naming-result-action,
.naming-result:not(:disabled):focus-visible .naming-result-action {
  opacity: 1;
}

.naming-result:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.naming-result:disabled {
  cursor: default;
}
</style>
