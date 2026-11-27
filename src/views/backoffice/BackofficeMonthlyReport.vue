<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthLoad } from '@/composables/useAuthLoad'
import {
  fetchReport,
  fetchLastReport,
  downloadReport,
  sendReport,
  type ReportPeriod
} from '@/api/api'
import { formatCredit } from '@/utils/utils'
import {
  faChevronLeft,
  faChevronRight,
  faFileCsv,
  faFilePdf,
  faPaperPlane
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import ToastMessage from '@/components/ToastMessage.vue'

interface ItemLine {
  ItemID: number
  Name: string
  Type: string
  Quantity: number
  Amount: number
}

interface MonthlyReport {
  Month: string
  Income: number
  OnlineSales: number
  OnlineOrders: number
  POSCash: number
  POSCredit: number
  ExternalPayments: number
  LicenseIncome: number
  LicenseQuantity: number
  TransactionCosts: number
  TransactionCostsCoveredByOrga: number
  Payouts: number
  PayoutCount: number
  Items: ItemLine[]
}

const { t, locale } = useI18n()
const route = useRoute()
const router = useRouter()

const pad = (n: number) => String(n).padStart(2, '0')
const toMonth = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
const toDay = (d: Date) => `${toMonth(d)}-${pad(d.getDate())}`

const parseDay = (day: string) => {
  const [year, mon, date] = day.split('-').map(Number)
  return new Date(year, mon - 1, date)
}

const addDays = (day: string, delta: number) => {
  const d = parseDay(day)
  d.setDate(d.getDate() + delta)
  return toDay(d)
}

const now = new Date()
const currentMonth = toMonth(now)
const today = toDay(now)
const yesterday = addDays(today, -1)
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/
const dayPattern = /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/

const mode = computed<'period' | 'month'>(() => (route.query.mode === 'month' ? 'month' : 'period'))

const month = computed(() => {
  const m = route.query.month
  return typeof m === 'string' && monthPattern.test(m) && m <= currentMonth ? m : currentMonth
})

const dayFromQuery = (key: 'from' | 'to') => {
  const d = route.query[key]
  return typeof d === 'string' && dayPattern.test(d) && d <= today ? d : ''
}

const periodFrom = computed(() => dayFromQuery('from'))
const periodTo = computed(() => dayFromQuery('to'))

const invalidPeriod = computed(
  () =>
    mode.value === 'period' &&
    !!periodFrom.value &&
    !!periodTo.value &&
    periodFrom.value > periodTo.value
)

const period = computed<ReportPeriod | null>(() => {
  if (mode.value === 'month') return { month: month.value }
  if (!periodFrom.value || !periodTo.value || invalidPeriod.value) return null
  return { from: periodFrom.value, to: periodTo.value }
})

const lastDayOfMonth = (m: string) => {
  const [year, mon] = m.split('-').map(Number)
  return toDay(new Date(year, mon, 0))
}

const shiftMonth = (m: string, delta: number) => {
  const [year, mon] = m.split('-').map(Number)
  return toMonth(new Date(year, mon - 1 + delta, 1))
}

const goTo = (m: string) => {
  if (!monthPattern.test(m) || m > currentMonth) return
  router.replace({ query: { mode: 'month', month: m } })
}

const setPeriod = (from: string, to: string) => {
  router.replace({ query: { from, to } })
}

const setMode = (m: 'period' | 'month') => {
  if (m === mode.value) return
  router.replace({ query: m === 'month' ? { mode: 'month' } : {} })
}

const dateLocale = computed(() => (locale.value === 'de' ? 'de-AT' : locale.value))

const formatDay = (day: string) =>
  parseDay(day).toLocaleDateString(dateLocale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

const title = computed(() => {
  const p = period.value
  if (p && 'from' in p) return `${formatDay(p.from)} – ${formatDay(p.to)}`
  if (mode.value === 'period') return t('monthlyReportModePeriod')
  const [year, mon] = month.value.split('-').map(Number)
  return new Date(year, mon - 1, 1).toLocaleDateString(dateLocale.value, {
    month: 'long',
    year: 'numeric'
  })
})

const isRunning = computed(() => mode.value === 'month' && month.value === currentMonth)

const report = ref<MonthlyReport | null>(null)
const lastTo = ref('')
const loading = ref(false)
const loadFailed = ref(false)
const sending = ref(false)
const toast = ref<{ message: string; type: string } | null>(null)

const periodKey = (p: ReportPeriod | null) => JSON.stringify(p)

async function loadLastReport() {
  try {
    const res = await fetchLastReport()
    lastTo.value = dayPattern.test(res.data.To) ? res.data.To : ''
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Loading the last report failed:', error)
  }
}

// The period starts the day after the last report, or on the first of the month, and ends yesterday
async function preselectPeriod() {
  await loadLastReport()
  let from = lastTo.value ? addDays(lastTo.value, 1) : `${yesterday.slice(0, 7)}-01`
  if (from > today) from = today
  const to = from > yesterday ? from : yesterday

  if (route.query.from === from && route.query.to === to) await load()
  else setPeriod(from, to)
}

async function load() {
  const requested = period.value
  loadFailed.value = false

  if (!requested) {
    report.value = null
    loading.value = false
    return
  }

  loading.value = true

  try {
    const res = await fetchReport(requested)
    if (periodKey(requested) === periodKey(period.value)) report.value = res.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Loading report failed:', error)

    if (periodKey(requested) === periodKey(period.value)) {
      report.value = null
      loadFailed.value = true
    }
  } finally {
    if (periodKey(requested) === periodKey(period.value)) loading.value = false
  }
}

let preselected = false

async function refresh() {
  if (mode.value === 'period' && (!preselected || (!route.query.from && !route.query.to))) {
    preselected = true
    await preselectPeriod()
    return
  }

  if (mode.value === 'period' && !lastTo.value) loadLastReport()
  await load()
}

useAuthLoad(refresh)
watch(() => route.fullPath, refresh)

const rememberReport = () => {
  const p = period.value
  if (!p) return
  const last = 'month' in p ? lastDayOfMonth(p.month) : p.to
  lastTo.value = last > today ? today : last
}

async function download(format: 'csv' | 'pdf') {
  if (!period.value) return

  try {
    await downloadReport(period.value, format)
    rememberReport()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Downloading report failed:', error)
    toast.value = { message: t('monthlyReportDownloadFailed'), type: 'error' }
  }
}

async function send() {
  if (!period.value) return
  if (!window.confirm(t('monthlyReportSendConfirm', { month: title.value }))) return
  sending.value = true

  try {
    await sendReport(period.value)
    rememberReport()
    toast.value = { message: t('monthlyReportSent'), type: 'success' }
  } catch (error) {
    const noRecipient = isAxiosError(error) && error.response?.status === 400

    toast.value = {
      message: noRecipient ? t('monthlyReportNoRecipient') : t('monthlyReportSendFailed'),
      type: 'error'
    }
  } finally {
    sending.value = false
  }
}

const rows = computed(() => {
  const r = report.value
  if (!r) return []
  return [
    { label: t('monthlyReportIncome'), amount: r.Income, count: null },
    {
      label: t('monthlyReportOnlineSales'),
      amount: r.OnlineSales,
      count: r.OnlineOrders,
      detail: true
    },
    { label: t('monthlyReportPOSCash'), amount: r.POSCash, count: null, detail: true },
    {
      label: t('monthlyReportExternalPayments'),
      amount: r.ExternalPayments,
      count: null,
      detail: true
    },
    { label: t('monthlyReportLicenseIncome'), amount: r.LicenseIncome, count: r.LicenseQuantity },
    { label: t('monthlyReportTransactionCosts'), amount: r.TransactionCosts, count: null },
    {
      label: t('monthlyReportCoveredByOrga'),
      amount: r.TransactionCostsCoveredByOrga,
      count: null,
      detail: true
    },
    { label: t('monthlyReportPayouts'), amount: r.Payouts, count: r.PayoutCount },
    { label: t('monthlyReportPOSCredit'), amount: r.POSCredit, count: null }
  ]
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('monthlyReportTitle')">
        <div class="mode-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            class="mode-tab"
            :class="{ active: mode === 'period' }"
            :aria-selected="mode === 'period'"
            data-test="mode-period"
            @click="setMode('period')"
          >
            {{ $t('monthlyReportModePeriod') }}
          </button>
          <button
            type="button"
            role="tab"
            class="mode-tab"
            :class="{ active: mode === 'month' }"
            :aria-selected="mode === 'month'"
            data-test="mode-month"
            @click="setMode('month')"
          >
            {{ $t('monthlyReportModeMonth') }}
          </button>
        </div>
        <div v-if="mode === 'period'" class="month-nav">
          <input
            :value="periodFrom"
            type="date"
            class="aug-input month-input"
            :max="periodTo || today"
            :aria-label="$t('monthlyReportFrom')"
            data-test="period-from"
            @change="setPeriod(($event.target as HTMLInputElement).value, periodTo)"
          />
          <span aria-hidden="true">–</span>
          <input
            :value="periodTo"
            type="date"
            class="aug-input month-input"
            :min="periodFrom"
            :max="today"
            :aria-label="$t('monthlyReportTo')"
            data-test="period-to"
            @change="setPeriod(periodFrom, ($event.target as HTMLInputElement).value)"
          />
        </div>
        <div v-else class="month-nav">
          <button
            type="button"
            class="aug-icon-btn"
            :aria-label="$t('monthlyReportPrevious')"
            @click="goTo(shiftMonth(month, -1))"
          >
            <font-awesome-icon :icon="faChevronLeft" />
          </button>
          <input
            :value="month"
            type="month"
            class="aug-input month-input"
            :max="currentMonth"
            :aria-label="$t('monthlyReportMonth')"
            @change="goTo(($event.target as HTMLInputElement).value)"
          />
          <button
            type="button"
            class="aug-icon-btn"
            :aria-label="$t('monthlyReportNext')"
            :disabled="isRunning"
            @click="goTo(shiftMonth(month, 1))"
          >
            <font-awesome-icon :icon="faChevronRight" />
          </button>
        </div>
        <Button variant="secondary" :disabled="!report" @click="download('csv')">
          <font-awesome-icon :icon="faFileCsv" /> CSV
        </Button>
        <Button variant="secondary" :disabled="!report" @click="download('pdf')">
          <font-awesome-icon :icon="faFilePdf" /> PDF
        </Button>
        <Button variant="secondary" :disabled="!report || sending" @click="send">
          <font-awesome-icon :icon="faPaperPlane" /> {{ $t('monthlyReportSend') }}
        </Button>
      </PageHeader>
    </template>

    <template #main>
      <ToastMessage :toast="toast" @close="toast = null" />
      <div class="main space-y-4">
        <div class="month-title">
          <h2>{{ title }}</h2>
          <Badge v-if="isRunning" variant="info">{{ $t('monthlyReportRunning') }}</Badge>
        </div>
        <p v-if="mode === 'period' && lastTo" class="notice" data-test="last-report">
          {{ $t('monthlyReportLastTo', { date: formatDay(lastTo) }) }}
        </p>

        <Card v-if="invalidPeriod" class="notice">{{ $t('monthlyReportInvalidPeriod') }}</Card>
        <Card v-else-if="loadFailed" class="notice">{{ $t('monthlyReportLoadFailed') }}</Card>

        <template v-else>
          <div class="stat-grid" :aria-busy="loading">
            <Card>
              <div class="stat-label">{{ $t('monthlyReportIncome') }}</div>
              <div class="stat-value col-success">
                {{ report ? formatCredit(report.Income) : '…' }} €
              </div>
            </Card>
            <Card>
              <div class="stat-label">{{ $t('monthlyReportLicenseIncome') }}</div>
              <div class="stat-value">
                {{ report ? formatCredit(report.LicenseIncome) : '…' }} €
              </div>
            </Card>
            <Card>
              <div class="stat-label">{{ $t('monthlyReportTransactionCosts') }}</div>
              <div class="stat-value">
                {{ report ? formatCredit(report.TransactionCosts) : '…' }} €
              </div>
            </Card>
            <Card>
              <div class="stat-label">{{ $t('monthlyReportPayouts') }}</div>
              <div class="stat-value">{{ report ? formatCredit(report.Payouts) : '…' }} €</div>
            </Card>
          </div>

          <Card class="table-section">
            <table class="aug-table">
              <thead>
                <tr>
                  <th>{{ $t('monthlyReportPosition') }}</th>
                  <th class="text-right num-col">{{ $t('amount') }}</th>
                  <th class="text-right num-col">{{ $t('monthlyReportCount') }}</th>
                </tr>
              </thead>
              <tbody :aria-busy="loading">
                <tr v-if="!report">
                  <td colspan="3" class="entry-empty">…</td>
                </tr>
                <tr v-for="row in rows" v-else :key="row.label" :class="{ detail: row.detail }">
                  <td>{{ row.label }}</td>
                  <td class="text-right">{{ formatCredit(row.amount) }} €</td>
                  <td class="text-right">{{ row.count ?? '' }}</td>
                </tr>
              </tbody>
            </table>
            <p class="hint">{{ $t('monthlyReportHint') }}</p>
          </Card>

          <Card class="table-section">
            <h3 class="table-title">{{ $t('monthlyReportItems') }}</h3>
            <table class="aug-table">
              <thead>
                <tr>
                  <th>{{ $t('monthlyReportProduct') }}</th>
                  <th class="text-right num-col">{{ $t('amount') }}</th>
                  <th class="text-right num-col">{{ $t('monthlyReportCount') }}</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="report && report.Items.length === 0">
                  <td colspan="3" class="entry-empty">{{ $t('monthlyReportNoSales') }}</td>
                </tr>
                <tr v-for="item in report?.Items ?? []" :key="item.ItemID">
                  <td>{{ item.Name }}</td>
                  <td class="text-right">{{ formatCredit(item.Amount) }} €</td>
                  <td class="text-right">{{ item.Quantity }}</td>
                </tr>
              </tbody>
            </table>
          </Card>
        </template>
      </div>
    </template>
  </component>
</template>

<style scoped>
.month-nav {
  display: flex;
  align-items: center;
  gap: 6px;
}
.month-input {
  width: auto;
}
.mode-tabs {
  display: flex;
  gap: 6px;
}
.mode-tab {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.mode-tab.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-accent, #fff);
}
.month-title {
  display: flex;
  align-items: center;
  gap: 10px;
}
.month-title h2 {
  font-size: 20px;
  font-weight: 700;
}
.notice {
  font-size: 13px;
  color: var(--color-text-muted);
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
@media (max-width: 900px) {
  .stat-grid {
    grid-template-columns: repeat(2, 1fr);
  }
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
.col-success {
  color: var(--color-success);
}
.table-section {
  overflow-x: auto;
}
.table-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
}
.detail td {
  color: var(--color-text-muted);
  font-size: 13px;
}
.detail td:first-child {
  padding-left: 28px;
}
.num-col {
  width: 160px;
}
.text-right {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 12px;
}
.entry-empty {
  text-align: center;
  color: var(--color-text-muted);
}
</style>
