import { parse, stringify } from 'lossless-json'

export type ConversionMode = 'format4' | 'minify' | 'unescape'

/** Decode only the outer string layers; never alter strings inside the JSON data. */
function restoreJson(input: string): unknown {
  let text = input.trim()
  // Chinese quotation marks are sometimes copied along with a debug value.
  if (text.startsWith('“') && text.endsWith('”')) text = text.slice(1, -1).trim()

  for (let layer = 0; layer < 10; layer++) {
    let value: unknown
    try {
      value = parse(text)
    } catch (error) {
      // Debuggers may omit the surrounding quotes of a JSON string literal.
      // Let the JSON parser interpret escapes, rather than deleting backslashes.
      if (!text.includes('\\')) throw error
      value = JSON.parse(`"${text}"`)
    }
    if (typeof value !== 'string') return value
    text = value.trim()
  }

  throw new Error('转义层数过多，最多支持 10 层，请检查输入内容')
}

export function convertJson(input: string, mode: ConversionMode): string {
  const value = mode === 'unescape' ? restoreJson(input) : parse(input)
  // LosslessNumber keeps integers, decimals and exponent notation intact.
  return stringify(value, undefined, mode === 'minify' ? undefined : 4)!
}
