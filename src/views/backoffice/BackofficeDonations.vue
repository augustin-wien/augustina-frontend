<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { useColorScheme } from '@/composables/useColorScheme'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { fetchExternalPayments } from '@/api/api'
import { useSettingsStore } from '@/stores/settings'
import { formatCredit } from '@/utils/utils'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

interface ExternalPayment {
  id: number
  transaction_id: string
  order_code: string
  amount: number
  fee: number
  status_id: string
  source_code: string
  source_name: string
  terminal_id: number
  merchant_trns: string
  paid_at: string
}

const { t } = useI18n()
const settingsStore = useSettingsStore()
const { isDark } = useColorScheme()

const startOfMonth = () => {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
}

const tomorrow = () => {
  const d = new Date()
  d.setDate(d.getDate() + 1)
  d.setHours(0, 0, 0, 0)
  return d
}

const startDate = ref<Date>(startOfMonth())
const endDate = ref<Date>(tomorrow())
const date = ref([startDate.value, endDate.value])

const payments = ref<ExternalPayment[]>([])
const loading = ref(false)
const loadFailed = ref(false)
const sourceFilter = ref('')

async function load() {
  loading.value = true
  loadFailed.value = false

  try {
    const res = await fetchExternalPayments(startDate.value, endDate.value)
    payments.value = res.data ?? []
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Loading external payments failed:', error)
    loadFailed.value = true
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

const trackingEnabled = computed(() => !!settingsStore.settings.DonationTrackingEnabled)

const sourceLabel = (p: ExternalPayment) => p.source_name || p.source_code || '—'

const terminalLabel = (p: ExternalPayment) => (p.terminal_id ? String(p.terminal_id) : '—')

const sources = computed(() => [...new Set(payments.value.map(sourceLabel))].sort())

const filtered = computed(() =>
  sourceFilter.value
    ? payments.value.filter((p) => sourceLabel(p) === sourceFilter.value)
    : payments.value
)

const totalAmount = computed(() => filtered.value.reduce((s, p) => s + p.amount, 0))
const totalFee = computed(() => filtered.value.reduce((s, p) => s + p.fee, 0))
const totalNet = computed(() => totalAmount.value - totalFee.value)

function formatDate(ts: string) {
  const d = new Date(ts)
  return (
    d.toLocaleDateString('de-AT') +
    ' ' +
    d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })
  )
}

const euros = (cents: number) => (cents / 100).toFixed(2)

function downloadCSV() {
  const header = [
    t('date'),
    t('donationsSource'),
    t('donationsTerminal'),
    t('donationsTransaction'),
    `${t('donationsAmount')} (€)`,
    `${t('donationsFee')} (€)`,
    `${t('donationsNet')} (€)`
  ]

  const rows = filtered.value.map((p) => [
    formatDate(p.paid_at),
    sourceLabel(p),
    terminalLabel(p),
    p.transaction_id,
    euros(p.amount),
    euros(p.fee),
    euros(p.amount - p.fee)
  ])

  rows.push([
    t('total'),
    '',
    '',
    '',
    euros(totalAmount.value),
    euros(totalFee.value),
    euros(totalNet.value)
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
  a.download = `spenden_${from}_${to}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('donationsTitle')">
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
        <Button variant="secondary" :disabled="filtered.length === 0" @click="downloadCSV">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('downloadCSV') }}
        </Button>
      </PageHeader>
    </template>

    <template #main>
      <div class="main space-y-4">
        <Card v-if="settingsStore.settingsLoaded && !trackingEnabled" class="notice">
          {{ $t('donationsDisabledHint') }}
        </Card>

        <div class="stat-grid">
          <Card>
            <div class="stat-label">{{ $t('donationsCount') }}</div>
            <div class="stat-value">{{ filtered.length }}</div>
          </Card>
          <Card>
            <div class="stat-label">{{ $t('donationsAmount') }}</div>
            <div class="stat-value col-success">{{ formatCredit(totalAmount) }} €</div>
          </Card>
          <Card>
            <div class="stat-label">{{ $t('donationsFee') }}</div>
            <div class="stat-value">{{ formatCredit(totalFee) }} €</div>
          </Card>
          <Card>
            <div class="stat-label">{{ $t('donationsNet') }}</div>
            <div class="stat-value">{{ formatCredit(totalNet) }} €</div>
          </Card>
        </div>

        <Card class="table-section">
          <div class="table-toolbar">
            <p class="hint">{{ $t('donationsHint') }}</p>
            <select
              v-if="sources.length > 1"
              v-model="sourceFilter"
              class="aug-input source-filter"
              :aria-label="$t('donationsSource')"
            >
              <option value="">{{ $t('donationsAllSources') }}</option>
              <option v-for="s in sources" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
          <table class="aug-table">
            <thead>
              <tr>
                <th>{{ $t('date') }}</th>
                <th>{{ $t('donationsSource') }}</th>
                <th>{{ $t('donationsTerminal') }}</th>
                <th>{{ $t('donationsTransaction') }}</th>
                <th class="text-right">{{ $t('donationsAmount') }}</th>
                <th class="text-right">{{ $t('donationsFee') }}</th>
                <th class="text-right">{{ $t('donationsNet') }}</th>
              </tr>
            </thead>
            <tbody :aria-busy="loading">
              <tr v-if="loading">
                <td colspan="7" class="entry-empty">…</td>
              </tr>
              <tr v-else-if="loadFailed">
                <td colspan="7" class="entry-empty">{{ $t('donationsLoadFailed') }}</td>
              </tr>
              <tr v-else-if="filtered.length === 0">
                <td colspan="7" class="entry-empty">{{ $t('donationsNone') }}</td>
              </tr>
              <template v-else>
                <tr v-for="p in filtered" :key="p.id">
                  <td class="nowrap">{{ formatDate(p.paid_at) }}</td>
                  <td>{{ sourceLabel(p) }}</td>
                  <td>{{ terminalLabel(p) }}</td>
                  <td class="muted mono">{{ p.transaction_id }}</td>
                  <td class="text-right font-semibold">{{ formatCredit(p.amount) }} €</td>
                  <td class="text-right">{{ formatCredit(p.fee) }} €</td>
                  <td class="text-right">{{ formatCredit(p.amount - p.fee) }} €</td>
                </tr>
                <tr class="totals-row">
                  <td class="font-bold" colspan="4">{{ $t('total') }} ({{ filtered.length }})</td>
                  <td class="text-right font-bold">{{ formatCredit(totalAmount) }} €</td>
                  <td class="text-right font-bold">{{ formatCredit(totalFee) }} €</td>
                  <td class="text-right font-bold">{{ formatCredit(totalNet) }} €</td>
                </tr>
              </template>
            </tbody>
          </table>
        </Card>
      </div>
    </template>
  </component>
</template>

<style scoped>
.notice {
  font-size: 13px;
  color: var(--color-text-muted);
}
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
  font-variant-numeric: tabular-nums;
}
.table-section {
  overflow-x: auto;
}
.table-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 14px;
}
.hint {
  font-size: 13px;
  color: var(--color-text-muted);
}
.source-filter {
  max-width: 240px;
}
.col-success {
  color: var(--color-success);
}
.muted {
  color: var(--color-text-muted);
  font-size: 12px;
}
.mono {
  font-family: ui-monospace, monospace;
}
.nowrap {
  white-space: nowrap;
}
.text-right {
  font-variant-numeric: tabular-nums;
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
  .table-toolbar {
    flex-direction: column;
  }
}
</style>
