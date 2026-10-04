import { onScopeDispose, ref, shallowRef, watch } from 'vue'
import { generateQrCode, type QrCodeImage } from './qrcode'

export function useQrCode(generate = generateQrCode) {
  const input = ref('')
  const image = shallowRef<QrCodeImage | null>(null)
  const pending = ref(false)
  const error = ref('')
  let revision = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  watch(input, (content) => {
    const current = ++revision
    clearTimeout(timer)
    image.value = null
    error.value = ''
    pending.value = content.length > 0
    if (!pending.value) return

    timer = setTimeout(async () => {
      try {
        const result = await generate(content)
        if (current === revision) image.value = result
      } catch (cause) {
        if (current === revision) {
          error.value = cause instanceof Error ? cause.message : '二维码生成失败，请重试。'
        }
      } finally {
        if (current === revision) pending.value = false
      }
    }, 300)
  }, { flush: 'sync' })

  onScopeDispose(() => {
    ++revision
    clearTimeout(timer)
  })

  return { input, image, pending, error }
}
