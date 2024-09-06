<script lang="ts" setup>
import { useItemsStore } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import { useStatisticsStore } from '@/stores/statistics'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, onMounted, ref } from 'vue'
import { type Statistics } from '@/stores/statistics'
import Chart from 'chart.js/auto'

onMounted(() => {
  document.title = import.meta.env.VITE_PAGE_NAME + ' | Statistics'
})

const keycloakStore = useKeycloakStore()
const itemsStore = useItemsStore()
const store = useStatisticsStore()

const startOfDay = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const yesterday = startOfDay(new Date(new Date().setDate(new Date().getDate() - 2)))
const tomorrow = startOfDay(new Date(new Date().setDate(new Date().getDate() + 1)))
const startDate = ref<Date>(yesterday)
const endDate = ref<Date>(tomorrow)
const date = ref<Array<Date>>([startDate.value, endDate.value])

const onRangeStart = (value: Date) => {
  startDate.value = value

  store.getPayments(startDate.value, endDate.value).then(() => {
    createCharts()
  })
}

const onRangeEnd = (value: Date) => {
  endDate.value = value

  store.getPayments(startDate.value, endDate.value).then(() => {
    createCharts()
  })
}

const authenticated = computed(() => keycloakStore.authenticated)

let quantityChart: Chart
let amountChart: Chart

const createCharts = () => {
  if (quantityChart) {
    quantityChart.destroy()
  }

  if (amountChart) {
    amountChart.destroy()
  }

  const statisticsData = store.statisticsList
  const itemsArray = statisticsData.Items || []

  let quantityData = itemsArray.map((item: Statistics) => ({
    id: item.ID,
    value: item.SumQuantity,
    name: item.Name
  }))

  // sort by name and exclude transactionCosts
  quantityData = quantityData.sort((a: any, b: any) => b.value - a.value)
  quantityData = quantityData.filter((item: any) => item.name != 'transactionCosts')

  const amountData = itemsArray.map((item: Statistics) => ({
    id: item.ID,
    value: item.SumAmount / 100, // convert to euro
    name: item.Name
  }))

  // Create the quantity chart
  const quantityChartElement = document.getElementById('quantity-chart')

  const quantityChartCtx = quantityChartElement
    ? (quantityChartElement as HTMLCanvasElement).getContext('2d')
    : null

  if (quantityChartCtx) {
    quantityChart = new Chart(quantityChartCtx, {
      type: 'bar',
      data: {
        labels: quantityData.map((item: { name: string }) => item.name),
        datasets: [
          {
            label: 'Menge',
            data: quantityData.map((item: { value: number }) => item.value),
            backgroundColor: 'rgba(75, 192, 192, 0.2)',
            borderColor: 'rgba(75, 192, 192, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
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

  // Create the amount chart
  const amountChartElement = document.getElementById('amount-chart')

  const amountChartCtx = amountChartElement
    ? (amountChartElement as HTMLCanvasElement).getContext('2d')
    : null

  if (amountChartCtx) {
    amountChart = new Chart(amountChartCtx, {
      type: 'bar',
      data: {
        labels: amountData.map((item: { name: string }) => item.name),
        datasets: [
          {
            label: 'Geldbetrag',
            data: amountData.map((item: { value: number }) => item.value),
            backgroundColor: 'rgba(255, 99, 132, 0.2)',
            borderColor: 'rgba(255, 99, 132, 1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Eingenommener Betrag in €',
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
}

onMounted(() => {
  // Fetch statistics data
  if (authenticated.value) {
    itemsStore.getItemsBackoffice().then(() => {
      store.getPayments(startDate.value, endDate.value).then(() => {
        createCharts()
      })
    })
  }
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <div class="flex space-between justify-between content-center items-center pt-3">
        <div class="grid grid-cols-2">
          <h1 className="font-bold text-2xl">{{ $t('menuStatistics') }}</h1>
          <div>
            <VueDatePicker
              v-model="date"
              range
              :enable-time-picker="false"
              :placeholder="$t('chooseDateRange')"
              class="max-w-md"
              @range-start="onRangeStart"
              @range-end="onRangeEnd"
            />
          </div>
        </div>
      </div>
    </template>
    <template #main>
      <div class="main">
        <div class="w-full mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className=" space-y-3 space-x-3">
            <canvas id="quantity-chart" width="300" height="150"></canvas>
            <canvas id="amount-chart" width="300" height="150"></canvas>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>
