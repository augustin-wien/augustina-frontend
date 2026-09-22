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
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'

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
      <PageHeader :title="$t('menuStatistics')">
        <VueDatePicker
          v-model="date"
          range
          :enable-time-picker="false"
          :placeholder="$t('chooseDateRange')"
          class="max-w-md"
          @range-start="onRangeStart"
          @range-end="onRangeEnd"
        />
        <div class="view-toggle">
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ 'view-toggle-btn-active': viewMode === 'chart' }"
            @click="viewMode = 'chart'"
          >
            Diagramm
          </button>
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ 'view-toggle-btn-active': viewMode === 'table' }"
            @click="viewMode = 'table'"
          >
            Tabelle
          </button>
          <button
            type="button"
            class="view-toggle-btn"
            :class="{ 'view-toggle-btn-active': viewMode === 'both' }"
            @click="viewMode = 'both'"
          >
            Beides
          </button>
        </div>
      </PageHeader>
    </template>
    <template #main>
      <template v-if="showCharts">
        <Card class="section">
          <h2 class="section-title">Verkaufte Menge pro Produkt</h2>
          <StatisticsQuantityChart :data="quantityData" />
        </Card>
        <Card class="section">
          <h2 class="section-title">Eingenommener Betrag pro Produkt (€)</h2>
          <StatisticsAmountChart :data="amountData" />
        </Card>
        <Card class="section">
          <h2 class="section-title">Anteil nutzender Verkäufer</h2>
          <StatisticsVendorUsageChart :data="vendorUsageData" />
        </Card>
      </template>

      <template v-if="showTable">
        <Card class="section">
          <StatisticsQuantityTable :data="quantityData" />
        </Card>
        <Card class="section">
          <StatisticsAmountTable :data="amountData" />
        </Card>
        <Card class="section">
          <StatisticsVendorUsageTable :data="vendorUsageData" />
        </Card>
      </template>
    </template>
  </component>
</template>

<style scoped>
.section {
  margin-bottom: 20px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
}
.view-toggle {
  display: flex;
  gap: 2px;
  padding: 3px;
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
}
.view-toggle-btn {
  padding: 6px 12px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text-muted);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.view-toggle-btn-active {
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
}
</style>
