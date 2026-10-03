<template>
  <div class="h-full flex flex-col space-y-3">
    <!-- 顶部标签切换 -->
    <div class="px-3 py-2 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] transition-colors">
      <n-tabs v-model:value="activeTab" type="segment" size="small">
        <n-tab name="uuid">UUID / GUID</n-tab>
        <n-tab name="password">强密码 / 密钥</n-tab>
        <n-tab name="nanoid">NanoID 生成器</n-tab>
      </n-tabs>
    </div>

    <!-- 主工作区 -->
    <div class="flex-1 flex flex-col min-h-0 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 overflow-y-auto transition-colors">
      <!-- 模块 1: UUID 生成器 -->
      <div v-if="activeTab === 'uuid'" class="space-y-4">
        <!-- 控制面板 -->
        <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] flex items-center justify-between flex-wrap gap-3 transition-colors">
          <div class="flex items-center space-x-4 flex-wrap">
            <div class="flex items-center space-x-2">
              <span class="text-xs text-zinc-500 dark:text-zinc-400">版本:</span>
              <n-radio-group v-model:value="uuidVersion" size="small">
                <n-radio-button value="v4">UUID v4 (随机)</n-radio-button>
                <n-radio-button value="v7">UUID v7 (时间序)</n-radio-button>
              </n-radio-group>
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-xs text-zinc-500 dark:text-zinc-400">大写:</span>
              <n-switch v-model:value="uuidUppercase" size="small" />
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-xs text-zinc-500 dark:text-zinc-400">连字符 (-):</span>
              <n-switch v-model:value="uuidHyphens" size="small" />
            </div>

            <div class="flex items-center space-x-2">
              <span class="text-xs text-zinc-500 dark:text-zinc-400">生成数量:</span>
              <n-input-number v-model:value="uuidCount" size="small" :min="1" :max="50" class="w-24" />
            </div>
          </div>

          <div class="flex items-center space-x-2">
            <n-button size="small" type="primary" secondary @click="generateUuids">
              重新生成
            </n-button>
            <n-button size="small" secondary @click="copy(uuidList.join('\n'))">
              复制全部
            </n-button>
          </div>
        </div>

        <!-- 结果列表 -->
        <div class="space-y-1.5">
          <div
            v-for="(item, idx) in uuidList"
            :key="idx"
            class="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] font-mono text-xs hover:border-emerald-500/40 transition-colors"
          >
            <span class="text-zinc-800 dark:text-zinc-200 select-all">{{ item }}</span>
            <n-button size="tiny" secondary @click="copy(item)">复制</n-button>
          </div>
        </div>
      </div>

      <!-- 模块 2: 强密码 / 密钥 -->
      <div v-else-if="activeTab === 'password'" class="space-y-4">
        <!-- 控制面板 -->
        <div class="p-4 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-4 transition-colors">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-zinc-500 dark:text-zinc-400">密码长度:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ passLength }} 位</span>
              </div>
              <n-slider v-model:value="passLength" :min="6" :max="64" :step="1" />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-zinc-500 dark:text-zinc-400">生成组数:</span>
                <span class="font-bold text-blue-600 dark:text-blue-400 font-mono">{{ passCount }} 个</span>
              </div>
              <n-slider v-model:value="passCount" :min="1" :max="20" :step="1" />
            </div>
          </div>

          <div class="flex items-center space-x-6 flex-wrap gap-2 text-xs">
            <n-checkbox v-model:checked="passUpper">包含大写字母 (A-Z)</n-checkbox>
            <n-checkbox v-model:checked="passLower">包含小写字母 (a-z)</n-checkbox>
            <n-checkbox v-model:checked="passNumbers">包含数字 (0-9)</n-checkbox>
            <n-checkbox v-model:checked="passSymbols">特殊符号 (!@#$...)</n-checkbox>
            <n-checkbox v-model:checked="passExcludeSimilar">排除易混淆字符 (0/O, 1/l/I)</n-checkbox>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-[var(--border-sub-color)]">
            <div class="flex items-center space-x-2 text-xs">
              <span class="text-zinc-500 dark:text-zinc-400">安全强度预估:</span>
              <span class="font-bold" :class="passwordStrengthColor">{{ passwordStrengthLabel }}</span>
            </div>
            <div class="flex items-center space-x-2">
              <n-button size="small" type="primary" secondary @click="generatePasswords">
                生成密码
              </n-button>
              <n-button size="small" secondary @click="copy(passwordList.join('\n'))">
                复制全部
              </n-button>
            </div>
          </div>
        </div>

        <!-- 结果列表 -->
        <div class="space-y-1.5">
          <div
            v-for="(item, idx) in passwordList"
            :key="idx"
            class="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] font-mono text-xs hover:border-blue-500/40 transition-colors"
          >
            <span class="text-zinc-800 dark:text-zinc-200 select-all">{{ item }}</span>
            <n-button size="tiny" secondary @click="copy(item)">复制</n-button>
          </div>
        </div>
      </div>

      <!-- 模块 3: NanoID 生成器 -->
      <div v-else-if="activeTab === 'nanoid'" class="space-y-4">
        <div class="p-4 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-4 transition-colors">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-zinc-500 dark:text-zinc-400">NanoID 长度:</span>
                <span class="font-bold text-amber-600 dark:text-amber-400 font-mono">{{ nanoidLength }} 位</span>
              </div>
              <n-slider v-model:value="nanoidLength" :min="6" :max="48" :step="1" />
            </div>

            <div class="space-y-2">
              <div class="flex items-center justify-between text-xs">
                <span class="text-zinc-500 dark:text-zinc-400">生成数量:</span>
                <span class="font-bold text-emerald-600 dark:text-emerald-400 font-mono">{{ nanoidCount }} 个</span>
              </div>
              <n-slider v-model:value="nanoidCount" :min="1" :max="30" :step="1" />
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-[var(--border-sub-color)]">
            <span class="text-xs text-zinc-500">超轻量、无序、高碰撞抗性唯一标识符</span>
            <div class="flex items-center space-x-2">
              <n-button size="small" type="primary" secondary @click="generateNanoIds">
                生成 NanoID
              </n-button>
              <n-button size="small" secondary @click="copy(nanoidList.join('\n'))">
                复制全部
              </n-button>
            </div>
          </div>
        </div>

        <div class="space-y-1.5">
          <div
            v-for="(item, idx) in nanoidList"
            :key="idx"
            class="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] font-mono text-xs hover:border-amber-500/40 transition-colors"
          >
            <span class="text-zinc-800 dark:text-zinc-200 select-all">{{ item }}</span>
            <n-button size="tiny" secondary @click="copy(item)">复制</n-button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid'
import { nanoid } from 'nanoid'

const message = useMessage()
const activeTab = ref('uuid')

// UUID
const uuidVersion = ref<'v4' | 'v7'>('v4')
const uuidUppercase = ref(false)
const uuidHyphens = ref(true)
const uuidCount = ref(5)
const uuidList = ref<string[]>([])

function generateUuids(): void {
  const result: string[] = []
  for (let i = 0; i < uuidCount.value; i++) {
    let id = uuidVersion.value === 'v4' ? uuidv4() : uuidv7()
    if (!uuidHyphens.value) {
      id = id.replace(/-/g, '')
    }
    if (uuidUppercase.value) {
      id = id.toUpperCase()
    } else {
      id = id.toLowerCase()
    }
    result.push(id)
  }
  uuidList.value = result
}

// Password
const passLength = ref(16)
const passCount = ref(5)
const passUpper = ref(true)
const passLower = ref(true)
const passNumbers = ref(true)
const passSymbols = ref(true)
const passExcludeSimilar = ref(false)
const passwordList = ref<string[]>([])

const passwordStrengthLabel = computed(() => {
  let score = 0
  if (passLength.value >= 12) score += 2
  else if (passLength.value >= 8) score += 1
  if (passUpper.value) score += 1
  if (passLower.value) score += 1
  if (passNumbers.value) score += 1
  if (passSymbols.value) score += 2

  if (score >= 6) return '极强 (Military Grade)'
  if (score >= 4) return '强 (Strong)'
  if (score >= 3) return '中等 (Medium)'
  return '弱 (Weak)'
})

const passwordStrengthColor = computed(() => {
  if (passwordStrengthLabel.value.startsWith('极强')) return 'text-emerald-400'
  if (passwordStrengthLabel.value.startsWith('强')) return 'text-blue-400'
  if (passwordStrengthLabel.value.startsWith('中等')) return 'text-amber-400'
  return 'text-red-400'
})

function generatePasswords(): void {
  let chars = ''
  if (passUpper.value) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  if (passLower.value) chars += 'abcdefghijklmnopqrstuvwxyz'
  if (passNumbers.value) chars += '0123456789'
  if (passSymbols.value) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'

  if (passExcludeSimilar.value) {
    chars = chars.replace(/[0O1lI]/g, '')
  }

  if (!chars) {
    message.warning('请至少选择一种字符类型')
    return
  }

  const result: string[] = []
  for (let i = 0; i < passCount.value; i++) {
    let pwd = ''
    for (let j = 0; j < passLength.value; j++) {
      const idx = Math.floor(Math.random() * chars.length)
      pwd += chars[idx]
    }
    result.push(pwd)
  }
  passwordList.value = result
}

// NanoID
const nanoidLength = ref(21)
const nanoidCount = ref(5)
const nanoidList = ref<string[]>([])

function generateNanoIds(): void {
  const result: string[] = []
  for (let i = 0; i < nanoidCount.value; i++) {
    result.push(nanoid(nanoidLength.value))
  }
  nanoidList.value = result
}

onMounted(() => {
  generateUuids()
  generatePasswords()
  generateNanoIds()
})

async function copy(text: string): Promise<void> {
  if (!text) return
  if (window.electronAPI) {
    await window.electronAPI.writeClipboard(text)
  } else {
    navigator.clipboard.writeText(text)
  }
  message.success('已复制到剪贴板')
}
</script>
