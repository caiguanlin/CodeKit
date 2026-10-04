<template>
  <div class="space-y-3">
    <section class="crypto-card p-4 space-y-3" :aria-label="`${mode.toUpperCase()} 密钥设置`">
      <div class="flex items-center justify-between gap-3 flex-wrap">
        <div class="space-y-1">
          <h2 class="m-0 text-sm font-semibold">{{ isAes ? 'AES-256-GCM · 对称加密' : 'RSA-OAEP / SHA-256 · 非对称加密' }}</h2>
          <p class="m-0 text-xs text-[var(--text-secondary)]">
            {{ isAes ? '使用同一个密钥加密和解密；可生成新密钥，也可粘贴已有密钥。' : '公钥加密、私钥解密；可生成密钥对，也可粘贴已有的 PEM 密钥。' }}
          </p>
        </div>
        <n-button size="small" type="primary" secondary :loading="busy === 'generate'" :disabled="!!busy" @click="generateKeys">
          {{ isAes ? '生成密钥' : '生成密钥对（2048 位）' }}
        </n-button>
      </div>
      <div v-if="isAes" class="space-y-2">
        <div class="flex items-center justify-between gap-2">
          <label :for="`${mode}-key`" class="crypto-label">密钥（Base64，32 字节）</label>
          <n-button size="tiny" quaternary :disabled="!sharedKey" @click="$emit('copy', sharedKey)">复制密钥</n-button>
        </div>
        <n-input v-model:value="sharedKey" :input-props="{ id: `${mode}-key` }" :disabled="!!busy" placeholder="点击生成密钥，或粘贴已有的 Base64 密钥" />
      </div>
      <div v-else class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div class="space-y-2 min-w-0">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <label for="rsa-public-key" class="crypto-label">公钥（SPKI PEM，用于加密）</label>
            <div class="flex items-center gap-1 ml-auto shrink-0">
              <n-button size="tiny" quaternary :disabled="!publicKey" @click="$emit('copy', publicKey)">复制公钥</n-button>
              <n-button size="tiny" quaternary :disabled="!publicKey.trim() || !!busy || !!downloadingKey" :loading="downloadingKey === 'public'" @click="downloadKey('public')">下载公钥</n-button>
            </div>
          </div>
          <n-input v-model:value="publicKey" type="textarea" :rows="4" :input-props="{ id: 'rsa-public-key' }" :disabled="!!busy" placeholder="-----BEGIN PUBLIC KEY-----" />
        </div>
        <div class="space-y-2 min-w-0">
          <div class="flex items-center justify-between gap-2 flex-wrap">
            <label for="rsa-private-key" class="crypto-label">私钥（PKCS#8 PEM，用于解密）</label>
            <div class="flex items-center gap-1 ml-auto shrink-0">
              <n-button size="tiny" quaternary :disabled="!privateKey" @click="$emit('copy', privateKey)">复制私钥</n-button>
              <n-button size="tiny" quaternary :disabled="!privateKey.trim() || !!busy || !!downloadingKey" :loading="downloadingKey === 'private'" @click="downloadKey('private')">下载私钥</n-button>
            </div>
          </div>
          <n-input v-model:value="privateKey" type="textarea" :rows="4" :input-props="{ id: 'rsa-private-key' }" :disabled="!!busy" placeholder="-----BEGIN PRIVATE KEY-----" />
        </div>
      </div>
      <p class="m-0 crypto-label">{{ isAes ? '密文 JSON 已包含随机 IV 和认证标签，解密时请完整粘贴。' : '生成的 2048 位密钥最多加密 190 个 UTF-8 字节；较长文本请使用 AES。OAEP 使用 SHA-256 和空标签。' }}</p>
      <p v-if="keyError" class="crypto-error" role="alert">{{ keyError }}</p>
    </section>

    <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
      <section class="crypto-card p-4 space-y-3 min-w-0" :aria-label="`${mode.toUpperCase()} 加密`">
        <div class="flex items-center justify-between gap-2">
          <h2 class="m-0 text-sm font-semibold">加密</h2>
          <n-button size="tiny" quaternary :disabled="!!busy" @click="clearEncrypt">清空加密</n-button>
        </div>
        <label :for="`${mode}-plaintext`" class="block crypto-label">原始文本</label>
        <n-input v-model:value="plaintext" type="textarea" :rows="5" :input-props="{ id: `${mode}-plaintext` }" :disabled="!!busy" placeholder="输入需要加密的文本，支持中文、换行和 emoji" />
        <div class="flex items-center gap-2 flex-wrap">
          <n-button size="small" type="primary" :loading="busy === 'encrypt'" :disabled="!!busy || !plaintext || !encryptionKey.trim()" @click="encrypt">加密文本</n-button>
          <n-button size="small" secondary :disabled="!!busy || encrypted === null" @click="useEncrypted">填入解密</n-button>
        </div>
        <p v-if="encryptError" class="crypto-error" role="alert">{{ encryptError }}</p>
        <div class="crypto-label">加密结果（{{ isAes ? '密文 JSON' : 'Base64 密文' }}，点击复制）</div>
        <button type="button" class="crypto-result" :disabled="encrypted === null" :aria-label="`复制 ${mode.toUpperCase()} 加密结果`" @click="copyResult(encrypted)"><span>{{ encrypted ?? '加密后在这里显示密文' }}</span></button>
      </section>

      <section class="crypto-card p-4 space-y-3 min-w-0" :aria-label="`${mode.toUpperCase()} 解密`">
        <div class="flex items-center justify-between gap-2">
          <h2 class="m-0 text-sm font-semibold">解密</h2>
          <n-button size="tiny" quaternary :disabled="!!busy" @click="clearDecrypt">清空解密</n-button>
        </div>
        <label :for="`${mode}-ciphertext`" class="block crypto-label">{{ isAes ? '完整密文 JSON' : 'Base64 密文' }}</label>
        <n-input v-model:value="ciphertext" type="textarea" :rows="5" :input-props="{ id: `${mode}-ciphertext` }" :disabled="!!busy" placeholder="粘贴密文，或点击左侧「填入解密」" />
        <n-button size="small" type="primary" :loading="busy === 'decrypt'" :disabled="!!busy || !ciphertext.trim() || !decryptionKey.trim()" @click="decrypt">解密文本</n-button>
        <p v-if="decryptError" class="crypto-error" role="alert">{{ decryptError }}</p>
        <div class="crypto-label">解密结果（原始文本，点击复制）</div>
        <button type="button" class="crypto-result" :disabled="decrypted === null || decrypted === ''" :aria-label="`复制 ${mode.toUpperCase()} 解密结果`" @click="copyResult(decrypted)"><span>{{ decrypted === '' ? '解密成功，原文为空文本' : decrypted ?? '解密后在这里显示加密前的原始文本' }}</span></button>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useMessage } from 'naive-ui'
import { generateAesKey, generateRsaKeys, encryptAes, decryptAes, encryptRsa, decryptRsa } from './crypto'

const props = defineProps<{ mode: 'aes' | 'rsa' }>()
const emit = defineEmits<{ copy: [text: string] }>()
const message = useMessage()
const isAes = computed(() => props.mode === 'aes')
const sharedKey = ref('')
const publicKey = ref('')
const privateKey = ref('')
const plaintext = ref('')
const ciphertext = ref('')
const encrypted = ref<string | null>(null)
const decrypted = ref<string | null>(null)
const keyError = ref('')
const encryptError = ref('')
const decryptError = ref('')
const busy = ref<'' | 'generate' | 'encrypt' | 'decrypt'>('')
const downloadingKey = ref<'public' | 'private' | ''>('')
const encryptionKey = computed(() => isAes.value ? sharedKey.value : publicKey.value)
const decryptionKey = computed(() => isAes.value ? sharedKey.value : privateKey.value)

watch([plaintext, encryptionKey], () => { encrypted.value = null; encryptError.value = '' }, { flush: 'sync' })
watch([ciphertext, decryptionKey], () => { decrypted.value = null; decryptError.value = '' }, { flush: 'sync' })
watch([sharedKey, publicKey, privateKey], () => { keyError.value = '' })

function downloadKey(kind: 'public' | 'private'): void {
  const content = kind === 'public' ? publicKey.value : privateKey.value
  if (!content.trim() || busy.value || downloadingKey.value) return
  downloadingKey.value = kind
  try {
    // 与 JSON 工具盒一致，走内置下载流程，避免热更新时 preload / 主进程接口不同步。
    const url = URL.createObjectURL(new Blob([content], { type: 'application/x-pem-file' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `rsa-${kind}-key.pem`
    try {
      document.body.appendChild(link)
      link.click()
    } finally {
      link.remove()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    }
  } catch (error: unknown) {
    message.error(`下载失败: ${error instanceof Error ? error.message : String(error)}`)
  } finally {
    downloadingKey.value = ''
  }
}

async function generateKeys(): Promise<void> {
  if (busy.value) return
  busy.value = 'generate'
  keyError.value = ''
  try {
    if (isAes.value) sharedKey.value = await generateAesKey()
    else {
      const keys = await generateRsaKeys()
      publicKey.value = keys.publicKey
      privateKey.value = keys.privateKey
    }
  } catch {
    keyError.value = '密钥生成失败，请重试'
  } finally { busy.value = '' }
}

async function encrypt(): Promise<void> {
  if (busy.value) return
  busy.value = 'encrypt'
  encrypted.value = null
  encryptError.value = ''
  try {
    encrypted.value = await (isAes.value ? encryptAes : encryptRsa)(plaintext.value, encryptionKey.value)
  } catch (error: unknown) {
    encryptError.value = error instanceof Error ? error.message : '加密失败，请检查文本和密钥'
  } finally { busy.value = '' }
}

async function decrypt(): Promise<void> {
  if (busy.value) return
  busy.value = 'decrypt'
  decrypted.value = null
  decryptError.value = ''
  try {
    decrypted.value = await (isAes.value ? decryptAes : decryptRsa)(ciphertext.value, decryptionKey.value)
  } catch (error: unknown) {
    decryptError.value = error instanceof Error ? error.message : '解密失败，请检查密文和密钥'
  } finally { busy.value = '' }
}

function useEncrypted(): void {
  if (encrypted.value !== null) ciphertext.value = encrypted.value
}

function clearEncrypt(): void {
  plaintext.value = ''
  encrypted.value = null
  encryptError.value = ''
}

function clearDecrypt(): void {
  ciphertext.value = ''
  decrypted.value = null
  decryptError.value = ''
}

function copyResult(value: string | null): void {
  if (value) emit('copy', value)
}
</script>

<style scoped>
.crypto-card {
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
  color: var(--text-primary);
}

.crypto-label {
  color: var(--text-secondary);
  font-size: 12px;
}

.crypto-error {
  margin: 0;
  color: #dc2626;
  font-size: 12px;
}

:global(html.dark) .crypto-error {
  color: #f87171;
}

.crypto-result {
  display: flex;
  align-items: flex-start;
  width: 100%;
  min-width: 0;
  min-height: 140px;
  max-height: 300px;
  overflow-y: auto;
  padding: 12px;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background: var(--card-sub-bg);
  color: var(--text-primary);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 12px;
  line-height: 1.7;
  text-align: left;
  white-space: pre-wrap;
  overflow-wrap: anywhere;
}

.crypto-result:not(:disabled):hover { background: var(--hover-bg); }
.crypto-result:focus-visible { outline: 2px solid #10b981; outline-offset: 2px; }
.crypto-result:disabled { cursor: default; }
</style>
