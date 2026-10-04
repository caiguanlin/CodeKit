export type CodeFormat = 'literal' | 'constructor'

export function generateRegexCode(regex: RegExp, format: CodeFormat): string {
  if (format === 'literal') return `const regex = ${regex.toString()};`
  // JSON 字符串转义保证反斜杠、引号和换行粘贴到代码后保持原意。
  return `const regex = new RegExp(${JSON.stringify(regex.source)}, ${JSON.stringify(regex.flags)});`
}

export interface RegexMatch {
  match: string
  index: number
  groups: (string | undefined)[]
}

export const MATCH_LIMIT = 1000

export function collectMatches(regex: RegExp, text: string): { matches: RegexMatch[]; truncated: boolean } {
  const matches: RegexMatch[] = []
  const matcher = new RegExp(regex.source, regex.flags)
  const append = (match: RegExpExecArray): void => {
    matches.push({ match: match[0], index: match.index, groups: match.slice(1) })
  }

  if (!matcher.global) {
    const match = matcher.exec(text)
    if (match) append(match)
    return { matches, truncated: false }
  }

  // matchAll 按 Unicode 模式推进零长度匹配，避免 exec 循环停留在同一位置。
  for (const match of text.matchAll(matcher)) {
    if (matches.length === MATCH_LIMIT) return { matches, truncated: true }
    append(match)
  }
  return { matches, truncated: false }
}
