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
        const statisticsData = store.statisticsList
        const itemsArray = statisticsData.Items || []

        const quantityData = itemsArray.map((item: Statistics) => ({
          id: item.Id,
          value: item.SumQuantity,
          name: item.Name
        }))

        const amountData = itemsArray.map((item: Statistics) => ({
          id: item.Id,
          value: item.SumAmount,
          name: item.Name
        }))

        //#region D3 Code for Quantity Bar Chart
        const quantityChartContainer = d3.select('#chart-container').append('span')

        const quantityChart = quantityChartContainer
          .append('svg')
          .attr('width', 500)
          .attr('height', 400)
          .attr('style', 'margin: 10px; padding: 10px; border: 1px solid black;')
        //  .style('display', 'inline-block')

        //title
        quantityChart
          .append('text')
          .attr('x', 200)
          .attr('y', 20)
          .attr('text-anchor', 'middle')
          .attr('class', 'chart-title')
          .text('Quantity Chart')

        //data
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

        // Add labels to the quantity chart
        quantityChart
          .selectAll('.bar-label')
          .data(quantityData)
          .enter()
          .append('text')
          .attr('class', 'bar-label')
          .attr('x', (d, i) => i * 70 + 30)
          .attr('y', (d: any) => 200 - d.value - 5)
          .attr('text-anchor', 'middle')
          .text((d: any) => d.value)

        // Add x-axis at the bottom with names of items
        quantityChart
          .append('g')
          .attr('transform', 'translate(0, 200)')
          .call(
            d3
              .axisBottom(
                d3
                  .scaleBand()
                  .domain(quantityData.map((d: any) => d.name))
                  .range([0, quantityData.length * 70]) // Adjust range based on the number of items
              )
              .tickSize(30)
              .tickPadding(10)
          )
          .selectAll('text')
          .attr('transform', 'translate(-20, 0)rotate(-60)')
          .style('text-anchor', 'end')
          .style('text-color', 'black')
          .style('font-size', '12px')

        // Find the maximum quantity value in your dataset
        const maxQuantity = d3.max(quantityData, (d: any) => d.value)

        // Create a linear scale for the y-axis based on the maximum quantity value
        const yScale = d3
          .scaleLinear()
          .domain([0, Number(maxQuantity)])
          .range([200, 0])

        // Add y-axis on the left with dynamic quantity values
        quantityChart.append('g').attr('transform', 'translate(0, 0)').call(d3.axisLeft(yScale))

        //#endregion

        //#region D3 Code for Amount Bar Chart
        const amountChartContainer = d3.select('#chart-container').append('span')

        const amountChart = amountChartContainer
          .append('svg')
          .attr('width', 500)
          .attr('height', 400)
          .attr('style', 'margin: 10px; padding: 10px; border: 1px solid black; ')
          .style('display', 'inline-block')

        //title
        amountChart
          .append('text')
          .attr('x', 200)
          .attr('y', 10)
          .attr('text-anchor', 'middle')
          .attr('class', 'chart-title')
          .text('Amount Chart')

        //data
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

        // Add labels to the amount chart
        amountChart
          .selectAll('.bar-label')
          .data(amountData)
          .enter()
          .append('text')
          .attr('class', 'bar-label')
          .attr('x', (d, i) => i * 70 + 30)
          .attr('y', (d: any) => 200 - d.value - 5)
          .attr('text-anchor', 'middle')
          .text((d: any) => d.value)

        // Find the maximum quantity value in your dataset
        const maxAmount = d3.max(amountData, (d: any) => d.value)

        // Create a linear scale for the y-axis based on the maximum quantity value
        const yScaleAmount = d3
          .scaleLinear()
          .domain([0, Number(maxAmount)])
          .range([200, 0])

        // Add y-axis on the left with dynamic quantity values
        amountChart.append('g').attr('transform', 'translate(0, 0)').call(d3.axisLeft(yScaleAmount))

        // Add x-axis at the bottom with names of items
        amountChart
          .append('g')
          .attr('transform', 'translate(0, 200)')
          .call(
            d3
              .axisBottom(
                d3
                  .scaleBand()
                  .domain(amountData.map((d: any) => d.name))
                  .range([0, amountData.length * 70])
              )
              .tickSize(30)
              .tickPadding(10)
          )
          .selectAll('text')
          .attr('transform', 'translate(-20, 0)rotate(-60)')
          .style('text-anchor', 'end')
          .style('text-color', 'black')
          .style('font-size', '12px')
        //#endregion
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
            <div id="chart-container"></div>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>
