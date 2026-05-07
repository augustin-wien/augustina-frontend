<script lang="ts" setup>
import Chart from 'chart.js/auto'
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'

type VendorUsage = {
  UsedVendors: number
  UnusedVendors: number
}

const props = defineProps<{
  data: VendorUsage | null
}>()

const canvasRef = ref<HTMLCanvasElement | null>(null)
let chart: Chart | null = null

const renderChart = () => {
  if (!canvasRef.value || !props.data) {
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
    type: 'doughnut',
    data: {
      labels: ['Nutzende Verkäufer', 'Nicht Nutzende Verkäufer'],
      datasets: [
        {
          label: 'Verkäufer-Nutzung',
          data: [props.data.UsedVendors, props.data.UnusedVendors],
          backgroundColor: ['rgba(54, 162, 235, 0.35)', 'rgba(255, 159, 64, 0.35)'],
          borderColor: ['rgba(54, 162, 235, 1)', 'rgba(255, 159, 64, 1)'],
          borderWidth: 1
        }
      ]
    },
    options: {
      responsive: false,
      maintainAspectRatio: false
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
