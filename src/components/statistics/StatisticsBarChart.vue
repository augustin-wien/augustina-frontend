<script lang="ts" setup>
import Chart from 'chart.js/auto'
import { usePreferredDark } from '@vueuse/core'
import { computed, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import type { StatisticsItemMinimal } from '@/stores/statistics'

const props = withDefaults(
  defineProps<{
    data: StatisticsItemMinimal[]
    label: string
    format?: (value: number) => string
    integer?: boolean
  }>(),
  { format: (value: number) => value.toLocaleString('de-AT') }
)

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const isDark = usePreferredDark()

// Horizontal bars grow with the number of products instead of squeezing their names
const height = computed(() => Math.max(120, props.data.length * 28 + 40))

const tokenColor = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim()

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
  const color = isDark.value ? '#3987e5' : '#2a78d6'

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.data.map((item) => item.name),
      datasets: [
        {
          label: props.label,
          data: props.data.map((item) => item.value),
          backgroundColor: color,
          borderRadius: 4,
          borderSkipped: 'start',
          barThickness: 16
        }
      ]
    },
    options: {
      indexAxis: 'y',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            title: (items) => props.data[items[0]?.dataIndex ?? 0]?.name ?? '',
            label: (item) => `${props.label}: ${props.format(item.parsed.x ?? 0)}`
          }
        }
      },
      scales: {
        x: {
          beginAtZero: true,
          ticks: {
            color: textColor,
            precision: props.integer ? 0 : undefined,
            callback: (value) => props.format(Number(value))
          },
          grid: { color: gridColor },
          border: { display: false }
        },
        y: {
          ticks: {
            color: tokenColor('--color-text'),
            // Long names would be clipped on narrow screens; the tooltip shows them in full
            callback: (_, index) => {
              const name = props.data[index]?.name ?? ''
              return name.length > 24 ? `${name.slice(0, 23)}…` : name
            }
          },
          grid: { display: false }
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
  <div class="chart-box" :style="{ height: `${height}px` }">
    <canvas ref="canvasRef"></canvas>
  </div>
</template>

<style scoped>
.chart-box {
  position: relative;
}
</style>
