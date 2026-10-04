<template>
  <div class="h-full flex flex-col min-h-0 space-y-3">
    <div class="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap shrink-0 transition-colors">
      <h1 class="m-0 text-sm font-semibold">二维码工具</h1>
      <span class="text-xs text-zinc-500 dark:text-zinc-400">输入即生成 · 本地处理 · 支持微信扫码</span>
    </div>

    <div class="qr-panels flex-1 min-h-0 overflow-y-auto">
      <section class="qr-panel p-4 space-y-3" aria-labelledby="qr-input-label">
        <div class="flex items-center justify-between gap-3">
          <label id="qr-input-label" for="qr-input" class="text-xs font-medium">文本或链接</label>
          <n-button size="tiny" secondary :disabled="input.length === 0" @click="input = ''">清空</n-button>
        </div>
        <n-input
          v-model:value="input"
          type="textarea"
          :input-props="{ id: 'qr-input', spellcheck: false }"
          :autosize="{ minRows: 10, maxRows: 18 }"
          placeholder="输入或粘贴文本、网址…&#10;支持中文、emoji 和多行内容"
          class="font-mono"
        />
        <p class="m-0 text-xs leading-relaxed text-zinc-500 dark:text-zinc-400">完整保留空格与换行。需要扫码打开网页时，请输入包含 https:// 或 http:// 的完整网址。</p>
      </section>

      <section class="qr-panel p-4 flex flex-col items-center gap-4" aria-labelledby="qr-preview-label" :aria-busy="pending">
        <div class="w-full flex items-center justify-between gap-3">
          <h2 id="qr-preview-label" class="m-0 text-xs font-medium">二维码预览</h2>
          <n-button size="small" type="primary" :disabled="!image || pending" @click="downloadPng">导出 PNG</n-button>
        </div>
        <div class="qr-preview">
          <img v-if="image" :src="image.dataUrl" :width="image.size" :height="image.size" alt="根据输入内容生成的二维码" class="qr-image" />
          <div v-else class="qr-placeholder" role="status" aria-live="polite">
            <template v-if="pending">
              <n-spin size="small" />
              <span>正在生成二维码…</span>
            </template>
            <template v-else-if="error">
              <span class="text-red-600 dark:text-red-400">{{ error }}</span>
            </template>
            <template v-else>
              <n-icon :size="48" class="opacity-40"><QrCodeOutline /></n-icon>
              <span>输入内容后，二维码将在这里显示</span>
            </template>
          </div>
        </div>
        <div class="text-center text-xs leading-relaxed text-zinc-500 dark:text-zinc-400 space-y-1">
          <p class="m-0">使用微信“扫一扫”扫描屏幕，或导出后从相册识别。</p>
          <p v-if="image" class="m-0" aria-live="polite">PNG · {{ image.size }} × {{ image.size }} 像素</p>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessage } from 'naive-ui'
import { QrCodeOutline } from '@vicons/ionicons5'
import { useQrCode } from './useQrCode'

const { input, image, pending, error } = useQrCode()
const message = useMessage()

function downloadPng(): void {
  if (!image.value || pending.value) return
  const url = URL.createObjectURL(image.value.png)
  const link = document.createElement('a')
  try {
    link.href = url
    link.download = 'qrcode.png'
    document.body.appendChild(link)
    link.click()
  } catch (cause) {
    message.error(`导出失败：${cause instanceof Error ? cause.message : String(cause)}`)
  } finally {
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 1000)
  }
}
</script>

<style scoped>
.qr-panels {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  align-content: start;
  align-items: start;
  gap: 12px;
}

.qr-panel {
  min-width: 0;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
  transition: background-color 0.2s, border-color 0.2s;
}

.qr-preview {
  width: 100%;
  max-width: 360px;
  aspect-ratio: 1;
}

.qr-image {
  display: block;
  width: 100%;
  height: 100%;
  background: white;
  image-rendering: pixelated;
}

.qr-placeholder {
  height: 100%;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  border: 1px dashed var(--border-color);
  border-radius: 8px;
  color: var(--text-secondary);
  font-size: 12px;
  text-align: center;
}

@media (max-width: 1000px) {
  .qr-panels {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
