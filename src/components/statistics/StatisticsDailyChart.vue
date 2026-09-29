<script lang="ts" setup>
import Chart from 'chart.js/auto'
import { usePreferredDark } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { DailyStatistics } from '@/utils/dailyStatistics'

const props = withDefaults(
  defineProps<{
    data: DailyStatistics
    format?: (value: number) => string
    // Series keys in color order, so a product keeps its color across charts
    colorOrder?: string[]
  }>(),
  { format: (value: number) => value.toLocaleString('de-AT') }
)

// Fixed categorical order, validated for colorblind separation against the light and the
// dark card surface - a series keeps its slot by rank, never a generated hue.
const PALETTE_LIGHT = [
  '#2a78d6',
  '#eb6834',
  '#1baf7a',
  '#eda100',
  '#e87ba4',
  '#008300',
  '#4a3aa7',
  '#e34948'
]

const PALETTE_DARK = [
  '#3987e5',
  '#d95926',
  '#199e70',
  '#c98500',
  '#d55181',
  '#008300',
  '#9085e9',
  '#e66767'
]

const OTHER_COLOR = { light: '#8a8f98', dark: '#6b717c' }

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const isDark = usePreferredDark()

const tokenColor = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

// YYYY-MM-DD -> DD.MM.
const formatLabel = (label: string) => {
  const [, m, d] = label.split('-')
  return `${d}.${m}.`
}

const renderChart = () => {
  if (!canvasRef.value) {
    return
  }

  if (chart) {
    chart.destroy()
  }

  const ctx = canvasRef.value.getContext('2d')

  if (!ctx) {
    return
  }

  const textColor = tokenColor('--color-text-muted')
  const gridColor = tokenColor('--color-border')
  const palette = isDark.value ? PALETTE_DARK : PALETTE_LIGHT
  const pointRadius = props.data.labels.length <= 31 ? 3 : 0

  chart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: props.data.labels.map(formatLabel),
      datasets: props.data.series.map((series, i) => {
        const slot = props.colorOrder ? props.colorOrder.indexOf(series.key) : i

        const color =
          series.key === 'other' || slot < 0 || slot >= palette.length
            ? OTHER_COLOR[isDark.value ? 'dark' : 'light']
            : palette[slot]

        return {
          label: series.name,
          data: series.values,
          borderColor: color,
          backgroundColor: color,
          borderWidth: 2,
          pointRadius,
          pointHoverRadius: 5
        }
      })
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: tokenColor('--color-text'), usePointStyle: true, boxHeight: 8 }
        },
        tooltip: {
          itemSort: (a, b) => (b.parsed.y ?? 0) - (a.parsed.y ?? 0),
          callbacks: {
            label: (item) => `${item.dataset.label}: ${props.format(item.parsed.y ?? 0)}`
          }
        }
      },
      scales: {
        x: {
          ticks: { color: textColor, autoSkip: true, maxRotation: 0 },
          grid: { display: false }
        },
        y: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            precision: 0,
            callback: (value) => props.format(Number(value))
          },
          grid: { color: gridColor },
          border: { display: false }
        }
      }
    }
  })
}

onMounted(() => {
  renderChart()
})

watch(
  () => props.data,
  () => {
    renderChart()
  },
  { deep: true }
)

watch(isDark, () => {
  renderChart()
})

onBeforeUnmount(() => {
  if (chart) {
    chart.destroy()
    chart = null
  }
})
</script>

<template>
  <div class="chart-box">
    <canvas ref="canvasRef"></canvas>
    <p v-if="!data.series.length" class="empty">Keine Verkäufe im gewählten Zeitraum</p>
  </div>
</template>

<style scoped>
.chart-box {
  position: relative;
  height: 280px;
}
.empty {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
