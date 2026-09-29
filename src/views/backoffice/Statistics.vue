<script lang="ts" setup>
import StatisticsAmountTable from '@/components/statistics/StatisticsAmountTable.vue'
import StatisticsBarChart from '@/components/statistics/StatisticsBarChart.vue'
import StatisticsDailyChart from '@/components/statistics/StatisticsDailyChart.vue'
import StatisticsDailyTable from '@/components/statistics/StatisticsDailyTable.vue'
import StatisticsQuantityTable from '@/components/statistics/StatisticsQuantityTable.vue'
import StatisticsTopVendorsTable from '@/components/statistics/StatisticsTopVendorsTable.vue'
import StatisticsVendorUsageTable from '@/components/statistics/StatisticsVendorUsageTable.vue'
import { useItemsStore } from '@/stores/items'
import { useAuthLoad } from '@/composables/useAuthLoad'
import {
  useStatisticsStore,
  type DailyItemStatistics,
  type VendorSalesStatistics,
  type StatisticsItem,
  type StatisticsItemMinimal,
  type VendorUsageStatistics
} from '@/stores/statistics'
import { buildDailyStatistics, type DailyStatisticsOptions } from '@/utils/dailyStatistics'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePreferredDark } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'

const itemsStore = useItemsStore()
const store = useStatisticsStore()
const isDark = usePreferredDark()
const { t } = useI18n()

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

const itemTypes = computed(
  () => new Map(itemsStore.itemsBackoffice.map((item) => [item.ID, item.Type] as [number, string]))
)

const isTransactionCosts = (id: number) => itemTypes.value.get(id) === 'transaction_costs'
const isDonation = (id: number) => itemTypes.value.get(id) === 'donation'

// Donation and transaction costs carry internal names (e.g. "donation"), so show their type instead
const displayName = (item: StatisticsItem) => {
  const type = itemTypes.value.get(item.ID)
  return type === 'donation' || type === 'transaction_costs' ? t(`itemType_${type}`) : item.Name
}

const statisticsData = computed<StatisticsItem[]>(() => store.statisticsList ?? [])

const quantityData = computed<StatisticsItemMinimal[]>(() =>
  statisticsData.value
    .filter((item) => !isTransactionCosts(item.ID) && item.SumQuantity > 0)
    .map((item) => ({ id: item.ID, value: item.SumQuantity, name: displayName(item) }))
    .sort((a, b) => b.value - a.value)
)

const amountData = computed<StatisticsItemMinimal[]>(() =>
  statisticsData.value
    .filter((item) => !isTransactionCosts(item.ID) && item.SumAmount !== 0)
    .map((item) => ({ id: item.ID, value: item.SumAmount / 100, name: displayName(item) }))
    .sort((a, b) => b.value - a.value)
)

const itemNames = computed(
  () =>
    new Map(statisticsData.value.map((item) => [item.ID, displayName(item)] as [number, string]))
)

const buildDaily = (options: DailyStatisticsOptions = {}) =>
  buildDailyStatistics(store.days, itemNames.value, startDate.value, endDate.value, {
    excludedIDs: statisticsData.value.map((item) => item.ID).filter(isTransactionCosts),
    ...options
  })

const dayAmount = (day: DailyItemStatistics) => day.SumAmount / 100

const dailyQuantityChart = computed(() => buildDaily())
const dailyQuantityTable = computed(() => buildDaily({ maxSeries: Infinity }))
const dailyAmountChart = computed(() => buildDaily({ value: dayAmount }))
const dailyAmountTable = computed(() => buildDaily({ value: dayAmount, maxSeries: Infinity }))

// Both daily charts color products by their rank in the quantity chart
const dailyColorOrder = computed(() => {
  const keys = dailyQuantityChart.value.series.map((s) => s.key)

  for (const s of dailyAmountChart.value.series) {
    if (!keys.includes(s.key)) keys.push(s.key)
  }

  return keys
})

const vendorLabel = (vendor: VendorSalesStatistics) =>
  [vendor.LicenseID, vendor.Name].filter(Boolean).join(' ')

const topVendorsByQuantity = computed<StatisticsItemMinimal[]>(() =>
  store.topVendors.map((vendor) => ({
    id: vendor.VendorID,
    value: vendor.SumQuantity,
    name: vendorLabel(vendor)
  }))
)

const topVendorsByAmount = computed<StatisticsItemMinimal[]>(() =>
  store.topVendorsByAmount.map((vendor) => ({
    id: vendor.VendorID,
    value: vendor.SumAmount / 100,
    name: vendorLabel(vendor)
  }))
)

const vendorUsageData = computed<VendorUsageStatistics | null>(() => store.vendorUsageStats)

const soldCount = computed(() =>
  quantityData.value
    .filter((item) => !isDonation(item.id))
    .reduce((sum, item) => sum + item.value, 0)
)

const donationCount = computed(() =>
  quantityData.value
    .filter((item) => isDonation(item.id))
    .reduce((sum, item) => sum + item.value, 0)
)

const totalAmount = computed(() => amountData.value.reduce((sum, item) => sum + item.value, 0))

// Transaction costs are expenses, so they are shown on their own instead of as income
const transactionCosts = computed(
  () =>
    statisticsData.value
      .filter((item) => isTransactionCosts(item.ID))
      .reduce((sum, item) => sum + item.SumAmount, 0) / 100
)

const euro = (value: number) =>
  value.toLocaleString('de-AT', { style: 'currency', currency: 'EUR' })

const number = (value: number) => value.toLocaleString('de-AT')

const loadStatistics = async () => {
  await Promise.all([
    store.getPayments(startDate.value, endDate.value),
    store.getVendorUsage(startDate.value, endDate.value)
  ])
}

useAuthLoad(async () => {
  await Promise.all([itemsStore.getItemsBackoffice(), loadStatistics()])
})
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
          :dark="isDark"
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
      <div class="kpis">
        <Card class="kpi">
          <span class="kpi-label">Verkaufte Produkte</span>
          <span class="kpi-value">{{ number(soldCount) }}</span>
          <span v-if="donationCount" class="kpi-hint">+ {{ number(donationCount) }} Spenden</span>
        </Card>
        <Card class="kpi">
          <span class="kpi-label">Einnahmen</span>
          <span class="kpi-value">{{ euro(totalAmount) }}</span>
        </Card>
        <Card class="kpi">
          <span class="kpi-label">{{ $t('itemType_transaction_costs') }}</span>
          <span class="kpi-value">{{ euro(transactionCosts) }}</span>
        </Card>
        <Card class="kpi">
          <span class="kpi-label">Nutzende Verkäufer:innen</span>
          <span class="kpi-value">
            {{ vendorUsageData ? `${vendorUsageData.UsedPercentage.toFixed(0)} %` : '–' }}
          </span>
          <span v-if="vendorUsageData" class="kpi-hint">
            {{ number(vendorUsageData.UsedVendors) }} von {{ number(vendorUsageData.TotalVendors) }}
          </span>
        </Card>
      </div>

      <template v-if="showCharts">
        <div class="grid">
          <Card>
            <h2 class="section-title">Verkaufte Menge pro Tag</h2>
            <StatisticsDailyChart :data="dailyQuantityChart" :color-order="dailyColorOrder" />
          </Card>
          <Card>
            <h2 class="section-title">Einnahmen pro Tag</h2>
            <StatisticsDailyChart
              :data="dailyAmountChart"
              :format="euro"
              :color-order="dailyColorOrder"
            />
          </Card>
          <Card>
            <h2 class="section-title">Verkaufte Menge pro Produkt</h2>
            <StatisticsBarChart :data="quantityData" label="Menge" integer />
          </Card>
          <Card>
            <h2 class="section-title">Einnahmen pro Produkt</h2>
            <StatisticsBarChart :data="amountData" label="Betrag" :format="euro" />
          </Card>
          <Card>
            <h2 class="section-title">Top 10 Verkäufer:innen (verkaufte Menge)</h2>
            <StatisticsBarChart :data="topVendorsByQuantity" label="Menge" integer />
          </Card>
          <Card>
            <h2 class="section-title">Top 10 Verkäufer:innen (Einnahmen)</h2>
            <StatisticsBarChart :data="topVendorsByAmount" label="Betrag" :format="euro" />
          </Card>
        </div>
      </template>

      <template v-if="showTable">
        <Card class="section">
          <StatisticsDailyTable
            :data="dailyQuantityTable"
            title="Verkaufte Menge pro Tag"
            filename="statistics_daily_quantity"
          />
        </Card>
        <Card class="section">
          <StatisticsDailyTable
            :data="dailyAmountTable"
            title="Einnahmen pro Tag"
            filename="statistics_daily_amount"
            :format="euro"
          />
        </Card>
        <div class="grid">
          <Card>
            <StatisticsQuantityTable :data="quantityData" />
          </Card>
          <Card>
            <StatisticsAmountTable :data="amountData" />
          </Card>
        </div>
        <div class="grid">
          <Card>
            <StatisticsTopVendorsTable
              :data="store.topVendors"
              title="Top 10 Verkäufer:innen (verkaufte Menge)"
              filename="statistics_top_vendors_quantity"
            />
          </Card>
          <Card>
            <StatisticsTopVendorsTable
              :data="store.topVendorsByAmount"
              title="Top 10 Verkäufer:innen (Einnahmen)"
              filename="statistics_top_vendors_amount"
            />
          </Card>
        </div>
        <Card class="section">
          <StatisticsVendorUsageTable :data="vendorUsageData" />
        </Card>
      </template>
    </template>
  </component>
</template>

<style scoped>
.kpis {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
}
.kpis .kpi {
  display: flex;
  flex-direction: column;
  gap: 2px;
  padding: 14px 16px;
}
.kpi-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}
.kpi-value {
  font-size: 24px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text);
}
.kpi-hint {
  font-size: 12px;
  color: var(--color-text-muted);
}
.section {
  margin-bottom: 16px;
}
.grid {
  display: grid;
  /* At most two columns (each at least half the width), one column below 2 × 380px */
  grid-template-columns: repeat(auto-fit, minmax(min(100%, max(380px, calc(50% - 8px))), 1fr));
  gap: 16px;
  margin-bottom: 16px;
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
