<template>
  <div class="h-full flex flex-col space-y-3 min-h-0">
    <!-- 生成类型切换 -->
    <div
      class="px-3.5 py-2 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between gap-3 flex-wrap shrink-0 shadow-sm transition-colors"
    >
      <div class="flex items-center space-x-1.5 flex-wrap gap-y-1" role="group" aria-label="生成类型">
        <span class="text-xs font-semibold text-zinc-700 dark:text-zinc-200 mr-1 shrink-0">生成类型:</span>
        <n-button
          size="tiny"
          :type="activeTab === 'id' ? 'primary' : 'default'"
          :secondary="activeTab !== 'id'"
          :aria-pressed="activeTab === 'id'"
          @click="activeTab = 'id'"
        >
          ID
        </n-button>
        <n-button
          size="tiny"
          :type="activeTab === 'password' ? 'primary' : 'default'"
          :secondary="activeTab !== 'password'"
          :aria-pressed="activeTab === 'password'"
          @click="activeTab = 'password'"
        >
          密码
        </n-button>
      </div>
    </div>

    <!-- 主工作区 -->
    <div class="flex-1 flex flex-col min-h-0 bg-[var(--card-bg)] border border-[var(--border-color)] rounded-xl p-4 overflow-y-auto transition-colors">
      <n-tabs v-if="activeTab === 'id'" v-model:value="idTab" type="line" size="small" class="mb-4">
        <n-tab name="uuid">UUID</n-tab>
        <n-tab name="snowflake">雪花</n-tab>
      </n-tabs>
      <!-- 模块 1: UUID 生成器 -->
      <div v-if="activeTab === 'id' && idTab === 'uuid'" class="space-y-4">
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

        <ResultGrid :items="uuidList" wide @copy="copy" />
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

        <ResultGrid :items="passwordList" @copy="copy" />
      </div>

      <!-- 雪花 ID 生成器 -->
      <div v-else-if="activeTab === 'id' && idTab === 'snowflake'" class="space-y-4">
        <div class="p-4 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] space-y-4 transition-colors">
          <div class="flex items-center flex-wrap gap-4 text-xs">
            <div class="flex items-center space-x-2">
              <span class="text-zinc-500 dark:text-zinc-400">数据中心 ID:</span>
              <n-input-number v-model:value="datacenterId" size="small" :min="0" :max="31" :precision="0" :show-button="true" :clearable="false" class="w-24" />
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-zinc-500 dark:text-zinc-400">机器 ID:</span>
              <n-input-number v-model:value="workerId" size="small" :min="0" :max="31" :precision="0" :clearable="false" class="w-24" />
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-zinc-500 dark:text-zinc-400">生成数量:</span>
              <n-input-number v-model:value="snowflakeCount" size="small" :min="1" :max="50" :precision="0" :clearable="false" class="w-24" />
            </div>
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-[var(--border-sub-color)]">
            <span class="text-xs text-zinc-500 dark:text-zinc-400">按时间递增的 64 位整数 ID，以文本形式复制，避免精度丢失</span>
            <div class="flex items-center space-x-2">
              <n-button size="small" type="primary" secondary @click="generateSnowflakes">
                生成雪花 ID
              </n-button>
              <n-button size="small" secondary @click="copy(snowflakeList.join('\n'))">
                复制全部
              </n-button>
            </div>
          </div>
        </div>

        <ResultGrid :items="snowflakeList" @copy="copy" />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid'
import { nextSnowflakeId } from './snowflake'
import ResultGrid from './ResultGrid.vue'

const message = useMessage()
const activeTab = ref('id')
const idTab = ref('uuid')

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

// Snowflake
const datacenterId = ref(1)
const workerId = ref(1)
const snowflakeCount = ref(5)
const snowflakeList = ref<string[]>([])

function generateSnowflakes(): void {
  try {
    if (!Number.isInteger(snowflakeCount.value) || snowflakeCount.value < 1 || snowflakeCount.value > 50) {
      throw new Error('生成数量须为 1–50 的整数')
    }
    const result: string[] = []
    for (let i = 0; i < snowflakeCount.value; i++) {
      result.push(nextSnowflakeId(datacenterId.value, workerId.value))
    }
    snowflakeList.value = result
  } catch (error) {
    message.error(error instanceof Error ? error.message : '雪花 ID 生成失败')
  }
}

onMounted(() => {
  generateUuids()
  generatePasswords()
  generateSnowflakes()
})

async function copy(text: string): Promise<void> {
  if (!text) return
  try {
    if (window.electronAPI) {
      await window.electronAPI.writeClipboard(text)
    } else {
      await navigator.clipboard.writeText(text)
    }
    message.success('已复制')
  } catch {
    message.error('复制失败，请重试')
  }
}
</script>
