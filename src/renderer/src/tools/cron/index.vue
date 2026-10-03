<template>
  <div class="h-full flex flex-col space-y-4 overflow-y-auto pr-1">
    <!-- 常用预设快捷按钮 -->
    <div class="p-3 rounded-lg bg-[var(--card-bg)] border border-[var(--border-color)] flex items-center flex-wrap gap-2 text-xs transition-colors">
      <span class="text-zinc-500 dark:text-zinc-400">常用预设:</span>
      <n-button
        v-for="preset in cronPresets"
        :key="preset.name"
        size="tiny"
        secondary
        @click="applyPreset(preset)"
      >
        {{ preset.name }}
      </n-button>
    </div>

    <!-- 表达式输入面板 -->
    <div class="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-3 transition-colors">
      <div class="flex items-center justify-between">
        <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">Cron 表达式 (标准 5段 / 6段)</span>
        <div class="flex items-center space-x-2">
          <n-button size="tiny" secondary @click="copy(cronExpression)">复制表达式</n-button>
          <n-button size="tiny" quaternary @click="cronExpression = '* * * * *'; parseCron()">重置</n-button>
        </div>
      </div>

      <div class="space-y-1">
        <n-input
          v-model:value="cronExpression"
          placeholder="例如: */5 * * * * 或 0 2 * * *"
          class="font-mono text-base"
          @update:value="parseCron"
        />
      </div>

      <!-- 语义化中文解读卡片 -->
      <div class="p-3 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] flex items-center justify-between transition-colors">
        <div class="flex items-center space-x-2">
          <span class="text-emerald-500 dark:text-emerald-400 text-sm">💡</span>
          <span class="text-xs font-medium text-zinc-800 dark:text-zinc-200">{{ cronDescription || '解析中...' }}</span>
        </div>
        <span v-if="isValid" class="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono">语法合法</span>
        <span v-else class="text-[10px] px-2 py-0.5 rounded bg-red-500/10 text-red-500 dark:text-red-400 font-mono">语法错误</span>
      </div>

      <!-- Cron 语法段位参考 -->
      <div class="grid grid-cols-5 gap-2 pt-1 text-center font-mono text-[11px]">
        <div class="p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
          <div class="text-emerald-600 dark:text-emerald-400 font-bold">第 1 位</div>
          <div class="text-zinc-500 dark:text-zinc-400 mt-0.5">分钟 (0 - 59)</div>
        </div>
        <div class="p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
          <div class="text-emerald-600 dark:text-emerald-400 font-bold">第 2 位</div>
          <div class="text-zinc-500 dark:text-zinc-400 mt-0.5">小时 (0 - 23)</div>
        </div>
        <div class="p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
          <div class="text-emerald-600 dark:text-emerald-400 font-bold">第 3 位</div>
          <div class="text-zinc-500 dark:text-zinc-400 mt-0.5">日期 (1 - 31)</div>
        </div>
        <div class="p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
          <div class="text-emerald-600 dark:text-emerald-400 font-bold">第 4 位</div>
          <div class="text-zinc-500 dark:text-zinc-400 mt-0.5">月份 (1 - 12)</div>
        </div>
        <div class="p-2 rounded bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] transition-colors">
          <div class="text-emerald-600 dark:text-emerald-400 font-bold">第 5 位</div>
          <div class="text-zinc-500 dark:text-zinc-400 mt-0.5">星期 (0 - 7)</div>
        </div>
      </div>
    </div>

    <!-- 未来执行时间模拟预估 -->
    <div class="p-4 rounded-xl bg-[var(--card-bg)] border border-[var(--border-color)] space-y-3 transition-colors">
      <div class="flex items-center justify-between border-b border-[var(--border-color)] pb-2">
        <span class="text-xs font-semibold text-zinc-800 dark:text-zinc-200">未来 10 次调度执行时间预测</span>
        <span class="text-[11px] text-zinc-500 dark:text-zinc-400">基于当前系统时间</span>
      </div>

      <div v-if="nextRuns.length > 0" class="space-y-1.5 font-mono text-xs">
        <div
          v-for="(time, idx) in nextRuns"
          :key="idx"
          class="flex items-center justify-between px-3 py-2 rounded-lg bg-[var(--card-sub-bg)] border border-[var(--border-sub-color)] hover:border-emerald-500/40 transition-colors"
        >
          <div class="flex items-center space-x-3">
            <span class="text-emerald-600 dark:text-emerald-400 font-bold w-6">#{{ idx + 1 }}</span>
            <span class="text-zinc-800 dark:text-zinc-100 select-all">{{ time.format }}</span>
          </div>
          <span class="text-zinc-500 dark:text-zinc-400 text-[11px]">{{ time.relative }}</span>
        </div>
      </div>

      <div v-else class="py-8 text-center text-zinc-400 dark:text-zinc-500 text-xs">
        {{ isValid ? '未计算出未来执行时间' : '表达式有误，请检查语法' }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useMessage } from 'naive-ui'
import { parseExpression } from 'cron-parser'
import dayjs from 'dayjs'

const message = useMessage()

const cronExpression = ref('*/5 * * * *')
const cronDescription = ref('')
const isValid = ref(true)
const nextRuns = ref<{ format: string; relative: string }[]>([])

const cronPresets = [
  { name: '每 5 分钟', expr: '*/5 * * * *' },
  { name: '每 15 分钟', expr: '*/15 * * * *' },
  { name: '每小时整点', expr: '0 * * * *' },
  { name: '每天凌晨 02:00', expr: '0 2 * * *' },
  { name: '每周一早 09:30', expr: '30 9 * * 1' },
  { name: '每月 1 号零点', expr: '0 0 1 * *' },
  { name: '工作日朝九晚六', expr: '0 9-18 * * 1-5' }
]

function applyPreset(p: { name: string; expr: string }): void {
  cronExpression.value = p.expr
  parseCron()
}

function parseCron(): void {
  const expr = cronExpression.value.trim()
  if (!expr) {
    isValid.value = false
    cronDescription.value = '请输入 Cron 表达式'
    nextRuns.value = []
    return
  }

  try {
    const interval = parseExpression(expr, { currentDate: new Date() })
    isValid.value = true

    // 中文语义解读
    cronDescription.value = explainCron(expr)

    // 计算未来 10 次执行时间
    const list: { format: string; relative: string }[] = []
    const now = dayjs()
    for (let i = 0; i < 10; i++) {
      const nextDate = dayjs(interval.next().toDate())
      const diffMin = Math.round(nextDate.diff(now, 'minute'))
      let rel = ''
      if (diffMin < 60) {
        rel = `${diffMin} 分钟后`
      } else if (diffMin < 1440) {
        rel = `${Math.round(diffMin / 60)} 小时后`
      } else {
        rel = `${Math.round(diffMin / 1440)} 天后`
      }
      list.push({
        format: nextDate.format('YYYY-MM-DD HH:mm:ss (dddd)'),
        relative: rel
      })
    }
    nextRuns.value = list
  } catch (err: any) {
    isValid.value = false
    cronDescription.value = `语法解析错误: ${err.message}`
    nextRuns.value = []
  }
}

function explainCron(expr: string): string {
  const parts = expr.split(/\s+/)
  if (parts.length === 5) {
    const [min, hour, day, month, week] = parts
    if (min === '*' && hour === '*' && day === '*' && month === '*' && week === '*') {
      return '每分钟执行一次'
    }
    if (min.startsWith('*/') && hour === '*' && day === '*' && month === '*' && week === '*') {
      return `每隔 ${min.slice(2)} 分钟执行一次`
    }
    if (min === '0' && hour === '*' && day === '*' && month === '*' && week === '*') {
      return '每小时整点执行一次'
    }
    if (min === '0' && hour !== '*' && day === '*' && month === '*' && week === '*') {
      return `每天 ${hour}:00 执行一次`
    }
  }
  return `自定义定时计划: 规则 [${expr}]`
}

onMounted(() => {
  parseCron()
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
