<template>
  <div class="h-full flex flex-col min-h-0 space-y-3">
    <div class="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap shrink-0 shadow-sm transition-colors">
      <div class="flex items-center space-x-1.5 flex-wrap gap-y-1">
        <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mr-1 shrink-0">常用预设:</span>
        <n-button
          v-for="preset in regexPresets"
          :key="preset.name"
          size="tiny"
          :type="activePreset === preset.name ? 'primary' : 'default'"
          :secondary="activePreset !== preset.name"
          :aria-pressed="activePreset === preset.name"
          @click="applyPreset(preset)"
        >
          {{ preset.name }}
        </n-button>
      </div>
    </div>

    <div class="flex-1 min-h-0 overflow-y-auto rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] p-4 space-y-4 transition-colors">
      <section class="space-y-3">
        <label for="regex-pattern" class="block text-xs text-zinc-500 dark:text-zinc-400">正则规则（无需输入首尾 /，标志位在下方选择）</label>
        <n-input
          v-model:value="regexPattern"
          :input-props="{ id: 'regex-pattern', spellcheck: false }"
          placeholder="例如：(\d{4})-(\d{2})-(\d{2})"
          class="font-mono"
          :status="compiled.error ? 'error' : undefined"
        />
        <div class="flex flex-wrap gap-x-4 gap-y-2">
          <n-tooltip
            v-for="flag in flagOptions"
            :key="flag.value"
            to="body"
            placement="bottom"
            :show-arrow="false"
            :width="300"
          >
            <template #trigger>
              <n-checkbox
                :checked="regexFlags.includes(flag.value)"
                @update:checked="setFlag(flag.value, $event)"
              >
                {{ flag.label }} ({{ flag.value }})
              </n-checkbox>
            </template>
            <div class="space-y-1 text-xs leading-relaxed">
              <div>{{ flag.description }}</div>
              <div class="opacity-75">示例：{{ flag.example }}</div>
            </div>
          </n-tooltip>
        </div>
        <div v-if="compiled.error" role="alert" class="text-xs text-red-500 dark:text-red-400 break-all">{{ compiled.error }}</div>
      </section>

      <section class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-2 transition-colors">
        <div class="flex items-center justify-between gap-2 flex-wrap">
          <label for="regex-code" class="text-xs font-medium text-zinc-500 dark:text-zinc-400">可直接粘贴的代码（包含标志位）</label>
          <div class="flex items-center gap-2">
            <n-select v-model:value="codeFormat" :options="codeFormats" size="small" class="w-40" aria-label="代码格式" />
            <n-button type="primary" size="small" :disabled="!generatedCode" @click="copyCode">复制代码</n-button>
          </div>
        </div>
        <n-input
          :value="generatedCode"
          :input-props="{ id: 'regex-code', spellcheck: false }"
          type="textarea"
          readonly
          :autosize="{ minRows: 2, maxRows: 6 }"
          placeholder="输入有效的正则规则后生成完整代码"
          class="font-mono"
        />
        <p class="m-0 text-xs text-zinc-500 dark:text-zinc-400">规则与标志位自动合并，斜杠、反斜杠等字符自动转义。</p>
      </section>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <section class="min-w-0 space-y-2">
          <label for="regex-text" class="block text-xs text-zinc-500 dark:text-zinc-400 font-medium">测试文本</label>
          <n-input v-model:value="regexText" :input-props="{ id: 'regex-text' }" type="textarea" placeholder="请输入测试文本..." :rows="10" />
        </section>
        <section class="min-w-0 space-y-2">
          <div class="text-xs text-zinc-500 dark:text-zinc-400 font-medium" aria-live="polite">
            匹配结果（{{ result.truncated ? `前 ${MATCH_LIMIT}` : result.matches.length }} 处命中）
          </div>
          <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] h-60 overflow-y-auto space-y-2 text-xs font-mono transition-colors">
            <div v-for="(match, index) in result.matches" :key="index" class="p-2 rounded bg-[var(--card-bg)] border border-[var(--border-color)] break-all select-text">
              <div class="text-emerald-600 dark:text-emerald-400 font-bold whitespace-pre-wrap">#{{ index + 1 }}: {{ JSON.stringify(match.match) }}</div>
              <div class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">位置: [{{ match.index }} ~ {{ match.index + match.match.length }}]</div>
              <div v-if="match.groups.length" class="text-[11px] text-blue-500 dark:text-blue-400 mt-1 space-y-0.5">
                <div v-for="(group, groupIndex) in match.groups" :key="groupIndex" class="whitespace-pre-wrap">捕获组 {{ groupIndex + 1 }}: {{ group === undefined ? '未参与匹配' : JSON.stringify(group) }}</div>
              </div>
            </div>
            <div v-if="!result.matches.length" class="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
              {{ compiled.error ? '请先修正规则' : regexPattern ? '无匹配内容' : '请输入正则表达式与测试文本' }}
            </div>
          </div>
          <div v-if="result.truncated" class="text-xs text-amber-600 dark:text-amber-400">匹配较多，仅展示前 {{ MATCH_LIMIT }} 处结果。</div>
        </section>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { useMessage } from 'naive-ui'
import { collectMatches, generateRegexCode, MATCH_LIMIT, type CodeFormat } from './regex'

const message = useMessage()
const regexPattern = ref('(\\w+)@(\\w+\\.\\w+)')
const regexFlags = ref('g')
const regexText = ref('欢迎联系 support@codekit.app 或 admin@company.org 获取技术支持。')
const codeFormat = ref<CodeFormat>('literal')
const codeFormats = [
  { label: '正则字面量', value: 'literal' },
  { label: 'RegExp 构造函数', value: 'constructor' }
]
const flagOptions = [
  {
    value: 'g', label: '全局匹配',
    description: '查找所有不重叠的匹配；不勾选时，只返回第一处匹配。',
    example: '用 a 匹配 banana，勾选后找到 3 个 a，否则只找到第一个。'
  },
  {
    value: 'i', label: '忽略大小写',
    description: '匹配字母时不区分大写和小写。',
    example: '规则 hello 可以匹配 hello、Hello 或 HELLO。'
  },
  {
    value: 'm', label: '多行模式',
    description: '让 ^ 和 $ 匹配每一行的开头和结尾；默认只匹配整段文本的开头和结尾。此选项不会让点号跨行匹配。',
    example: '配合全局匹配，^hello 可以找到多行文本中每行开头的 hello。'
  },
  {
    value: 's', label: '点匹配换行',
    description: '让点号 . 也能匹配换行符，适合查找跨越多行的内容。',
    example: '规则 a.b 可以匹配 a 和 b 之间有一个换行符的文本。'
  },
  {
    value: 'y', label: '粘连匹配',
    description: '必须从指定位置开始匹配，失败时不会跳过字符继续寻找。本页从文本开头开始；配合全局匹配时，下一次必须紧接上一次的结尾。',
    example: '用 \\d+ 匹配“12 34”，同时勾选 g 和 y 后只匹配 12，因为空格打断了连续匹配。'
  },
  {
    value: 'd', label: '匹配索引',
    description: '让代码中的匹配结果额外提供 indices，记录完整匹配和各捕获组的起止位置（从 0 开始，结束位置不包含在内）。不改变匹配内容。',
    example: '用 (ab) 匹配 zab，执行 regex.exec("zab") 后，indices[1] 为 [1, 3]，表示第一个捕获组的位置。'
  }
]
const regexPresets = [
  { name: '邮箱地址', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  { name: '国内手机号', pattern: '1[3-9]\\d{9}', flags: 'g' },
  { name: 'URL 地址', pattern: 'https?://[\\w-]+(\\.[\\w-]+)+(:\\d+)?(/[\\w-./?%&=]*)?', flags: 'g' },
  { name: 'IPv4 地址', pattern: '(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(?:\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)){3}', flags: 'g' },
  { name: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
  { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', flags: 'g' }
]

const activePreset = computed(() => regexPresets.find(
  (preset) => preset.pattern === regexPattern.value && preset.flags === regexFlags.value
)?.name)

const compiled = computed(() => {
  if (!regexPattern.value) return { regex: null, error: '' }
  try {
    return { regex: new RegExp(regexPattern.value, regexFlags.value), error: '' }
  } catch (error: unknown) {
    return { regex: null, error: error instanceof Error ? error.message : String(error) }
  }
})
const generatedCode = computed(() => compiled.value.regex ? generateRegexCode(compiled.value.regex, codeFormat.value) : '')
const result = computed(() => compiled.value.regex ? collectMatches(compiled.value.regex, regexText.value) : { matches: [], truncated: false })

function setFlag(flag: string, checked: boolean): void {
  const flags = new Set(regexFlags.value)
  if (checked) {
    flags.add(flag)
  } else {
    flags.delete(flag)
  }
  regexFlags.value = [...flags].sort().join('')
}

function applyPreset(preset: { pattern: string; flags: string }): void {
  regexPattern.value = preset.pattern
  regexFlags.value = preset.flags
}

async function copyCode(): Promise<void> {
  if (!generatedCode.value) return
  try {
    if (window.electronAPI) {
      if (!await window.electronAPI.writeClipboard(generatedCode.value)) throw new Error('无法写入剪贴板')
    } else {
      await navigator.clipboard.writeText(generatedCode.value)
    }
    message.success('已复制完整代码')
  } catch (error: unknown) {
    message.error(`复制失败: ${error instanceof Error ? error.message : String(error)}`)
  }
}
</script>
