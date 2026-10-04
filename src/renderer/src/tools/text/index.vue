<template>
  <div class="h-full flex flex-col space-y-3">
    <!-- 顶部功能模式切换 -->
    <div class="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] transition-colors">
      <n-tabs v-model:value="activeTab" type="segment" size="small">
        <n-tab name="diff">双栏 Diff 差异对比</n-tab>
        <n-tab name="regex">正则表达式测试</n-tab>
        <n-tab name="stats">文本统计分析</n-tab>
      </n-tabs>
    </div>

    <!-- 主工作区 -->
    <div class="flex-1 flex flex-col min-h-0 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 overflow-hidden transition-colors">
      <!-- 模块 1: Monaco 双栏 Diff 文本对比 -->
      <div v-if="activeTab === 'diff'" class="h-full flex flex-col space-y-2">
        <div class="flex items-center justify-between">
          <div class="flex items-center space-x-3">
            <span class="text-xs text-zinc-500 dark:text-zinc-400">对比语言:</span>
            <n-select v-model:value="diffLanguage" size="small" :options="languageOptions" class="w-32" />
            <n-switch v-model:value="sideBySide" size="small">
              <template #checked>双栏分栏</template>
              <template #unchecked>单栏混排</template>
            </n-switch>
          </div>
          <div class="flex items-center space-x-2">
            <n-button size="small" secondary @click="loadDiffSample">加载差异示例</n-button>
            <n-button size="small" quaternary @click="clearDiff">清空</n-button>
          </div>
        </div>

        <div class="flex-1 min-h-0">
          <MonacoDiffEditor
            v-model:original="diffOriginal"
            v-model:modified="diffModified"
            :language="diffLanguage"
            :side-by-side="sideBySide"
            :theme="settingsStore.theme === 'dark' ? 'vs-dark' : 'vs'"
          />
        </div>
      </div>

      <!-- 模块 2: 正则表达式实时测试器 -->
      <div v-else-if="activeTab === 'regex'" class="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
        <!-- 常用预设快捷按钮 -->
        <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] flex items-center flex-wrap gap-2 text-xs transition-colors">
          <span class="text-zinc-500 dark:text-zinc-400">常用预设:</span>
          <n-button
            v-for="preset in regexPresets"
            :key="preset.name"
            size="tiny"
            secondary
            @click="applyRegexPreset(preset)"
          >
            {{ preset.name }}
          </n-button>
        </div>

        <!-- 正则输入与标志位 -->
        <div class="p-4 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-3 transition-colors">
          <div class="flex items-center space-x-3">
            <span class="text-emerald-500 dark:text-emerald-400 font-mono text-lg font-bold">/</span>
            <n-input
              v-model:value="regexPattern"
              placeholder="输入正则表达式规则，例如: (\d{4})-(\d{2})-(\d{2})"
              class="font-mono"
              @update:value="testRegex"
            />
            <span class="text-emerald-500 dark:text-emerald-400 font-mono text-lg font-bold">/</span>
            <n-input
              v-model:value="regexFlags"
              placeholder="flags (g, i, m, s)"
              class="w-24 font-mono"
              @update:value="testRegex"
            />
          </div>

          <div class="flex items-center space-x-4 text-xs text-zinc-500 dark:text-zinc-400">
            <n-checkbox v-model:checked="flagG" @update:checked="syncFlags">全局匹配 (g)</n-checkbox>
            <n-checkbox v-model:checked="flagI" @update:checked="syncFlags">忽略大小写 (i)</n-checkbox>
            <n-checkbox v-model:checked="flagM" @update:checked="syncFlags">多行模式 (m)</n-checkbox>
            <n-checkbox v-model:checked="flagS" @update:checked="syncFlags">单行/点全匹配 (s)</n-checkbox>
          </div>
        </div>

        <!-- 待匹配文本与结果 -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          <div class="space-y-1">
            <div class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">测试文本 (Test String)</div>
            <n-input
              v-model:value="regexText"
              type="textarea"
              placeholder="请输入测试文本..."
              :rows="10"
              @update:value="testRegex"
            />
          </div>

          <div class="space-y-1">
            <div class="flex items-center justify-between text-xs text-zinc-500 dark:text-zinc-400 font-medium">
              <span>匹配结果 ({{ matches.length }} 处命中)</span>
              <span v-if="regexError" class="text-red-500 dark:text-red-400">{{ regexError }}</span>
            </div>
            <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] h-60 overflow-y-auto space-y-2 text-xs font-mono transition-colors">
              <template v-if="matches.length > 0">
                <div
                  v-for="(m, idx) in matches"
                  :key="idx"
                  class="p-2 rounded bg-[var(--card-bg)] border border-[var(--border-color)] text-zinc-800 dark:text-zinc-200"
                >
                  <div class="text-emerald-600 dark:text-emerald-400 font-bold">#{{ idx + 1 }}: "{{ m.match }}"</div>
                  <div class="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">位置: [{{ m.index }} ~ {{ m.index + m.match.length }}]</div>
                  <div v-if="m.groups && m.groups.length > 0" class="text-[11px] text-blue-500 dark:text-blue-400 mt-1 space-y-0.5">
                    <div v-for="(g, gIdx) in m.groups" :key="gIdx">捕获组 {{ gIdx + 1 }}: "{{ g }}"</div>
                  </div>
                </div>
              </template>
              <div v-else class="h-full flex items-center justify-center text-zinc-400 dark:text-zinc-500">
                {{ regexPattern ? '无匹配内容' : '请输入正则表达式与测试文本' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 模块 3: 文本统计分析 -->
      <div v-else-if="activeTab === 'stats'" class="h-full flex flex-col space-y-3">
        <div class="flex-1 min-h-0">
          <n-input
            v-model:value="statsInput"
            type="textarea"
            placeholder="粘贴或输入待分析的文本内容..."
            class="h-full"
          />
        </div>

        <div class="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
          <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <div class="text-zinc-500 dark:text-zinc-400 text-[11px]">字符总数 (含空格)</div>
            <div class="font-mono font-bold text-lg text-emerald-600 dark:text-emerald-400 mt-1">{{ statsTotalChars }}</div>
          </div>
          <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <div class="text-zinc-500 dark:text-zinc-400 text-[11px]">字符数 (不含空格)</div>
            <div class="font-mono font-bold text-lg text-blue-600 dark:text-blue-400 mt-1">{{ statsCharsNoSpace }}</div>
          </div>
          <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <div class="text-zinc-500 dark:text-zinc-400 text-[11px]">词数 (Words)</div>
            <div class="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 mt-1">{{ statsWordCount }}</div>
          </div>
          <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <div class="text-zinc-500 dark:text-zinc-400 text-[11px]">总行数</div>
            <div class="font-mono font-bold text-lg text-amber-600 dark:text-amber-400 mt-1">{{ statsLineCount }}</div>
          </div>
          <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <div class="text-zinc-500 dark:text-zinc-400 text-[11px]">字节大小 (UTF-8)</div>
            <div class="font-mono font-bold text-lg text-purple-600 dark:text-purple-400 mt-1">{{ statsByteSize }} B</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import MonacoDiffEditor from '@/components/MonacoDiffEditor.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const activeTab = ref('diff')

// 1. Monaco Diff
const diffLanguage = ref('json')
const sideBySide = ref(true)
const diffOriginal = ref('{\n  "name": "CodeKit",\n  "version": "1.0.0",\n  "theme": "dark"\n}')
const diffModified = ref('{\n  "name": "CodeKit",\n  "version": "1.1.0",\n  "theme": "auto",\n  "shortcuts": true\n}')

const languageOptions = [
  { label: 'JSON', value: 'json' },
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'Python', value: 'python' },
  { label: 'SQL', value: 'sql' }
]

function loadDiffSample(): void {
  diffOriginal.value = `function calculateSum(a, b) {
  // 原有实现
  return a + b;
}`
  diffModified.value = `function calculateSum(a: number, b: number): number {
  // 现代 TypeScript 增强实现
  if (typeof a !== 'number' || typeof b !== 'number') {
    throw new Error('Invalid arguments');
  }
  return a + b;
}`
  diffLanguage.value = 'typescript'
}

function clearDiff(): void {
  diffOriginal.value = ''
  diffModified.value = ''
}

// 2. 正则测试
const regexPattern = ref('(\\w+)@(\\w+\\.\\w+)')
const regexFlags = ref('g')
const flagG = ref(true)
const flagI = ref(false)
const flagM = ref(false)
const flagS = ref(false)
const regexText = ref('欢迎联系 support@codekit.app 或 admin@company.org 获取技术支持。')
const regexError = ref('')
const matches = ref<{ match: string; index: number; groups: string[] }[]>([])

const regexPresets = [
  { name: '邮箱地址', pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}', flags: 'g' },
  { name: '国内手机号', pattern: '1[3-9]\\d{9}', flags: 'g' },
  { name: 'URL 地址', pattern: 'https?://[\\w-]+(\\.[\\w-]+)+(:\\d+)?(/[\\w-./?%&=]*)?', flags: 'g' },
  { name: 'IPv4 地址', pattern: '(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(?:\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)){3}', flags: 'g' },
  { name: '日期 (YYYY-MM-DD)', pattern: '\\d{4}-\\d{2}-\\d{2}', flags: 'g' },
  { name: '中文字符', pattern: '[\\u4e00-\\u9fa5]+', flags: 'g' }
]

function applyRegexPreset(p: { name: string; pattern: string; flags: string }): void {
  regexPattern.value = p.pattern
  regexFlags.value = p.flags
  flagG.value = p.flags.includes('g')
  flagI.value = p.flags.includes('i')
  flagM.value = p.flags.includes('m')
  flagS.value = p.flags.includes('s')
  testRegex()
}

function syncFlags(): void {
  let f = ''
  if (flagG.value) f += 'g'
  if (flagI.value) f += 'i'
  if (flagM.value) f += 'm'
  if (flagS.value) f += 's'
  regexFlags.value = f
  testRegex()
}

function testRegex(): void {
  regexError.value = ''
  matches.value = []

  if (!regexPattern.value || !regexText.value) return

  try {
    const reg = new RegExp(regexPattern.value, regexFlags.value)
    if (regexFlags.value.includes('g')) {
      let match: RegExpExecArray | null
      while ((match = reg.exec(regexText.value)) !== null) {
        matches.value.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        })
        if (!reg.global) break
      }
    } else {
      const match = reg.exec(regexText.value)
      if (match) {
        matches.value.push({
          match: match[0],
          index: match.index,
          groups: match.slice(1)
        })
      }
    }
  } catch (err: any) {
    regexError.value = err.message
  }
}

// 3. 文本统计
const statsInput = ref(`CodeKit (代码工具盒) 是专为开发者打造的桌面级效率工具箱。\n致力于提供本地优先、安全隔离的极致开发辅助体验！`)

const statsTotalChars = computed(() => statsInput.value.length)
const statsCharsNoSpace = computed(() => statsInput.value.replace(/\s/g, '').length)
const statsLineCount = computed(() => (statsInput.value ? statsInput.value.split('\n').length : 0))
const statsWordCount = computed(() => {
  if (!statsInput.value.trim()) return 0
  const matches = statsInput.value.match(/[\w\d]+|[\u4e00-\u9fa5]/g)
  return matches ? matches.length : 0
})
const statsByteSize = computed(() => new Blob([statsInput.value]).size)

onMounted(() => {
  testRegex()
})
</script>
