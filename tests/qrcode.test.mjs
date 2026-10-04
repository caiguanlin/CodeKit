import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'
import jsQR from 'jsqr'
import { PNG } from 'pngjs'
import { effectScope } from 'vue'

async function loadModule(name, replacements = {}) {
  const source = await readFile(new URL(`../src/renderer/src/tools/qrcode/${name}.ts`, import.meta.url), 'utf8')
  const { outputText } = ts.transpileModule(source, {
    compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
  })
  const resolved = outputText.replace(/from (["'])([^"']+)\1/g, (_, quote, specifier) =>
    `from ${JSON.stringify(replacements[specifier] || import.meta.resolve(specifier))}`)
  return `data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`
}

const generatorUrl = await loadModule('qrcode')
const { generateQrCode } = await import(generatorUrl)
const { useQrCode } = await import(await loadModule('useQrCode', { './qrcode': generatorUrl }))

for (const content of [
  'CodeKit 1234',
  '你好，微信二维码！',
  '中文 😀🚀👨‍👩‍👧‍👦 café',
  '第一行\n第二行\r\n\t缩进',
  '  keep spaces  \n',
  ' \t\n ',
  'https://example.com/search?q=%E4%B8%AD%E6%96%87&emoji=%F0%9F%98%80#result'
]) {
  test(`exported PNG independently decodes original content: ${JSON.stringify(content)}`, async () => {
    const image = await generateQrCode(content)
    assert.equal(image.png.type, 'image/png')
    const bytes = Buffer.from(await image.png.arrayBuffer())
    assert.deepEqual(bytes, Buffer.from(image.dataUrl.split(',')[1], 'base64'))
    const png = PNG.sync.read(bytes)
    assert.equal(png.width, image.size)
    assert.equal(png.height, image.size)
    assert.ok(image.size >= 512)
    const decoded = jsQR(new Uint8ClampedArray(png.data), png.width, png.height)
    assert.ok(decoded, 'independent decoder must recognize the PNG')
    assert.equal(decoded.data, content)

    const modules = 17 + decoded.version * 4
    const scale = image.size / (modules + 8)
    assert.ok(Number.isInteger(scale), 'modules must use an integer number of pixels')
    const margin = 4 * scale
    for (let y = 0; y < png.height; y++) {
      for (let x = 0; x < png.width; x++) {
        const offset = (y * png.width + x) * 4
        const [r, g, b, a] = png.data.subarray(offset, offset + 4)
        assert.ok(r === 0 || r === 255)
        assert.equal(r, g)
        assert.equal(r, b)
        assert.equal(a, 255, 'PNG must be opaque')
        if (x < margin || y < margin || x >= png.width - margin || y >= png.height - margin) {
          assert.equal(r, 255, 'all four quiet-zone edges must stay white')
        }
      }
    }
  })
}

test('empty and oversized content fail clearly without truncation', async () => {
  await assert.rejects(generateQrCode(''), /请输入/)
  await assert.rejects(generateQrCode('1'.repeat(5597)), /超出二维码容量/)
  await assert.rejects(generateQrCode('中'.repeat(800)), /超出二维码容量/)
  await assert.rejects(generateQrCode('a'.repeat(2332)), /超出二维码容量/)
  const image = await generateQrCode('a'.repeat(2331))
  const png = PNG.sync.read(Buffer.from(await image.png.arrayBuffer()))
  assert.equal(jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data, 'a'.repeat(2331))
})

function setup(t, generate) {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const scope = effectScope()
  const state = scope.run(() => useQrCode(generate))
  t.after(() => scope.stop())
  return { state, scope }
}

function deferred() {
  let resolve, reject
  const promise = new Promise((yes, no) => { resolve = yes; reject = no })
  return { promise, resolve, reject }
}

test('rapid edits debounce for 300ms and invalidate the previous export immediately', async (t) => {
  const calls = []
  const { state } = setup(t, async (content) => {
    calls.push(content)
    return { dataUrl: content }
  })
  state.input.value = 'first'
  t.mock.timers.tick(299)
  assert.deepEqual(calls, [])
  state.input.value = 'latest'
  t.mock.timers.tick(299)
  assert.deepEqual(calls, [])
  t.mock.timers.tick(1)
  await Promise.resolve()
  assert.deepEqual(calls, ['latest'])
  assert.equal(state.image.value.dataUrl, 'latest')
  state.input.value = 'edited'
  assert.equal(state.image.value, null)
  assert.equal(state.pending.value, true)
})

test('late results cannot replace a newer QR image', async (t) => {
  const first = deferred(), second = deferred()
  const { state } = setup(t, (content) => content === 'first' ? first.promise : second.promise)
  state.input.value = 'first'
  t.mock.timers.tick(300)
  state.input.value = 'second'
  t.mock.timers.tick(300)
  second.resolve({ dataUrl: 'second' })
  await Promise.resolve()
  first.resolve({ dataUrl: 'first' })
  await Promise.resolve()
  assert.equal(state.image.value.dataUrl, 'second')
  assert.equal(state.pending.value, false)
})

test('clearing cancels pending generation and ignores an in-flight result', async (t) => {
  const work = deferred()
  let calls = 0
  const { state } = setup(t, () => { calls++; return work.promise })
  state.input.value = 'cancel before debounce'
  state.input.value = ''
  t.mock.timers.tick(300)
  assert.equal(calls, 0)
  state.input.value = 'cancel in flight'
  t.mock.timers.tick(300)
  state.input.value = ''
  work.resolve({ dataUrl: 'stale' })
  await Promise.resolve()
  assert.equal(state.image.value, null)
  assert.equal(state.pending.value, false)
  assert.equal(state.error.value, '')
})

test('errors are recoverable and stale failures cannot overwrite newer success', async (t) => {
  const old = deferred()
  const { state } = setup(t, async (content) => {
    if (content === 'old') return old.promise
    if (content === 'bad') throw new Error('内容超出二维码容量')
    return { dataUrl: content }
  })
  state.input.value = 'bad'
  t.mock.timers.tick(300)
  await Promise.resolve()
  assert.match(state.error.value, /超出二维码容量/)
  assert.equal(state.pending.value, false)
  state.input.value = 'old'
  t.mock.timers.tick(300)
  state.input.value = 'good'
  assert.equal(state.error.value, '')
  t.mock.timers.tick(300)
  await Promise.resolve()
  old.reject(new Error('stale failure'))
  await old.promise.catch(() => {})
  await Promise.resolve()
  assert.equal(state.image.value.dataUrl, 'good')
  assert.equal(state.error.value, '')
})

test('disposing the page cancels scheduled work', (t) => {
  let calls = 0
  const { state, scope } = setup(t, async () => { calls++; return {} })
  state.input.value = 'pending'
  scope.stop()
  t.mock.timers.tick(300)
  assert.equal(calls, 0)
})
