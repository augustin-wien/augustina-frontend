<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePreferredDark } from '@vueuse/core'
import { ref, computed } from 'vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { fetchAllPOSOrders } from '@/api/api'
import { formatCredit } from '@/utils/utils'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const startOfDay = (date: Date) => {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

const yesterday = startOfDay(new Date(new Date().setDate(new Date().getDate() - 2)))
const tomorrow = startOfDay(new Date(new Date().setDate(new Date().getDate() + 1)))
const startDate = ref<Date>(yesterday)
const endDate = ref<Date>(tomorrow)
const date = ref([startDate.value, endDate.value])
const isDark = usePreferredDark()

interface POSOrderItem {
  itemId: number
  itemName: string
  quantity: number
  price: number
  amount: number
}
interface POSOrder {
  timestamp: string
  items: POSOrderItem[]
  totalAmount: number
  balanceUsed: number
  cashAmount: number
  authorizedBy: string
  vendorName: string
  vendorLicenseId: string
}

const orders = ref<POSOrder[]>([])
const loading = ref(false)

async function load() {
  loading.value = true

  try {
    const res = await fetchAllPOSOrders(startDate.value, endDate.value)
    orders.value = res.data ?? []
  } finally {
    loading.value = false
  }
}

const onRangeStart = (value: Date) => {
  startDate.value = value
  load()
}

const onRangeEnd = (value: Date) => {
  endDate.value = value
  load()
}

useAuthLoad(load)

const totalBalance = computed(() => orders.value.reduce((s, o) => s + o.balanceUsed, 0))

const totalCash = computed(() =>
  orders.value.reduce((s, o) => s + (o.cashAmount || (!o.balanceUsed ? o.totalAmount : 0)), 0)
)

const totalAll = computed(() =>
  orders.value.reduce((s, o) => s + (o.totalAmount || o.balanceUsed), 0)
)

const totalOrders = computed(() => orders.value.length)

// Aggregate per-item totals across all orders
const itemTotals = computed(() => {
  const map = new Map<string, { name: string; quantity: number; amount: number }>()

  for (const order of orders.value) {
    for (const item of order.items ?? []) {
      const key = item.itemName || `#${item.itemId}`
      const existing = map.get(key)

      if (existing) {
        existing.quantity += item.quantity
        existing.amount += item.amount
      } else {
        map.set(key, { name: key, quantity: item.quantity, amount: item.amount })
      }
    }
  }

  return [...map.values()].sort((a, b) => b.amount - a.amount)
})

function formatDate(ts: string) {
  const d = new Date(ts)
  return (
    d.toLocaleDateString('de-AT') +
    ' ' +
    d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })
  )
}

function itemSummary(order: POSOrder) {
  if (!order.items?.length) return '—'
  return order.items.map((i) => `${i.quantity}× ${i.itemName || '#' + i.itemId}`).join(', ')
}

// Cash paid for an order, in cents: explicit cash amount, otherwise the full
// total when no balance was used, otherwise nothing.
function cashPaid(o: POSOrder): number {
  if (o.cashAmount > 0) return o.cashAmount
  if (!o.balanceUsed) return o.totalAmount
  return 0
}

function downloadCSV() {
  const header = ['Datum', 'Verkäufer:in', 'Artikel', 'Guthaben (€)', 'Bar (€)', 'Gesamt (€)']

  const rows = orders.value.map((o) => [
    formatDate(o.timestamp),
    `${o.vendorName} (${o.vendorLicenseId})`,
    itemSummary(o),
    o.balanceUsed > 0 ? (o.balanceUsed / 100).toFixed(2) : '',
    cashPaid(o) > 0 ? (cashPaid(o) / 100).toFixed(2) : '',
    ((o.totalAmount || o.balanceUsed) / 100).toFixed(2)
  ])

  rows.push([
    'Gesamt',
    '',
    '',
    (totalBalance.value / 100).toFixed(2),
    (totalCash.value / 100).toFixed(2),
    (totalAll.value / 100).toFixed(2)
  ])

  const csv = [header, ...rows]
    .map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';'))
    .join('\r\n')

  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  const from = startDate.value.toISOString().slice(0, 10)
  const to = endDate.value.toISOString().slice(0, 10)
  a.href = url
  a.download = `kassa-buchhaltung_${from}_${to}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('posAccountingTitle')">
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
        <Button variant="secondary" :disabled="orders.length === 0" @click="downloadCSV">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('downloadCSV') }}
        </Button>
      </PageHeader>
    </template>

    <template #main>
      <div class="main space-y-4">
        <!-- Summary cards -->
        <div v-if="orders.length > 0" class="stat-grid">
          <Card>
            <div class="stat-label">{{ $t('posOrderCount') }}</div>
            <div class="stat-value">{{ totalOrders }}</div>
          </Card>
          <Card>
            <div class="stat-label">{{ $t('posBalanceUsed') }}</div>
            <div class="stat-value col-info">{{ formatCredit(totalBalance) }} €</div>
          </Card>
          <Card>
            <div class="stat-label">{{ $t('posCash') }}</div>
            <div class="stat-value col-success">{{ formatCredit(totalCash) }} €</div>
          </Card>
          <Card>
            <div class="stat-label">{{ $t('total') }}</div>
            <div class="stat-value">{{ formatCredit(totalAll) }} €</div>
          </Card>
        </div>

        <!-- Per-item totals -->
        <Card v-if="itemTotals.length > 0">
          <h2 class="section-title">{{ $t('posItemTotals') }}</h2>
          <div class="chip-list">
            <div v-for="it in itemTotals" :key="it.name" class="chip">
              <span class="font-medium">{{ it.name }}</span>
              <span class="muted">{{ it.quantity }}×</span>
              <span class="font-semibold">{{ formatCredit(it.amount) }} €</span>
            </div>
          </div>
        </Card>

        <!-- Orders table -->
        <Card class="table-section">
          <table class="aug-table">
            <thead>
              <tr>
                <th>{{ $t('date') }}</th>
                <th>{{ $t('posVendor') }}</th>
                <th>{{ $t('item') }}</th>
                <th class="text-right col-info">{{ $t('posBalanceUsed') }}</th>
                <th class="text-right col-success">{{ $t('posCash') }}</th>
                <th class="text-right">{{ $t('total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="entry-empty">…</td>
              </tr>
              <tr v-else-if="orders.length === 0">
                <td colspan="6" class="entry-empty">{{ $t('posNoHistory') }}</td>
              </tr>
              <tr v-for="(order, idx) in orders" :key="idx">
                <td class="nowrap">{{ formatDate(order.timestamp) }}</td>
                <td>
                  <div class="font-medium">{{ order.vendorName }}</div>
                  <div class="muted">{{ order.vendorLicenseId }}</div>
                </td>
                <td>
                  <ul v-if="order.items?.length" class="item-list">
                    <li v-for="(item, i) in order.items" :key="i">
                      {{ item.quantity }}× {{ item.itemName || `#${item.itemId}` }}
                    </li>
                  </ul>
                  <span v-else class="muted">—</span>
                </td>
                <td class="text-right col-info">
                  {{ order.balanceUsed > 0 ? formatCredit(order.balanceUsed) + ' €' : '—' }}
                </td>
                <td class="text-right col-success">
                  <template v-if="order.cashAmount > 0"
                    >{{ formatCredit(order.cashAmount) }} €</template
                  >
                  <template v-else-if="!order.balanceUsed && order.totalAmount"
                    >{{ formatCredit(order.totalAmount) }} €</template
                  >
                  <template v-else>—</template>
                </td>
                <td class="text-right font-semibold">
                  {{ formatCredit(order.totalAmount || order.balanceUsed) }} €
                </td>
              </tr>
              <!-- Totals row -->
              <tr v-if="orders.length > 0" class="totals-row">
                <td class="font-bold" colspan="3">{{ $t('total') }} ({{ totalOrders }})</td>
                <td class="text-right col-info font-bold">{{ formatCredit(totalBalance) }} €</td>
                <td class="text-right col-success font-bold">{{ formatCredit(totalCash) }} €</td>
                <td class="text-right font-bold">{{ formatCredit(totalAll) }} €</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </template>
  </component>
</template>

<style scoped>
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.stat-label {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}
.stat-value {
  font-size: 20px;
  font-weight: 700;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 12px;
}
.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}
.chip {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  font-size: 13px;
}
.table-section {
  overflow-x: auto;
}
.col-info {
  color: var(--color-info);
}
.col-success {
  color: var(--color-success);
}
.muted {
  color: var(--color-text-muted);
  font-size: 12px;
}
.nowrap {
  white-space: nowrap;
}
.item-list {
  list-style: none;
  margin: 0;
  padding: 0;
}
.entry-empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: 16px;
}
.totals-row td {
  border-top: 2px solid var(--color-border);
}

@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
