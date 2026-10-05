<template>
  <div class="qr-page">
    <header class="qr-heading">
      <div class="qr-heading-main">
        <span class="qr-tool-icon" aria-hidden="true"><n-icon :size="22"><QrCodeOutline /></n-icon></span>
        <div>
          <h1>二维码工具</h1>
          <p>让文本与链接，变成一扫即达的二维码</p>
        </div>
      </div>
      <span class="qr-privacy"><n-icon :size="14" aria-hidden="true"><ShieldCheckmarkOutline /></n-icon>本地生成 · 隐私安全</span>
    </header>

    <div class="qr-workspace">
      <section class="qr-editor" aria-labelledby="qr-input-label">
        <div class="qr-section-heading">
          <label id="qr-input-label" for="qr-input">输入内容</label>
          <n-button size="tiny" quaternary :disabled="input.length === 0" @click="input = ''">
            <template #icon><n-icon><TrashOutline /></n-icon></template>
            清空
          </n-button>
        </div>
        <p class="qr-section-description">文本、网址，或任何你想分享的内容</p>

        <div class="qr-input-shell">
          <textarea
            id="qr-input"
            v-model="input"
            spellcheck="false"
            aria-describedby="qr-input-hint"
            placeholder="在这里输入或粘贴内容…&#10;&#10;例如 https://example.com"
          />
          <div class="qr-input-footer">
            <span>保留空格与换行</span>
            <span class="qr-count">{{ characterCount.toLocaleString() }} 字符</span>
          </div>
        </div>

        <div id="qr-input-hint" class="qr-tip">
          <n-icon :size="17" aria-hidden="true"><InformationCircleOutline /></n-icon>
          <p>扫码打开网页时，请输入包含 <span>https://</span> 或 <span>http://</span> 的完整网址。</p>
        </div>
      </section>

      <section class="qr-result" aria-labelledby="qr-preview-label" :aria-busy="pending">
        <div class="qr-section-heading">
          <h2 id="qr-preview-label">二维码预览</h2>
          <span class="qr-status" :class="{ 'is-ready': image, 'is-error': error }" role="status">
            <span class="qr-status-dot" aria-hidden="true"></span>
            {{ pending ? '生成中' : error ? '生成失败' : image ? '已生成' : '等待输入' }}
          </span>
        </div>

        <div class="qr-preview-stage">
          <div class="qr-preview" :class="{ 'has-image': image }">
            <img v-if="image" :src="image.dataUrl" :width="image.size" :height="image.size" alt="根据输入内容生成的二维码" class="qr-image" />
            <div v-else class="qr-placeholder" role="status" aria-live="polite">
              <template v-if="pending">
                <n-spin size="small" />
                <strong>正在生成二维码…</strong>
              </template>
              <template v-else-if="error">
                <n-icon :size="32" class="qr-error-icon" aria-hidden="true"><AlertCircleOutline /></n-icon>
                <strong>暂时无法生成</strong>
                <span>{{ error }}</span>
              </template>
              <template v-else>
                <span class="qr-empty-icon" aria-hidden="true"><n-icon :size="40"><QrCodeOutline /></n-icon></span>
                <strong>等待你的内容</strong>
                <span>输入内容，即可自动生成</span>
              </template>
            </div>
          </div>
          <span class="qr-image-meta">{{ image ? `PNG · ${image.size} × ${image.size} 像素` : '输入即生成，无需额外操作' }}</span>
        </div>

        <n-button class="qr-download" type="primary" block :disabled="!image || pending" @click="downloadPng">
          <template #icon><n-icon><DownloadOutline /></n-icon></template>
          导出 PNG
        </n-button>
        <p class="qr-scan-hint"><n-icon :size="14" aria-hidden="true"><ScanOutline /></n-icon>使用微信扫一扫，或保存后从相册识别</p>
      </section>
    </div>
    <p class="qr-footnote"><n-icon :size="13" aria-hidden="true"><LockClosedOutline /></n-icon>内容仅在当前设备处理，不会上传至服务器</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useMessage } from 'naive-ui'
import {
  AlertCircleOutline,
  DownloadOutline,
  InformationCircleOutline,
  LockClosedOutline,
  QrCodeOutline,
  ScanOutline,
  ShieldCheckmarkOutline,
  TrashOutline
} from '@vicons/ionicons5'
import { useQrCode } from './useQrCode'

const { input, image, pending, error } = useQrCode()
const characterCount = computed(() => Array.from(input.value).length)
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
.qr-page {
  --qr-accent: #047857;
  --qr-accent-soft: #ecfdf5;
  container-type: inline-size;
  max-width: 1120px;
  margin: 0 auto;
  padding: 8px 0;
}

html.dark .qr-page {
  --qr-accent: #6ee7b7;
  --qr-accent-soft: #15352c;
}

.qr-heading,
.qr-heading-main,
.qr-section-heading,
.qr-input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.qr-heading { margin-bottom: 24px; }
.qr-heading-main { justify-content: flex-start; }
.qr-heading h1 { margin: 0; font-size: 20px; font-weight: 650; letter-spacing: -0.5px; }
.qr-heading p { margin: 5px 0 0; color: var(--text-secondary); font-size: 12px; }
.qr-tool-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border: 1px solid color-mix(in srgb, var(--qr-accent) 15%, transparent);
  border-radius: 13px;
  background: var(--qr-accent-soft);
  color: var(--qr-accent);
  flex-shrink: 0;
}

.qr-privacy,
.qr-footnote,
.qr-scan-hint {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  color: var(--text-secondary);
  font-size: 11px;
}
.qr-privacy { color: var(--qr-accent); white-space: nowrap; }
.qr-workspace {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 16px;
  background: var(--card-bg);
  box-shadow: 0 4px 20px rgb(0 0 0 / 2%);
}
.qr-editor,
.qr-result { min-width: 0; padding: 24px; }
.qr-editor { display: flex; flex-direction: column; }
.qr-section-heading { min-height: 24px; }
.qr-section-heading label,
.qr-section-heading h2 { margin: 0; font-size: 13px; font-weight: 600; }
.qr-section-description { margin: 6px 0 20px; color: var(--text-secondary); font-size: 12px; }
.qr-input-shell {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-height: 260px;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 10px;
  background: var(--card-bg);
  transition: border-color 0.15s, box-shadow 0.15s;
}
.qr-input-shell:focus-within {
  border-color: var(--qr-accent);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--qr-accent) 9%, transparent);
}
.qr-input-shell textarea {
  display: block;
  flex: 1;
  width: 100%;
  min-height: 220px;
  padding: 16px;
  resize: none;
  outline: none;
  border: 0;
  background: transparent;
  color: var(--text-primary);
  font: 13px/1.8 'Cascadia Code', Consolas, 'Microsoft YaHei', monospace;
}
.qr-input-shell textarea::placeholder { color: var(--text-muted); }
.qr-input-footer { padding: 10px 14px; border-top: 1px solid var(--border-sub-color); color: var(--text-secondary); font-size: 11px; }
.qr-count { font-variant-numeric: tabular-nums; }
.qr-tip { display: flex; align-items: flex-start; gap: 8px; margin-top: 16px; color: var(--text-secondary); }
.qr-tip > .n-icon { flex-shrink: 0; margin-top: 1px; }
.qr-tip p { margin: 0; font-size: 11px; line-height: 1.8; }
.qr-tip p span { font-family: Consolas, monospace; }
.qr-result { border-left: 1px solid var(--border-color); background: color-mix(in srgb, var(--card-sub-bg) 45%, var(--card-bg)); }
.qr-status { display: inline-flex; align-items: center; gap: 5px; color: var(--text-secondary); font-size: 10px; }
.qr-status-dot { width: 5px; height: 5px; border-radius: 50%; background: currentColor; }
.qr-status.is-ready { color: var(--qr-accent); }
.qr-status.is-error,
.qr-error-icon { color: #e05252; }
.qr-preview-stage {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin: 18px 0;
  padding: 20px 12px 16px;
  border: 1px solid var(--border-sub-color);
  border-radius: 12px;
  background-image: radial-gradient(var(--border-color) 0.8px, transparent 0.8px);
  background-size: 12px 12px;
}
.qr-preview {
  width: 228px;
  max-width: 100%;
  aspect-ratio: 1;
  overflow: hidden;
  border: 1px solid var(--border-color);
  border-radius: 12px;
  background: var(--card-bg);
  box-shadow: 0 4px 12px rgb(0 0 0 / 4%);
}
.qr-preview.has-image { border-color: #fff; background: #fff; }
.qr-image { display: block; width: 100%; height: 100%; image-rendering: pixelated; }
.qr-placeholder {
  display: flex;
  height: 100%;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 18px;
  text-align: center;
  color: var(--text-secondary);
  font-size: 11px;
  line-height: 1.7;
}
.qr-placeholder strong { color: var(--text-primary); font-size: 13px; font-weight: 500; }
.qr-empty-icon { display: flex; padding: 14px; margin-bottom: 4px; border-radius: 18px; background: var(--card-sub-bg); color: var(--text-muted); }
.qr-image-meta { min-height: 18px; color: var(--text-secondary); font-size: 10px; font-variant-numeric: tabular-nums; }
.qr-download { height: 36px; border-radius: 8px; font-size: 12px; }
.qr-scan-hint { margin: 12px 0 0; font-size: 10px; }
.qr-footnote { margin: 18px 0 0; }

@container (max-width: 720px) {
  .qr-heading { flex-wrap: wrap; gap: 14px; margin-bottom: 20px; }
  .qr-workspace { grid-template-columns: minmax(0, 1fr); }
  .qr-editor, .qr-result { padding: 20px; }
  .qr-result { border-left: 0; border-top: 1px solid var(--border-color); }
  .qr-preview-stage { margin-top: 16px; }
}
</style>
