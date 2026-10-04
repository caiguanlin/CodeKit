import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'
import ts from 'typescript'

const source = await readFile(new URL('../src/renderer/src/tools/regex/regex.ts', import.meta.url), 'utf8')
const { outputText } = ts.transpileModule(source, { compilerOptions: { target: ts.ScriptTarget.ES2022, module: ts.ModuleKind.ES2022 } })
const { generateRegexCode, collectMatches, MATCH_LIMIT } = await import(`data:text/javascript;base64,${Buffer.from(outputText).toString('base64')}`)

for (const format of ['literal', 'constructor']) {
  test(`${format} code executes with the same pattern, flags and matches`, () => {
    const cases = [
      ['https?://[\\w.-]+/path', 'gi', 'HTTPS://codekit.app/path'],
      [String.raw`a\/b\\c`, 'g', 'a/b\\c'],
      ['["\'`/\\\\]+', 'g', '"\'`/\\'],
      ['a\nb\rc\u2028d\u2029e', 'm', 'a\nb\rc\u2028d\u2029e'],
      ['(\\w+)@(\\w+\\.\\w+)', 'gi', 'SUPPORT@codekit.app'],
      ['(?<word>中文|😀)', 'gu', '中文😀'],
      ['[\\p{ASCII}&&\\p{Letter}]+', 'gv', 'CodeKit中文'],
      ['', 'g', 'abc']
    ]
    for (const [pattern, flags, input] of cases) {
      const original = new RegExp(pattern, flags)
      const restored = new Function(`${generateRegexCode(original, format)}\nreturn regex;`)()
      assert.equal(restored.source, original.source)
      assert.equal(restored.flags, original.flags)
      assert.deepEqual(restored.exec(input), original.exec(input))
    }
  })
}

test('matching respects global, case-insensitive and non-global flags and capture positions', () => {
  assert.deepEqual(collectMatches(/(a)(b)?/gi, 'A ab'), {
    matches: [
      { match: 'A', index: 0, groups: ['A', undefined] },
      { match: 'ab', index: 2, groups: ['a', 'b'] }
    ],
    truncated: false
  })
  assert.equal(collectMatches(/a/i, 'A a').matches.length, 1)
  assert.equal(collectMatches(/z/g, 'A a').matches.length, 0)
})

test('zero-length global matches terminate and advance by Unicode code points', () => {
  assert.deepEqual(collectMatches(/(?:)/gu, '😀').matches.map(m => m.index), [0, 2])
  assert.deepEqual(collectMatches(/(?:)/g, '😀').matches.map(m => m.index), [0, 1, 2])
  assert.deepEqual(collectMatches(/^|$/g, '').matches, [{ match: '', index: 0, groups: [] }])
})

test('match limits report truncation only when there are additional results', () => {
  assert.equal(collectMatches(/a/g, 'a'.repeat(MATCH_LIMIT)).truncated, false)
  const result = collectMatches(/a/g, 'a'.repeat(MATCH_LIMIT + 1))
  assert.equal(result.matches.length, MATCH_LIMIT)
  assert.equal(result.truncated, true)
})

test('repeated tests start from the beginning without changing the supplied expression', () => {
  const regex = /a/gy
  regex.lastIndex = 1
  const first = collectMatches(regex, 'aa a')
  assert.deepEqual(first.matches.map(m => m.index), [0, 1])
  assert.deepEqual(collectMatches(regex, 'aa a'), first)
  assert.equal(regex.lastIndex, 1)
})
