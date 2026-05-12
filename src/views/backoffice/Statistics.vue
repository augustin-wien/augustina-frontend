<script lang="ts" setup>
import StatisticsAmountChart from '@/components/statistics/StatisticsAmountChart.vue'
import StatisticsAmountTable from '@/components/statistics/StatisticsAmountTable.vue'
import StatisticsQuantityChart from '@/components/statistics/StatisticsQuantityChart.vue'
import StatisticsQuantityTable from '@/components/statistics/StatisticsQuantityTable.vue'
import StatisticsVendorUsageChart from '@/components/statistics/StatisticsVendorUsageChart.vue'
import StatisticsVendorUsageTable from '@/components/statistics/StatisticsVendorUsageTable.vue'
import { useItemsStore } from '@/stores/items'
import { useAuthLoad } from '@/composables/useAuthLoad'
import {
  useStatisticsStore,
  type StatisticsItem,
  type StatisticsItemMinimal,
  type VendorUsageStatistics
} from '@/stores/statistics'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, ref } from 'vue'
import { type Statistics } from '@/stores/statistics'

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

  if (startDate.value && endDate.value) {
    loadStatistics()
  }
}

const onRangeEnd = (value: Date) => {
  endDate.value = value

  if (startDate.value && endDate.value) {
    loadStatistics()
  }
}

const viewMode = ref<'chart' | 'table' | 'both'>('chart')
const showCharts = computed(() => viewMode.value === 'chart' || viewMode.value === 'both')
const showTable = computed(() => viewMode.value === 'table' || viewMode.value === 'both')

const statisticsData = computed(() => store.statisticsList ?? [])

const quantityData = computed<StatisticsItemMinimal[]>(() => {
  const data = statisticsData.value.map(
    (item: StatisticsItem) =>
      ({
        id: item.ID,
        value: item.SumQuantity,
        name: item.Name
      }) as StatisticsItemMinimal
  )

  return data
    .filter((item: StatisticsItemMinimal) => item.name !== 'transactionCosts')
    .sort((a: StatisticsItemMinimal, b: StatisticsItemMinimal) => b.value - a.value)
})

const amountData = computed<StatisticsItemMinimal[]>(() => {
  const data = statisticsData.value.map((item: Statistics) => ({
    id: item.ID,
    value: item.SumAmount / 100,
    name: item.Name
  }))

  return data.sort((a: StatisticsItemMinimal, b: StatisticsItemMinimal) => b.value - a.value)
})

const vendorUsageData = computed<VendorUsageStatistics | null>(() => store.vendorUsageStats)

const loadStatistics = async () => {
  await Promise.all([
    store.getPayments(startDate.value, endDate.value),
    store.getVendorUsage(startDate.value, endDate.value)
  ])
}

useAuthLoad(() => itemsStore.getItemsBackoffice())
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
        <div class="flex gap-2">
          <button
            class="py-2 px-3 rounded border"
            :class="viewMode === 'chart' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white'"
            @click="viewMode = 'chart'"
          >
            Diagramm
          </button>
          <button
            class="py-2 px-3 rounded border"
            :class="viewMode === 'table' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white'"
            @click="viewMode = 'table'"
          >
            Tabelle
          </button>
          <button
            class="py-2 px-3 rounded border"
            :class="viewMode === 'both' ? 'bg-slate-900 text-white border-slate-900' : 'bg-white'"
            @click="viewMode = 'both'"
          >
            Beides
          </button>
        </div>
      </div>
    </template>
    <template #main>
      <div class="main">
        <div class="w-full mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div v-if="showCharts" class="space-y-6">
            <div>
              <h2 class="font-semibold mb-2">Verkaufte Menge pro Produkt</h2>
              <StatisticsQuantityChart :data="quantityData" />
            </div>
            <div>
              <h2 class="font-semibold mb-2">Eingenommener Betrag pro Produkt (€)</h2>
              <StatisticsAmountChart :data="amountData" />
            </div>
            <div>
              <h2 class="font-semibold mb-2">Anteil nutzender Verkäufer</h2>
              <StatisticsVendorUsageChart :data="vendorUsageData" />
            </div>
          </div>

          <div v-if="showTable" class="space-y-8 mt-2">
            <StatisticsQuantityTable :data="quantityData" />
            <StatisticsAmountTable :data="amountData" />
            <StatisticsVendorUsageTable :data="vendorUsageData" />
          </div>
        </div>
      </div>
    </template>
  </component>
</template>
