<script lang="ts" setup>
import Chart from 'chart.js/auto'
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

  chart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: props.data.map((item: ChartItem) => item.name),
      datasets: [
        {
          label: 'Menge',
          data: props.data.map((item: ChartItem) => item.value),
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Anzahl verkaufter Produkte',
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
