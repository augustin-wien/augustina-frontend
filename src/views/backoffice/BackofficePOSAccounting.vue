<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ref, computed } from 'vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { fetchAllPOSOrders } from '@/api/api'
import { formatCredit } from '@/utils/utils'

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

function downloadCSV() {
  const header = ['Datum', 'Verkäufer:in', 'Artikel', 'Guthaben (€)', 'Bar (€)', 'Gesamt (€)']

  const rows = orders.value.map((o) => [
    formatDate(o.timestamp),
    `${o.vendorName} (${o.vendorLicenseId})`,
    itemSummary(o),
    o.balanceUsed > 0 ? (o.balanceUsed / 100).toFixed(2) : '',
    (() => {
      let effectiveCash = 0
      if (o.cashAmount > 0) effectiveCash = o.cashAmount
      else if (!o.balanceUsed) effectiveCash = o.totalAmount
      return effectiveCash > 0 ? ((o.cashAmount || o.totalAmount) / 100).toFixed(2) : ''
    })(),
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
      <div class="flex justify-between items-center mt-3 gap-4">
        <h1 class="font-bold text-2xl">{{ $t('posAccountingTitle') }}</h1>
        <div class="flex items-center gap-3">
          <VueDatePicker
            v-model="date"
            range
            :enable-time-picker="false"
            :placeholder="$t('chooseDateRange')"
            class="max-w-md"
            @range-start="onRangeStart"
            @range-end="onRangeEnd"
          />
          <button
            class="px-4 py-2 rounded bg-gray-700 text-white text-sm font-medium hover:bg-gray-800 whitespace-nowrap disabled:opacity-50"
            :disabled="orders.length === 0"
            @click="downloadCSV"
          >
            {{ $t('downloadCSV') }}
          </button>
        </div>
      </div>
    </template>

    <template #main>
      <div class="main space-y-4">
        <!-- Summary cards -->
        <div v-if="orders.length > 0" class="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div class="bg-white rounded shadow-sm px-4 py-3">
            <div class="text-xs text-gray-400 mb-1">{{ $t('posOrderCount') }}</div>
            <div class="text-xl font-bold">{{ totalOrders }}</div>
          </div>
          <div class="bg-white rounded shadow-sm px-4 py-3">
            <div class="text-xs text-gray-400 mb-1">{{ $t('posBalanceUsed') }}</div>
            <div class="text-xl font-bold text-blue-700">{{ formatCredit(totalBalance) }} €</div>
          </div>
          <div class="bg-white rounded shadow-sm px-4 py-3">
            <div class="text-xs text-gray-400 mb-1">{{ $t('posCash') }}</div>
            <div class="text-xl font-bold text-green-700">{{ formatCredit(totalCash) }} €</div>
          </div>
          <div class="bg-white rounded shadow-sm px-4 py-3">
            <div class="text-xs text-gray-400 mb-1">{{ $t('total') }}</div>
            <div class="text-xl font-bold">{{ formatCredit(totalAll) }} €</div>
          </div>
        </div>

        <!-- Per-item totals -->
        <div v-if="itemTotals.length > 0" class="bg-white rounded shadow-sm px-4 py-3">
          <div class="font-semibold text-gray-700 mb-2">{{ $t('posItemTotals') }}</div>
          <div class="flex flex-wrap gap-3">
            <div
              v-for="it in itemTotals"
              :key="it.name"
              class="flex items-center gap-2 bg-gray-50 border rounded px-3 py-1.5 text-sm"
            >
              <span class="font-medium">{{ it.name }}</span>
              <span class="text-gray-500">{{ it.quantity }}×</span>
              <span class="font-semibold">{{ formatCredit(it.amount) }} €</span>
            </div>
          </div>
        </div>

        <!-- Orders table -->
        <div class="w-full mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4 overflow-x-auto">
          <table class="table-auto border-collapse w-full text-sm">
            <thead>
              <tr class="text-left">
                <th class="p-3 border-b-2">{{ $t('date') }}</th>
                <th class="p-3 border-b-2">{{ $t('posVendor') }}</th>
                <th class="p-3 border-b-2">{{ $t('item') }}</th>
                <th class="p-3 border-b-2 text-right text-blue-700">{{ $t('posBalanceUsed') }}</th>
                <th class="p-3 border-b-2 text-right text-green-700">{{ $t('posCash') }}</th>
                <th class="p-3 border-b-2 text-right">{{ $t('total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td colspan="6" class="p-4 text-center text-gray-400">…</td>
              </tr>
              <tr v-else-if="orders.length === 0">
                <td colspan="6" class="p-4 text-center text-gray-400 italic">
                  {{ $t('posNoHistory') }}
                </td>
              </tr>
              <tr v-for="(order, idx) in orders" :key="idx" class="hover:bg-gray-50">
                <td class="p-3 border-t whitespace-nowrap">{{ formatDate(order.timestamp) }}</td>
                <td class="p-3 border-t">
                  <div class="font-medium">{{ order.vendorName }}</div>
                  <div class="text-xs text-gray-400">{{ order.vendorLicenseId }}</div>
                </td>
                <td class="p-3 border-t">
                  <ul v-if="order.items?.length" class="space-y-0.5">
                    <li v-for="(item, i) in order.items" :key="i">
                      {{ item.quantity }}× {{ item.itemName || `#${item.itemId}` }}
                    </li>
                  </ul>
                  <span v-else class="text-gray-400">—</span>
                </td>
                <td class="p-3 border-t text-right text-blue-700">
                  {{ order.balanceUsed > 0 ? formatCredit(order.balanceUsed) + ' €' : '—' }}
                </td>
                <td class="p-3 border-t text-right text-green-700">
                  <template v-if="order.cashAmount > 0"
                    >{{ formatCredit(order.cashAmount) }} €</template
                  >
                  <template v-else-if="!order.balanceUsed && order.totalAmount"
                    >{{ formatCredit(order.totalAmount) }} €</template
                  >
                  <template v-else>—</template>
                </td>
                <td class="p-3 border-t text-right font-semibold">
                  {{ formatCredit(order.totalAmount || order.balanceUsed) }} €
                </td>
              </tr>
              <!-- Totals row -->
              <tr v-if="orders.length > 0" class="border-t-4 font-bold bg-gray-50">
                <td class="p-3" colspan="3">{{ $t('total') }} ({{ totalOrders }})</td>
                <td class="p-3 text-right text-blue-700">{{ formatCredit(totalBalance) }} €</td>
                <td class="p-3 text-right text-green-700">{{ formatCredit(totalCash) }} €</td>
                <td class="p-3 text-right">{{ formatCredit(totalAll) }} €</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </component>
</template>
