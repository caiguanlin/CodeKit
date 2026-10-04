const encoder = new TextEncoder()
const decoder = new TextDecoder('utf-8', { fatal: true })
const rsaAlgorithm = { name: 'RSA-OAEP', hash: 'SHA-256' } as const

function toBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let offset = 0; offset < bytes.length; offset += 8192) {
    binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192))
  }
  return btoa(binary)
}

function fromBase64(text: string, label: string): Uint8Array<ArrayBuffer> {
  const normalized = text.replace(/\s+/g, '')
  if (!normalized || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(normalized)) {
    throw new Error(`${label}须为有效的 Base64 内容`)
  }
  const bytes = Uint8Array.from(atob(normalized), (character) => character.charCodeAt(0))
  if (toBase64(bytes) !== normalized) throw new Error(`${label}须为有效的 Base64 内容`)
  return bytes
}

async function importAesKey(key: string, usage: 'encrypt' | 'decrypt'): Promise<CryptoKey> {
  const bytes = fromBase64(key, 'AES 密钥')
  if (bytes.length !== 32) throw new Error('AES-256 密钥须为 32 字节，请生成密钥或粘贴对应的 Base64 密钥')
  return crypto.subtle.importKey('raw', bytes, 'AES-GCM', false, [usage])
}

export async function generateAesKey(): Promise<string> {
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt'])
  return toBase64(new Uint8Array(await crypto.subtle.exportKey('raw', key)))
}

export async function encryptAes(plaintext: string, keyText: string): Promise<string> {
  const key = await importAesKey(keyText, 'encrypt')
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const ciphertext = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, encoder.encode(plaintext))
  // 保留解密所需的随机 IV；Web Crypto 输出为密文后接 16 字节认证标签。
  return JSON.stringify({ version: 1, algorithm: 'AES-256-GCM', iv: toBase64(iv), ciphertext: toBase64(new Uint8Array(ciphertext)) }, null, 2)
}

export async function decryptAes(payload: string, keyText: string): Promise<string> {
  const key = await importAesKey(keyText, 'decrypt')
  let envelope: unknown
  try {
    envelope = JSON.parse(payload)
  } catch {
    throw new Error('请粘贴完整的 AES 密文 JSON（包含 iv 和 ciphertext）')
  }
  if (
    !envelope || typeof envelope !== 'object' ||
    !('version' in envelope) || envelope.version !== 1 ||
    !('algorithm' in envelope) || envelope.algorithm !== 'AES-256-GCM' ||
    !('iv' in envelope) || typeof envelope.iv !== 'string' ||
    !('ciphertext' in envelope) || typeof envelope.ciphertext !== 'string'
  ) throw new Error('密文格式不匹配，请使用本工具生成的 AES-256-GCM 密文 JSON')
  const iv = fromBase64(envelope.iv, 'IV')
  const ciphertext = fromBase64(envelope.ciphertext, '密文')
  if (iv.length !== 12 || ciphertext.length < 16) throw new Error('AES 密文不完整，请检查 IV 和 ciphertext')
  try {
    return decoder.decode(await crypto.subtle.decrypt({ name: 'AES-GCM', iv, tagLength: 128 }, key, ciphertext))
  } catch {
    throw new Error('解密失败：密钥不匹配、密文已损坏，或原文不是 UTF-8 文本')
  }
}

function toPem(bytes: ArrayBuffer, label: string): string {
  const content = toBase64(new Uint8Array(bytes)).match(/.{1,64}/g)!.join('\n')
  return `-----BEGIN ${label}-----\n${content}\n-----END ${label}-----`
}

async function importRsaKey(pem: string, usage: 'encrypt' | 'decrypt'): Promise<CryptoKey> {
  const label = usage === 'encrypt' ? 'PUBLIC KEY' : 'PRIVATE KEY'
  const format = usage === 'encrypt' ? 'spki' : 'pkcs8'
  const match = pem.trim().match(new RegExp(`^-----BEGIN ${label}-----([\\s\\S]+)-----END ${label}-----$`))
  if (!match) throw new Error(`请粘贴 ${usage === 'encrypt' ? 'SPKI 公钥（PUBLIC KEY）' : 'PKCS#8 私钥（PRIVATE KEY）'} PEM`)
  const bytes = fromBase64(match[1], 'RSA 密钥')
  try {
    return await crypto.subtle.importKey(format, bytes, rsaAlgorithm, false, [usage])
  } catch {
    throw new Error(`RSA ${usage === 'encrypt' ? '公钥' : '私钥'}无效，请检查 PEM 内容`)
  }
}

export async function generateRsaKeys(): Promise<{ publicKey: string; privateKey: string }> {
  const keys = await crypto.subtle.generateKey({ ...rsaAlgorithm, modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]) }, true, ['encrypt', 'decrypt'])
  const [publicKey, privateKey] = await Promise.all([
    crypto.subtle.exportKey('spki', keys.publicKey),
    crypto.subtle.exportKey('pkcs8', keys.privateKey)
  ])
  return { publicKey: toPem(publicKey, 'PUBLIC KEY'), privateKey: toPem(privateKey, 'PRIVATE KEY') }
}

export async function encryptRsa(plaintext: string, publicKey: string): Promise<string> {
  const key = await importRsaKey(publicKey, 'encrypt')
  const bytes = encoder.encode(plaintext)
  const maxBytes = Math.ceil((key.algorithm as RsaHashedKeyAlgorithm).modulusLength / 8) - 2 * 32 - 2
  if (bytes.length > maxBytes) throw new Error(`当前 RSA 密钥最多加密 ${maxBytes} 字节，输入为 ${bytes.length} 字节；较长文本请使用 AES`)
  return toBase64(new Uint8Array(await crypto.subtle.encrypt('RSA-OAEP', key, bytes)))
}

export async function decryptRsa(ciphertext: string, privateKey: string): Promise<string> {
  const key = await importRsaKey(privateKey, 'decrypt')
  const bytes = fromBase64(ciphertext, 'RSA 密文')
  try {
    return decoder.decode(await crypto.subtle.decrypt('RSA-OAEP', key, bytes))
  } catch {
    throw new Error('解密失败：私钥不匹配、密文已损坏，或加密参数不是 RSA-OAEP / SHA-256 / 空标签')
  }
}
