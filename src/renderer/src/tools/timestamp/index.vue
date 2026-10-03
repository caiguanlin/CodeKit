<template>
  <div class="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
    <!-- 实时时钟看板 -->
    <div class="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center justify-between flex-wrap gap-4 transition-colors">
      <div class="flex items-center space-x-3">
        <div class="w-10 h-10 rounded-lg bg-blue-500/10 text-blue-500 dark:text-blue-400 flex items-center justify-center font-bold">
          <svg class="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <polyline points="12 6 12 12 16 14"></polyline>
          </svg>
        </div>
        <div>
          <div class="text-xs text-zinc-500 dark:text-zinc-400 font-medium">当前本地时间与 Unix 时间戳</div>
          <div class="text-xl font-bold font-mono text-zinc-900 dark:text-zinc-100 flex items-center space-x-2 mt-0.5">
            <span>{{ liveTimeString }}</span>
          </div>
        </div>
      </div>

      <div class="flex items-center space-x-3 flex-wrap gap-2">
        <div class="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] font-mono text-xs transition-colors">
          <span class="text-zinc-500 dark:text-zinc-400">秒 (10位):</span>
          <span class="text-emerald-600 dark:text-emerald-400 font-bold">{{ liveSeconds }}</span>
          <n-button size="tiny" secondary @click="copy(String(liveSeconds))">复制</n-button>
        </div>

        <div class="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] font-mono text-xs transition-colors">
          <span class="text-zinc-500 dark:text-zinc-400">毫秒 (13位):</span>
          <span class="text-blue-600 dark:text-blue-400 font-bold">{{ liveMillis }}</span>
          <n-button size="tiny" secondary @click="copy(String(liveMillis))">复制</n-button>
        </div>

        <n-button size="small" secondary @click="toggleTimer">
          {{ isTimerRunning ? '暂停时钟' : '恢复时钟' }}
        </n-button>
      </div>
    </div>

    <!-- 转换器区域：双向转换 -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <!-- 卡片 1: 时间戳转日期时间 -->
      <div class="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-3 transition-colors">
        <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
          <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">时间戳 ➔ 北京/本地时间</span>
          <n-button size="tiny" quaternary @click="tsInput = String(liveSeconds)">填入当前秒</n-button>
        </div>

        <div class="space-y-1">
          <label class="text-[11px] text-zinc-500 dark:text-zinc-400">输入时间戳 (秒或毫秒)</label>
          <n-input
            v-model:value="tsInput"
            placeholder="例如: 1711234567 或 1711234567890"
            @update:value="convertTsToDate"
          />
        </div>

        <div class="space-y-2 pt-1 text-xs">
          <div class="flex items-center justify-between p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <span class="text-zinc-500 dark:text-zinc-400">本地时间 (Local):</span>
            <span class="font-mono text-zinc-800 dark:text-zinc-200 font-medium select-all">{{ convertedLocalDate || '-' }}</span>
          </div>

          <div class="flex items-center justify-between p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <span class="text-zinc-500 dark:text-zinc-400">标准 UTC 时间:</span>
            <span class="font-mono text-zinc-800 dark:text-zinc-200 font-medium select-all">{{ convertedUtcDate || '-' }}</span>
          </div>

          <div class="flex items-center justify-between p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <span class="text-zinc-500 dark:text-zinc-400">ISO 8601:</span>
            <span class="font-mono text-zinc-800 dark:text-zinc-200 font-medium select-all">{{ convertedIsoDate || '-' }}</span>
          </div>

          <div class="flex items-center justify-between p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <span class="text-zinc-500 dark:text-zinc-400">相对时间:</span>
            <span class="font-mono text-emerald-600 dark:text-emerald-400 font-medium select-all">{{ convertedRelative || '-' }}</span>
          </div>
        </div>
      </div>

      <!-- 卡片 2: 日期时间转时间戳 -->
      <div class="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-3 transition-colors">
        <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
          <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">日期时间 ➔ 时间戳</span>
          <n-button size="tiny" quaternary @click="fillCurrentDate">填入当前时间</n-button>
        </div>

        <div class="space-y-1">
          <label class="text-[11px] text-zinc-500 dark:text-zinc-400">日期时间字符串 (YYYY-MM-DD HH:mm:ss)</label>
          <n-input
            v-model:value="dateInput"
            placeholder="例如: 2026-10-03 12:00:00"
            @update:value="convertDateToTs"
          />
        </div>

        <div class="space-y-2 pt-1 text-xs">
          <div class="flex items-center justify-between p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <span class="text-zinc-500 dark:text-zinc-400">秒级时间戳 (10位):</span>
            <div class="flex items-center space-x-2">
              <span class="font-mono text-emerald-600 dark:text-emerald-400 font-bold select-all">{{ convertedSeconds || '-' }}</span>
              <n-button v-if="convertedSeconds" size="tiny" secondary @click="copy(String(convertedSeconds))">复制</n-button>
            </div>
          </div>

          <div class="flex items-center justify-between p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
            <span class="text-zinc-500 dark:text-zinc-400">毫秒级时间戳 (13位):</span>
            <div class="flex items-center space-x-2">
              <span class="font-mono text-blue-600 dark:text-blue-400 font-bold select-all">{{ convertedMillis || '-' }}</span>
              <n-button v-if="convertedMillis" size="tiny" secondary @click="copy(String(convertedMillis))">复制</n-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 常用时间差与时长换算 -->
    <div class="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-3 transition-colors">
      <div class="text-xs font-semibold text-zinc-800 dark:text-zinc-200 border-b border-[var(--border-color)] pb-2">
        常用时间单位换算参考
      </div>
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="p-2.5 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
          <div class="text-zinc-500 dark:text-zinc-400 text-[11px]">1 分钟 (Minute)</div>
          <div class="font-mono font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">60 秒 / 60,000 ms</div>
        </div>
        <div class="p-2.5 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
          <div class="text-zinc-500 dark:text-zinc-400 text-[11px]">1 小时 (Hour)</div>
          <div class="font-mono font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">3,600 秒</div>
        </div>
        <div class="p-2.5 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
          <div class="text-zinc-500 dark:text-zinc-400 text-[11px]">1 天 (Day)</div>
          <div class="font-mono font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">86,400 秒</div>
        </div>
        <div class="p-2.5 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
          <div class="text-zinc-500 dark:text-zinc-400 text-[11px]">1 周 (Week)</div>
          <div class="font-mono font-bold text-zinc-800 dark:text-zinc-100 mt-0.5">604,800 秒</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useMessage } from 'naive-ui'
import dayjs from 'dayjs'

const message = useMessage()

const liveTimeString = ref('')
const liveSeconds = ref(0)
const liveMillis = ref(0)
const isTimerRunning = ref(true)
let timerId: any = null

const tsInput = ref('')
const convertedLocalDate = ref('')
const convertedUtcDate = ref('')
const convertedIsoDate = ref('')
const convertedRelative = ref('')

const dateInput = ref('')
const convertedSeconds = ref<number | null>(null)
const convertedMillis = ref<number | null>(null)

function updateClock(): void {
  const now = dayjs()
  liveTimeString.value = now.format('YYYY-MM-DD HH:mm:ss.SSS')
  liveSeconds.value = Math.floor(now.valueOf() / 1000)
  liveMillis.value = now.valueOf()
}

onMounted(() => {
  updateClock()
  timerId = setInterval(() => {
    if (isTimerRunning.value) {
      updateClock()
    }
  }, 100)

  // 默认初始值
  tsInput.value = String(Math.floor(Date.now() / 1000))
  convertTsToDate()

  fillCurrentDate()
})

onBeforeUnmount(() => {
  if (timerId) clearInterval(timerId)
})

function toggleTimer(): void {
  isTimerRunning.value = !isTimerRunning.value
}

function convertTsToDate(): void {
  const raw = tsInput.value.trim()
  if (!raw) {
    convertedLocalDate.value = ''
    convertedUtcDate.value = ''
    convertedIsoDate.value = ''
    convertedRelative.value = ''
    return
  }

  let num = Number(raw)
  if (isNaN(num)) return

  // 兼容 10 位与 13 位
  if (raw.length <= 10) {
    num = num * 1000
  }

  const d = dayjs(num)
  if (!d.isValid()) return

  convertedLocalDate.value = d.format('YYYY-MM-DD HH:mm:ss')
  convertedUtcDate.value = new Date(num).toUTCString()
  convertedIsoDate.value = d.toISOString()

  // 相对时间
  const diffSec = Math.round((Date.now() - num) / 1000)
  if (Math.abs(diffSec) < 60) {
    convertedRelative.value = diffSec >= 0 ? `${diffSec} 秒前` : `${Math.abs(diffSec)} 秒后`
  } else if (Math.abs(diffSec) < 3600) {
    const mins = Math.round(diffSec / 60)
    convertedRelative.value = mins >= 0 ? `${mins} 分钟前` : `${Math.abs(mins)} 分钟后`
  } else if (Math.abs(diffSec) < 86400) {
    const hours = Math.round(diffSec / 3600)
    convertedRelative.value = hours >= 0 ? `${hours} 小时前` : `${Math.abs(hours)} 小时后`
  } else {
    const days = Math.round(diffSec / 86400)
    convertedRelative.value = days >= 0 ? `${days} 天前` : `${Math.abs(days)} 天后`
  }
}

function fillCurrentDate(): void {
  dateInput.value = dayjs().format('YYYY-MM-DD HH:mm:ss')
  convertDateToTs()
}

function convertDateToTs(): void {
  const raw = dateInput.value.trim()
  if (!raw) {
    convertedSeconds.value = null
    convertedMillis.value = null
    return
  }

  const d = dayjs(raw)
  if (!d.isValid()) {
    convertedSeconds.value = null
    convertedMillis.value = null
    return
  }

  convertedMillis.value = d.valueOf()
  convertedSeconds.value = Math.floor(d.valueOf() / 1000)
}

async function copy(text: string): Promise<void> {
  if (!text) return
  if (window.electronAPI) {
    await window.electronAPI.writeClipboard(text)
  } else {
    navigator.clipboard.writeText(text)
  }
  message.success('已复制')
}
</script>
