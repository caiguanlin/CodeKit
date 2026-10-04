import assert from 'node:assert/strict'
import { createCipheriv, createDecipheriv, createPublicKey, constants, privateDecrypt, publicEncrypt } from 'node:crypto'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

// 直接测试生产模块，不为浏览器端逻辑引入额外测试依赖。
const source = await readFile(new URL('../src/renderer/src/tools/codec/crypto.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } })
const { generateAesKey, encryptAes, decryptAes, generateRsaKeys, encryptRsa, decryptRsa } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)
const original = '  中文 🔐\nCodeKit\t保留换行和空格  '

test('AES generates 256-bit keys and uses fresh IVs for repeat encryption', async () => {
  const key = await generateAesKey()
  assert.equal(Buffer.from(key, 'base64').length, 32)
  const first = await encryptAes(original, key)
  const second = await encryptAes(original, key)
  assert.notEqual(JSON.parse(first).iv, JSON.parse(second).iv)
  assert.notEqual(first, second)
  assert.equal(await decryptAes(first, key), original)
})

test('AES-GCM output interoperates with Node crypto in both directions', async () => {
  const keyText = await generateAesKey()
  const key = Buffer.from(keyText, 'base64')
  const envelope = JSON.parse(await encryptAes(original, keyText))
  const combined = Buffer.from(envelope.ciphertext, 'base64')
  const decipher = createDecipheriv('aes-256-gcm', key, Buffer.from(envelope.iv, 'base64'))
  decipher.setAuthTag(combined.subarray(-16))
  assert.equal(Buffer.concat([decipher.update(combined.subarray(0, -16)), decipher.final()]).toString('utf8'), original)

  const iv = Buffer.from('00112233445566778899aabb', 'hex')
  const cipher = createCipheriv('aes-256-gcm', key, iv)
  const ciphertext = Buffer.concat([cipher.update(original, 'utf8'), cipher.final(), cipher.getAuthTag()])
  assert.equal(await decryptAes(JSON.stringify({ version: 1, algorithm: 'AES-256-GCM', iv: iv.toString('base64'), ciphertext: ciphertext.toString('base64') }), keyText), original)
})

test('AES rejects wrong keys, tampered data, malformed envelopes and invalid keys', async () => {
  const key = await generateAesKey()
  const encrypted = await encryptAes(original, key)
  await assert.rejects(decryptAes(encrypted, await generateAesKey()), /解密失败/)
  const tampered = JSON.parse(encrypted)
  const bytes = Buffer.from(tampered.ciphertext, 'base64')
  bytes[0] ^= 1
  tampered.ciphertext = bytes.toString('base64')
  await assert.rejects(decryptAes(JSON.stringify(tampered), key), /解密失败/)
  await assert.rejects(decryptAes('not json', key), /完整的 AES 密文 JSON/)
  await assert.rejects(decryptAes('{"version":2}', key), /格式不匹配/)
  await assert.rejects(encryptAes(original, '%%%'), /Base64/)
  await assert.rejects(encryptAes(original, Buffer.alloc(16).toString('base64')), /32 字节/)
})

test('AES decrypts known AES-256-GCM empty plaintext test vector', async () => {
  const payload = JSON.stringify({
    version: 1,
    algorithm: 'AES-256-GCM',
    iv: Buffer.alloc(12).toString('base64'),
    ciphertext: Buffer.from('530f8afbc74536b9a963b4f1c4cb738b', 'hex').toString('base64')
  })
  assert.equal(await decryptAes(payload, Buffer.alloc(32).toString('base64')), '')
})

const rsaKeys = generateRsaKeys()
test('RSA generates standard PEM keys and interoperates with Node OAEP SHA-256', async () => {
  const { publicKey, privateKey } = await rsaKeys
  assert.match(publicKey, /^-----BEGIN PUBLIC KEY-----/)
  assert.match(privateKey, /^-----BEGIN PRIVATE KEY-----/)
  assert.equal(createPublicKey(publicKey).asymmetricKeyDetails.modulusLength, 2048)
  const encrypted = await encryptRsa(original, publicKey)
  assert.equal(Buffer.from(encrypted, 'base64').length, 256)
  const options = { padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' }
  assert.equal(privateDecrypt({ key: privateKey, ...options }, Buffer.from(encrypted, 'base64')).toString('utf8'), original)
  const external = publicEncrypt({ key: publicKey, ...options }, Buffer.from(original)).toString('base64')
  assert.equal(await decryptRsa(external, privateKey), original)
})

test('RSA enforces its byte limit, including multibyte UTF-8 input', async () => {
  const { publicKey, privateKey } = await rsaKeys
  assert.equal(await decryptRsa(await encryptRsa('a'.repeat(190), publicKey), privateKey), 'a'.repeat(190))
  await assert.rejects(encryptRsa('a'.repeat(191), publicKey), /最多加密 190 字节/)
  await assert.rejects(encryptRsa('中'.repeat(64), publicKey), /输入为 192 字节/)
})

test('RSA rejects mismatched keys, damaged ciphertext and unsupported PEM', async () => {
  const { publicKey, privateKey } = await rsaKeys
  const encrypted = await encryptRsa(original, publicKey)
  await assert.rejects(decryptRsa(encrypted, (await generateRsaKeys()).privateKey), /私钥不匹配/)
  const tampered = Buffer.from(encrypted, 'base64')
  tampered[0] ^= 1
  await assert.rejects(decryptRsa(tampered.toString('base64'), privateKey), /解密失败/)
  await assert.rejects(decryptRsa('%%%', privateKey), /Base64/)
  await assert.rejects(encryptRsa(original, privateKey), /SPKI 公钥/)
  await assert.rejects(decryptRsa(encrypted, publicKey), /PKCS#8 私钥/)
})
