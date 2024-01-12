<script lang="ts" setup>
import { useItemsStore } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import { useStatisticsStore } from '@/stores/statistics'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, onMounted, ref } from 'vue'
import { type Statistics } from '@/stores/statistics'
import * as d3 from 'd3'

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
  store.getPayments(startDate.value, endDate.value)
}

const onRangeEnd = (value: Date) => {
  endDate.value = value
  store.getPayments(startDate.value, endDate.value)
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const authenticated = computed(() => keycloakStore.authenticated)

onMounted(() => {
  // Fetch statistics data
  if (authenticated.value) {
    itemsStore.getItemsBackoffice().then(() => {
      store.getPayments(startDate.value, endDate.value).then(() => {
        // Access the statistics data
        const statisticsData = store.statisticsList

        // Extract data for the charts
        const quantityData = statisticsData.map((item: Statistics) => ({
          id: item.Id,
          value: item.SumQuantity
        }))

        const amountData = statisticsData.map((item: Statistics) => ({
          id: item.Id,
          value: item.SumAmount
        }))

        // D3 Code for Quantity Bar Chart
        const quantityChart = d3
          .select('#chart-container')
          .append('svg')
          .attr('width', 400)
          .attr('height', 200)

        quantityChart
          .selectAll('rect')
          .data(quantityData)
          .enter()
          .append('rect')
          .attr('x', (d, i) => i * 70)
          .attr('y', (d: any) => 200 - d.value)
          .attr('width', 60)
          .attr('height', (d: any) => d.value)
          .attr('fill', 'blue')

        // D3 Code for Amount Bar Chart
        const amountChart = d3
          .select('#chart-container')
          .append('svg')
          .attr('width', 400)
          .attr('height', 200)

        amountChart
          .selectAll('rect')
          .data(amountData)
          .enter()
          .append('rect')
          .attr('x', (d, i) => i * 70)
          .attr('y', (d: any) => 200 - d.value)
          .attr('width', 60)
          .attr('height', (d: any) => d.value)
          .attr('fill', 'green')
      })
    })
  }
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <div class="flex space-between justify-between content-center items-center">
        <div class="grid grid-cols-2">
          <div>
            <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t('menuStatistics') }}</h1>
            <span>
              <VueDatePicker
                v-model="date"
                range
                :enable-time-picker="false"
                :placeholder="$t('chooseDateRange')"
                class="max-w-md"
                @range-start="onRangeStart"
                @range-end="onRangeEnd"
              />
            </span>
          </div>
        </div>
      </div>
    </template>
    <template #main>
      <div class="main">
        <div class="w-full mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className=" space-y-3 space-x-3">
            <h1 class="text-2xl font-bold">{{ $t('menuStatistics') }}</h1>
            <div id="chart-container">chart-container</div>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>
