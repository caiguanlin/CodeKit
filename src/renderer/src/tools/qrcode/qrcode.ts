import QRCode from 'qrcode'

export interface QrCodeImage {
  dataUrl: string
  png: Blob
  size: number
}

const CAPACITY_MESSAGE = '内容超出二维码容量，请减少内容后重试。'

export async function generateQrCode(content: string): Promise<QrCodeImage> {
  if (content.length === 0) throw new Error('请输入要生成二维码的内容。')
  // Version 40 / M can hold at most 5596 numeric characters. Bound work before
  // encoding; the encoder checks the actual capacity for each content type.
  if (content.length > 5596) throw new Error(CAPACITY_MESSAGE)

  let modules: number
  try {
    modules = QRCode.create(content, { errorCorrectionLevel: 'M' }).modules.size
  } catch (error) {
    if (error instanceof Error && /too big/i.test(error.message)) {
      throw new Error(CAPACITY_MESSAGE)
    }
    throw error
  }

  const margin = 4
  const scale = Math.ceil(512 / (modules + margin * 2))
  const size = (modules + margin * 2) * scale
  const dataUrl = await QRCode.toDataURL(content, {
    errorCorrectionLevel: 'M',
    margin,
    scale,
    color: { dark: '#000000ff', light: '#ffffffff' }
  })
  const bytes = Uint8Array.from(atob(dataUrl.slice(dataUrl.indexOf(',') + 1)), (char) => char.charCodeAt(0))
  return { dataUrl, png: new Blob([bytes], { type: 'image/png' }), size }
}
