<script lang="ts" setup>
import Chart from 'chart.js/auto'
import { usePreferredDark } from '@vueuse/core'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

type ChartItem = {
  id: number
  name: string
  value: number
}

const props = defineProps<{
  data: ChartItem[]
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null
const isDark = usePreferredDark()

// Chart.js defaults to black text/gridlines and doesn't know about our CSS custom properties -
// read the currently-resolved token values so labels stay legible against a dark card too.
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

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.data.map((item: ChartItem) => item.name),
      datasets: [
        {
          label: 'Geldbetrag',
          data: props.data.map((item: ChartItem) => item.value),
          backgroundColor: 'rgba(255, 99, 132, 0.2)',
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: textColor },
          grid: { color: gridColor }
        },
        y: {
          beginAtZero: true,
          ticks: { color: textColor },
          grid: { color: gridColor },
          title: {
            display: true,
            text: 'Eingenommener Betrag in €',
            color: textColor,
            padding: {
              top: 10,
              bottom: 10
            }
          }
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
  <div class="max-w-4xl">
    <canvas ref="canvasRef" width="600" height="300"></canvas>
  </div>
</template>
