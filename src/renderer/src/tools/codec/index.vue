<template>
  <div class="h-full flex flex-col space-y-3">
    <!-- 顶部编解码模式切换 -->
    <div class="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] transition-colors">
      <n-tabs v-model:value="activeTab" type="segment" size="small">
        <n-tab name="base64">Base64</n-tab>
        <n-tab name="url">URL 编码</n-tab>
        <n-tab name="hash">哈希散列 (MD5/SHA)</n-tab>
        <n-tab name="unicode">Unicode</n-tab>
        <n-tab name="hex">Hex 16进制</n-tab>
      </n-tabs>
    </div>

    <!-- 主操作区域 -->
    <div class="flex-1 flex flex-col min-h-0 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 overflow-y-auto transition-colors">
      <!-- 模式 1: Base64 -->
      <div v-if="activeTab === 'base64'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <n-button size="small" type="primary" secondary @click="encodeBase64">Base64 编码</n-button>
            <n-button size="small" secondary @click="decodeBase64">Base64 解码</n-button>
            <n-button size="small" quaternary @click="swapBase64">上下互换</n-button>
          </div>
          <div class="flex items-center space-x-2">
            <n-button size="small" secondary @click="copy(base64Output)">复制结果</n-button>
            <n-button size="small" quaternary @click="clearBase64">清空</n-button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <div class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">输入原始内容</div>
            <n-input
              v-model:value="base64Input"
              type="textarea"
              placeholder="请输入需要 Base64 编码或解码的文本..."
              :rows="12"
            />
          </div>
          <div class="space-y-1">
            <div class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">输出转换结果</div>
            <n-input
              v-model:value="base64Output"
              type="textarea"
              placeholder="转换结果将在此实时呈现..."
              :rows="12"
              readonly
            />
          </div>
        </div>
      </div>

      <!-- 模式 2: URL 编码 -->
      <div v-else-if="activeTab === 'url'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <n-button size="small" type="primary" secondary @click="encodeUrl">URL 编码 (Component)</n-button>
            <n-button size="small" secondary @click="decodeUrl">URL 解码</n-button>
            <n-button size="small" quaternary @click="swapUrl">上下互换</n-button>
          </div>
          <div class="flex items-center space-x-2">
            <n-button size="small" secondary @click="copy(urlOutput)">复制结果</n-button>
            <n-button size="small" quaternary @click="clearUrl">清空</n-button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <div class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">输入 URL 或字符串</div>
            <n-input
              v-model:value="urlInput"
              type="textarea"
              placeholder="例如: https://example.com/search?q=代码工具盒&type=1"
              :rows="12"
            />
          </div>
          <div class="space-y-1">
            <div class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">输出结果</div>
            <n-input
              v-model:value="urlOutput"
              type="textarea"
              placeholder="转换结果将在此呈现..."
              :rows="12"
              readonly
            />
          </div>
        </div>
      </div>

      <!-- 模式 3: 哈希散列 (MD5 / SHA-1 / SHA-256 / SHA-512) -->
      <div v-else-if="activeTab === 'hash'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-xs text-zinc-500 dark:text-zinc-400">大写输出:</span>
            <n-switch v-model:value="hashUppercase" size="small" @update:value="calculateHashes" />
          </div>
          <n-button size="small" quaternary @click="clearHash">清空输入</n-button>
        </div>

        <div class="space-y-1">
          <div class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">输入文本 (实时计算各类哈希)</div>
          <n-input
            v-model:value="hashInput"
            type="textarea"
            placeholder="输入任意字符串，自动计算 MD5、SHA-1、SHA-256、SHA-512..."
            :rows="4"
            @update:value="calculateHashes"
          />
        </div>

        <div class="space-y-2 pt-2 text-xs">
          <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-1 transition-colors">
            <div class="flex items-center justify-between">
              <span class="font-bold text-emerald-600 dark:text-emerald-400">MD5 (128-bit)</span>
              <n-button size="tiny" secondary @click="copy(hashResults.md5)">复制</n-button>
            </div>
            <div class="font-mono text-zinc-800 dark:text-zinc-200 select-all break-all">{{ hashResults.md5 || '-' }}</div>
          </div>

          <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-1 transition-colors">
            <div class="flex items-center justify-between">
              <span class="font-bold text-blue-600 dark:text-blue-400">SHA-1 (160-bit)</span>
              <n-button size="tiny" secondary @click="copy(hashResults.sha1)">复制</n-button>
            </div>
            <div class="font-mono text-zinc-800 dark:text-zinc-200 select-all break-all">{{ hashResults.sha1 || '-' }}</div>
          </div>

          <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-1 transition-colors">
            <div class="flex items-center justify-between">
              <span class="font-bold text-indigo-600 dark:text-indigo-400">SHA-256 (256-bit)</span>
              <n-button size="tiny" secondary @click="copy(hashResults.sha256)">复制</n-button>
            </div>
            <div class="font-mono text-zinc-800 dark:text-zinc-200 select-all break-all">{{ hashResults.sha256 || '-' }}</div>
          </div>

          <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-1 transition-colors">
            <div class="flex items-center justify-between">
              <span class="font-bold text-purple-600 dark:text-purple-400">SHA-512 (512-bit)</span>
              <n-button size="tiny" secondary @click="copy(hashResults.sha512)">复制</n-button>
            </div>
            <div class="font-mono text-zinc-200 select-all break-all text-[11px]">{{ hashResults.sha512 || '-' }}</div>
          </div>
        </div>
      </div>

      <!-- 模式 4: Unicode -->
      <div v-else-if="activeTab === 'unicode'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <n-button size="small" type="primary" secondary @click="encodeUnicode">中文 ➔ Unicode</n-button>
            <n-button size="small" secondary @click="decodeUnicode">Unicode ➔ 中文</n-button>
          </div>
          <div class="flex items-center space-x-2">
            <n-button size="small" secondary @click="copy(unicodeOutput)">复制结果</n-button>
            <n-button size="small" quaternary @click="clearUnicode">清空</n-button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <div class="text-xs text-zinc-400 font-medium">输入文本 (如: 代码工具盒)</div>
            <n-input
              v-model:value="unicodeInput"
              type="textarea"
              placeholder="请输入普通文本或 Unicode 编码如 \u4e2d\u6587..."
              :rows="12"
            />
          </div>
          <div class="space-y-1">
            <div class="text-xs text-zinc-400 font-medium">转换结果</div>
            <n-input
              v-model:value="unicodeOutput"
              type="textarea"
              placeholder="转换结果..."
              :rows="12"
              readonly
            />
          </div>
        </div>
      </div>

      <!-- 模式 5: Hex 十六进制 -->
      <div v-else-if="activeTab === 'hex'" class="space-y-4">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-2">
            <n-button size="small" type="primary" secondary @click="encodeHex">字符串 ➔ Hex</n-button>
            <n-button size="small" secondary @click="decodeHex">Hex ➔ 字符串</n-button>
          </div>
          <div class="flex items-center space-x-2">
            <n-button size="small" secondary @click="copy(hexOutput)">复制结果</n-button>
            <n-button size="small" quaternary @click="clearHex">清空</n-button>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="space-y-1">
            <div class="text-xs text-zinc-400 font-medium">输入内容</div>
            <n-input
              v-model:value="hexInput"
              type="textarea"
              placeholder="输入普通文本或 Hex 字符串 (例如 48656c6c6f)..."
              :rows="12"
            />
          </div>
          <div class="space-y-1">
            <div class="text-xs text-zinc-400 font-medium">Hex 转换结果</div>
            <n-input
              v-model:value="hexOutput"
              type="textarea"
              placeholder="结果..."
              :rows="12"
              readonly
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import CryptoJS from 'crypto-js'

const message = useMessage()
const activeTab = ref('base64')

// Base64
const base64Input = ref('Hello CodeKit!')
const base64Output = ref('')

function encodeBase64(): void {
  try {
    const words = CryptoJS.enc.Utf8.parse(base64Input.value)
    base64Output.value = CryptoJS.enc.Base64.stringify(words)
    message.success('Base64 编码完成')
  } catch (err: any) {
    message.error(err.message)
  }
}

function decodeBase64(): void {
  try {
    const words = CryptoJS.enc.Base64.parse(base64Input.value)
    base64Output.value = CryptoJS.enc.Utf8.stringify(words)
    message.success('Base64 解码完成')
  } catch (err: any) {
    message.error('无效的 Base64 格式')
  }
}

function swapBase64(): void {
  const tmp = base64Input.value
  base64Input.value = base64Output.value
  base64Output.value = tmp
}

function clearBase64(): void {
  base64Input.value = ''
  base64Output.value = ''
}

// URL
const urlInput = ref('https://codekit.app/search?title=代码工具盒&tab=1')
const urlOutput = ref('')

function encodeUrl(): void {
  urlOutput.value = encodeURIComponent(urlInput.value)
  message.success('URL 编码完成')
}

function decodeUrl(): void {
  try {
    urlOutput.value = decodeURIComponent(urlInput.value)
    message.success('URL 解码完成')
  } catch {
    message.error('解码失败：包含不合法的 URI 序列')
  }
}

function swapUrl(): void {
  const tmp = urlInput.value
  urlInput.value = urlOutput.value
  urlOutput.value = tmp
}

function clearUrl(): void {
  urlInput.value = ''
  urlOutput.value = ''
}

// Hash
const hashInput = ref('123456')
const hashUppercase = ref(false)
const hashResults = reactive({
  md5: '',
  sha1: '',
  sha256: '',
  sha512: ''
})

function calculateHashes(): void {
  if (!hashInput.value) {
    hashResults.md5 = ''
    hashResults.sha1 = ''
    hashResults.sha256 = ''
    hashResults.sha512 = ''
    return
  }

  let m = CryptoJS.MD5(hashInput.value).toString()
  let s1 = CryptoJS.SHA1(hashInput.value).toString()
  let s256 = CryptoJS.SHA256(hashInput.value).toString()
  let s512 = CryptoJS.SHA512(hashInput.value).toString()

  if (hashUppercase.value) {
    m = m.toUpperCase()
    s1 = s1.toUpperCase()
    s256 = s256.toUpperCase()
    s512 = s512.toUpperCase()
  }

  hashResults.md5 = m
  hashResults.sha1 = s1
  hashResults.sha256 = s256
  hashResults.sha512 = s512
}

function clearHash(): void {
  hashInput.value = ''
  calculateHashes()
}

// Unicode
const unicodeInput = ref('代码工具盒')
const unicodeOutput = ref('')

function encodeUnicode(): void {
  unicodeOutput.value = unicodeInput.value
    .split('')
    .map((c) => {
      const code = c.charCodeAt(0)
      return code > 127 ? '\\u' + code.toString(16).padStart(4, '0') : c
    })
    .join('')
  message.success('Unicode 转换完成')
}

function decodeUnicode(): void {
  try {
    unicodeOutput.value = unicodeInput.value.replace(/\\u([0-9a-fA-F]{4})/g, (_, grp) => {
      return String.fromCharCode(parseInt(grp, 16))
    })
    message.success('Unicode 解码完成')
  } catch {
    message.error('解码失败')
  }
}

function clearUnicode(): void {
  unicodeInput.value = ''
  unicodeOutput.value = ''
}

// Hex
const hexInput = ref('CodeKit')
const hexOutput = ref('')

function encodeHex(): void {
  const words = CryptoJS.enc.Utf8.parse(hexInput.value)
  hexOutput.value = CryptoJS.enc.Hex.stringify(words)
  message.success('Hex 转换完成')
}

function decodeHex(): void {
  try {
    const words = CryptoJS.enc.Hex.parse(hexInput.value.replace(/\s+/g, ''))
    hexOutput.value = CryptoJS.enc.Utf8.stringify(words)
    message.success('Hex 解码完成')
  } catch {
    message.error('无效的 Hex 字符串')
  }
}

function clearHex(): void {
  hexInput.value = ''
  hexOutput.value = ''
}

onMounted(() => {
  encodeBase64()
  encodeUrl()
  calculateHashes()
  encodeUnicode()
  encodeHex()
})

async function copy(text: string): Promise<void> {
  if (!text) return
  if (window.electronAPI) {
    await window.electronAPI.writeClipboard(text)
  } else {
    navigator.clipboard.writeText(text)
  }
  message.success('已复制到剪贴板')
}
</script>
