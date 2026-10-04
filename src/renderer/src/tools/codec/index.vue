<template>
  <div class="h-full flex flex-col space-y-3 min-h-0">
    <div
      class="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap shrink-0 shadow-sm transition-colors"
    >
      <div class="flex items-center space-x-1.5 flex-wrap gap-y-1" role="group" aria-label="转换功能">
        <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mr-1 shrink-0">转换功能:</span>
        <n-button
          v-for="mode in modes"
          :key="mode.key"
          size="tiny"
          :type="activeTab === mode.key ? 'primary' : 'default'"
          :secondary="activeTab !== mode.key"
          :aria-pressed="activeTab === mode.key"
          @click="activeTab = mode.key"
        >
          {{ mode.label }}
        </n-button>
      </div>
      <span class="text-xs text-[var(--text-secondary)]">点击生成的内容即可复制</span>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto">
      <div v-if="activeTab === 'base64'" class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <section
          v-for="section in base64Sections"
          :key="section.key"
          :aria-label="`Base64 ${section.label}`"
          class="min-w-0 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] overflow-hidden shadow-sm transition-colors"
        >
          <div class="flex items-center justify-between gap-2 px-3 py-2 border-b border-[var(--border-color)] bg-[var(--card-sub-bg)]">
            <div class="flex items-center gap-2">
              <h2 class="m-0 text-xs font-semibold">Base64 {{ section.label }}</h2>
              <span class="text-xs text-[var(--text-secondary)]">{{ section.hint }}</span>
            </div>
            <n-button size="tiny" quaternary :aria-label="`清空${section.label}输入`" @click="base64Inputs[section.key] = ''">清空</n-button>
          </div>
          <div class="p-4 space-y-4">
            <div class="space-y-2">
              <label :for="`base64-${section.key}`" class="block text-xs text-[var(--text-secondary)]">{{ section.inputLabel }}</label>
              <n-input
                v-model:value="base64Inputs[section.key]"
                type="textarea"
                :input-props="{ id: `base64-${section.key}` }"
                :placeholder="section.placeholder"
                :rows="6"
                :status="base64Results[section.key].error ? 'error' : undefined"
              />
            </div>
            <div class="space-y-2">
              <div class="text-xs text-[var(--text-secondary)]">{{ section.label }}结果</div>
              <button
                type="button"
                class="codec-result base64-result"
                :disabled="!base64Results[section.key].value"
                :aria-label="`复制 Base64 ${section.label}结果`"
                :title="base64Results[section.key].value ? '点击复制' : undefined"
                @click="copy(base64Results[section.key].value)"
              >
                <span v-if="base64Results[section.key].value">{{ base64Results[section.key].value }}</span>
                <span v-else class="text-[var(--text-secondary)]">输入内容后自动生成结果</span>
              </button>
              <p v-if="base64Results[section.key].error" class="m-0 text-xs text-red-600 dark:text-red-400" role="alert">
                {{ base64Results[section.key].error }}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div v-else-if="activeTab === 'hash'" class="bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 space-y-4 transition-colors">
        <div class="flex items-center justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="text-xs text-[var(--text-secondary)]">大写输出:</span>
            <n-switch v-model:value="hashUppercase" size="small" aria-label="大写输出" />
          </div>
          <n-button size="small" quaternary @click="hashInput = ''">清空输入</n-button>
        </div>

        <div class="space-y-2">
          <label for="hash-input" class="block text-xs text-[var(--text-secondary)]">输入文本（实时计算各类哈希）</label>
          <n-input
            v-model:value="hashInput"
            type="textarea"
            :input-props="{ id: 'hash-input' }"
            placeholder="输入任意字符串，自动计算 MD5、SHA-1、SHA-256、SHA-512..."
            :rows="4"
          />
        </div>

        <div class="space-y-2 pt-2 text-xs">
          <section
            v-for="hash in hashResults"
            :key="hash.key"
            class="min-w-0 p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-2 transition-colors"
          >
            <h2 class="m-0 text-xs font-bold" :class="hash.color">{{ hash.label }}</h2>
            <button
              type="button"
              class="codec-result hash-result"
              :disabled="!hash.value"
              :aria-label="`复制 ${hash.label} 结果`"
              :title="hash.value ? '点击复制' : undefined"
              @click="copy(hash.value)"
            >{{ hash.value || '—' }}</button>
          </section>
        </div>
      </div>
      <EncryptionPanel v-show="activeTab === 'aes'" mode="aes" @copy="copy" />
      <EncryptionPanel v-show="activeTab === 'rsa'" mode="rsa" @copy="copy" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useMessage, type MessageReactive } from 'naive-ui'
import CryptoJS from 'crypto-js'
import EncryptionPanel from './EncryptionPanel.vue'

const message = useMessage()
let copyMessage: MessageReactive | undefined
const activeTab = ref<'base64' | 'hash' | 'aes' | 'rsa'>('base64')
const modes = [
  { key: 'base64', label: 'Base64' },
  { key: 'hash', label: '哈希 (MD5/SHA)' },
  { key: 'aes', label: 'AES' },
  { key: 'rsa', label: 'RSA' }
] as const

const base64Sections = [
  { key: 'encode', label: '加密', hint: '文本 → Base64', inputLabel: '原始文本', placeholder: '请输入需要编码的文本...' },
  { key: 'decode', label: '解密', hint: 'Base64 → 文本', inputLabel: 'Base64 内容', placeholder: '请输入需要解码的 Base64 内容...' }
] as const
const base64Inputs = reactive({ encode: 'Hello CodeKit!', decode: 'SGVsbG8gQ29kZUtpdCE=' })

const base64Results = computed(() => ({
  encode: convertBase64(base64Inputs.encode, 'encode'),
  decode: convertBase64(base64Inputs.decode, 'decode')
}))

function convertBase64(input: string, direction: 'encode' | 'decode'): { value: string; error: string } {
  if (!input) return { value: '', error: '' }
  try {
    if (direction === 'encode') {
      return { value: CryptoJS.enc.Base64.stringify(CryptoJS.enc.Utf8.parse(input)), error: '' }
    }
    const normalized = input.replace(/\s+/g, '')
    if (
      !/^[A-Za-z0-9+/]*={0,2}$/.test(normalized) ||
      normalized.length % 4 === 1 ||
      (normalized.includes('=') && normalized.length % 4 !== 0)
    ) {
      throw new Error('Invalid Base64')
    }
    const words = CryptoJS.enc.Base64.parse(normalized)
    if (CryptoJS.enc.Base64.stringify(words).replace(/=+$/, '') !== normalized.replace(/=+$/, '')) {
      throw new Error('Invalid Base64')
    }
    return { value: CryptoJS.enc.Utf8.stringify(words), error: '' }
  } catch {
    return { value: '', error: direction === 'decode' ? '请输入有效的 Base64 编码，且解码结果须为 UTF-8 文本' : '文本编码失败，请检查输入内容' }
  }
}

const hashInput = ref('123456')
const hashUppercase = ref(false)
const hashAlgorithms = [
  { key: 'md5', label: 'MD5 (128-bit)', calculate: CryptoJS.MD5, color: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'sha1', label: 'SHA-1 (160-bit)', calculate: CryptoJS.SHA1, color: 'text-blue-600 dark:text-blue-400' },
  { key: 'sha256', label: 'SHA-256 (256-bit)', calculate: CryptoJS.SHA256, color: 'text-indigo-600 dark:text-indigo-400' },
  { key: 'sha512', label: 'SHA-512 (512-bit)', calculate: CryptoJS.SHA512, color: 'text-purple-600 dark:text-purple-400' }
] as const
const hashResults = computed(() => hashAlgorithms.map((algorithm) => {
  const value = hashInput.value ? algorithm.calculate(hashInput.value).toString() : ''
  return { ...algorithm, value: hashUppercase.value ? value.toUpperCase() : value }
}))

async function copy(text: string): Promise<void> {
  if (!text) return
  try {
    if (window.electronAPI) {
      const success = await window.electronAPI.writeClipboard(text)
      if (!success) throw new Error('无法写入剪贴板')
    } else {
      await navigator.clipboard.writeText(text)
    }
    copyMessage?.destroy()
    copyMessage = message.success('已复制')
  } catch (error: unknown) {
    copyMessage?.destroy()
    copyMessage = message.error(`复制失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}
</script>

<style scoped>
.codec-result {
  display: block;
  width: 100%;
  min-width: 0;
  border-radius: 6px;
  color: var(--text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  text-align: left;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
  transition: background-color 0.15s ease;
}

.base64-result {
  display: flex;
  align-items: flex-start;
  min-height: 160px;
  max-height: 320px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid var(--border-color);
  background: var(--card-sub-bg);
}

.hash-result {
  padding: 6px 8px;
}

.codec-result:not(:disabled):hover {
  background: var(--hover-bg);
}

.codec-result:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.codec-result:disabled {
  cursor: default;
}
</style>
