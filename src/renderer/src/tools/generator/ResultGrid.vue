<template>
  <div class="result-picker">
    <div class="result-heading">
      <span>生成结果 <span class="result-count">{{ items.length }}</span></span>
      <span class="result-hint">点击卡片选择并复制</span>
    </div>
    <div class="result-grid" :class="{ 'result-grid-wide': wide }" role="group" aria-label="生成结果">
      <button
        v-for="(item, index) in items"
        :key="index"
        type="button"
        class="result-card"
        :class="{ 'is-selected': selectedIndex === index }"
        :aria-pressed="selectedIndex === index"
        :aria-label="`选择并复制第 ${index + 1} 个结果：${item}`"
        @click="selectItem(index)"
      >
        <span class="result-value">{{ item }}</span>
        <svg v-if="selectedIndex === index" class="result-check" viewBox="0 0 20 20" fill="none" aria-hidden="true">
          <path d="m5 10 3 3 7-7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'

const props = defineProps<{ items: string[]; wide?: boolean }>()
const emit = defineEmits<{ copy: [value: string] }>()
const selectedIndex = ref<number | null>(null)

watch(() => props.items, () => { selectedIndex.value = null })

function selectItem(index: number): void {
  selectedIndex.value = index
  emit('copy', props.items[index])
}
</script>

<style scoped>
.result-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
  color: var(--text-secondary);
  font-size: 12px;
}

.result-count {
  margin-left: 6px;
  font-variant-numeric: tabular-nums;
}

.result-hint {
  font-size: 11px;
}

.result-grid {
  --card-min-width: 220px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(min(100%, var(--card-min-width)), 1fr));
  gap: 10px;
}

.result-grid-wide {
  --card-min-width: 310px;
}

.result-card {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 0;
  min-height: 64px;
  padding: 18px 24px;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  background: var(--card-sub-bg);
  color: var(--text-primary);
  cursor: pointer;
  transition: border-color 0.15s ease, background-color 0.15s ease, color 0.15s ease;
}

.result-card:hover {
  border-color: #10b981;
  background: color-mix(in srgb, #10b981 6%, var(--card-sub-bg));
}

.result-card:focus-visible {
  outline: 2px solid #10b981;
  outline-offset: 2px;
}

.result-card.is-selected {
  border-color: #059669;
  background: color-mix(in srgb, #10b981 10%, var(--card-bg));
  color: #047857;
  box-shadow: inset 0 0 0 1px #059669;
}

html.dark .result-card.is-selected {
  color: #6ee7b7;
  border-color: #34d399;
  box-shadow: inset 0 0 0 1px #34d399;
}

.result-value {
  min-width: 0;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.6;
  text-align: center;
  overflow-wrap: anywhere;
}

.result-check {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 18px;
  height: 18px;
}
</style>
