import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'
import { isLosslessNumber, parse } from 'lossless-json'
import { parse as parseComponent, compileScript } from 'vue/compiler-sfc'
import { createSSRApp } from 'vue'
import { renderToString } from 'vue/server-renderer'

const source = await readFile(new URL('../src/renderer/src/tools/json/json.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, {
  compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
})
const resolvedSource = outputText.replace("'lossless-json'", JSON.stringify(import.meta.resolve('lossless-json')))
const { convertJson } = await import(`data:text/javascript;base64,${Buffer.from(resolvedSource).toString('base64')}`)

const sample = String.raw`{"title":"JSON在线解析","json.url":"https://www.json.cn","Function":["JSON美化","//u003e","&nbsp;"," ","<h1>JSON在线解析</h1>",{"备注":["www.json.cn","json.cn"]}],"About":{"QQ":661275469},"Special":["&currency","&timestamp","&region","&params","&lt;&lt;sane&gt;&gt;","gbk -> utf-8"],"numbers":[305667554401374209,103248655202358790,123456789012345679,987654321098765432,246813579246813579,135792468013579246,864209864209864209,123456789098765432,987654321012345679,246813579135792468],"id2":22022621134265013,"BigNumber":71357798191653192098,"content":"永和九年，岁在癸丑。//n古人云：“死生亦大矣。”岂不痛哉！"}`

test('debug JSON restores with no quotes, ASCII quotes, Chinese quotes, or multiple string layers', () => {
  const escaped = JSON.stringify(sample)
  for (const input of [escaped.slice(1, -1), escaped, `“${escaped.slice(1, -1)}”`, JSON.stringify(escaped), sample]) {
    const output = convertJson(input, 'unescape')
    assert.equal(convertJson(output, 'minify'), sample)
    assert.equal(convertJson(output, 'unescape'), output)
    assert.match(output, /\n {4}"title": "JSON在线解析"/)
    const value = parse(output)
    assert.equal(isLosslessNumber(value.BigNumber), true)
    assert.equal(String(value.BigNumber), '71357798191653192098')
    assert.equal(String(value.id2), '22022621134265013')
    assert.equal(String(value.numbers[0]), '305667554401374209')
  }
})

test('restoration preserves paths, escaped quotes, Unicode, whitespace and strings containing JSON', () => {
  const data = {
    path: 'C:\\Users\\green\\new\\test.json',
    quoted: '他说："你好"',
    lines: '第一行\n第二行\r\n\t缩进',
    literals: String.raw`\n \u003e //n //u003e`,
    markup: '<h1>&nbsp;&lt;示例&gt;</h1>',
    'quote"\\\n': '😀',
    nestedJson: '{"keep":"as string"}'
  }
  const original = JSON.stringify(data)
  const escaped = JSON.stringify(original)
  for (const input of [escaped, escaped.slice(1, -1), JSON.stringify(escaped)]) {
    assert.deepEqual(JSON.parse(convertJson(input, 'unescape')), data)
  }
  assert.equal(JSON.parse(convertJson(String.raw`"{\"unicode\":\"\u003e\"}"`, 'unescape')).unicode, '>')
})

test('formatting and compression retain numeric tokens without quotes or rounding', () => {
  const input = '[71357798191653192098,-987654321098765432,0.12345678901234567890,1e+400,1.2300e-999,-0,"71357798191653192098"]'
  for (const mode of ['format4', 'minify', 'unescape']) {
    const result = convertJson(mode === 'unescape' ? JSON.stringify(input) : input, mode)
    assert.equal(convertJson(result, 'minify'), input)
  }
})

test('arrays, nested objects, empty containers, booleans and null remain valid', () => {
  for (const input of ['[]', '{}', 'true', 'false', 'null', '0', '[{"x":null},[],{},false]']) {
    assert.deepEqual(JSON.parse(convertJson(JSON.stringify(input), 'unescape')), JSON.parse(input))
  }
})

test('invalid input reports failure and excessive escaping is bounded', () => {
  for (const input of ['', 'not json', String.raw`{\"a\":1`, String.raw`{\"a\":\"bad\q\"}`, '"{bad}"', '{"a":1,}', 'undefined']) {
    assert.throws(() => convertJson(input, 'unescape'))
  }
  assert.throws(() => convertJson(String.raw`{\"a\":1}`, 'format4'))
  let input = '{}'
  for (let i = 0; i < 11; i++) input = JSON.stringify(input)
  assert.throws(() => convertJson(input, 'unescape'), /最多支持 10 层/)
})

test('tree viewer renders exact numbers as numeric leaves with correct line numbers', async () => {
  async function compileComponent(name, replacements = {}) {
    const source = await readFile(new URL(`../src/renderer/src/components/JsonViewer/${name}.vue`, import.meta.url), 'utf8')
    const { descriptor } = parseComponent(source, { filename: `${name}.vue` })
    const compiled = compileScript(descriptor, { id: name, inlineTemplate: true, templateOptions: { ssr: true } })
    const { outputText } = ts.transpileModule(compiled.content, {
      compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 }
    })
    const resolved = outputText.replace(/from (["'])([^"']+)\1/g, (_, quote, specifier) =>
      `from ${JSON.stringify(replacements[specifier] || import.meta.resolve(specifier))}`)
    return `data:text/javascript;base64,${Buffer.from(resolved).toString('base64')}`
  }

  const nodeUrl = await compileComponent('JsonNode')
  const viewerUrl = await compileComponent('JsonViewer', { './JsonNode.vue': nodeUrl })
  const { default: Viewer } = await import(viewerUrl)
  const html = await renderToString(createSSRApp(Viewer, {
    json: convertJson(String.raw`{\"id\":71357798191653192098,\"nested\":[22022621134265013],\"text\":\"a\\nb\"}`, 'unescape'),
    showLineNumbers: true
  }))
  assert.match(html, /class="json-number"[^>]*>71357798191653192098<\/span>/)
  assert.match(html, /class="json-number"[^>]*>22022621134265013<\/span>/)
  assert.match(html, /a\\nb/)
  assert.doesNotMatch(html, /isLosslessNumber|71357798191653190000/)
  assert.match(html, /data-line-number="7"/)
})
