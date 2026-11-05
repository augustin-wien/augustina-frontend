<script lang="ts" setup>
import { computed, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { fetchMonthlyReport, downloadMonthlyReport, sendMonthlyReport } from '@/api/api'
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

const toMonth = (d: Date) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
const currentMonth = toMonth(new Date())
const monthPattern = /^\d{4}-(0[1-9]|1[0-2])$/

const month = computed(() => {
  const m = route.query.month
  return typeof m === 'string' && monthPattern.test(m) && m <= currentMonth ? m : currentMonth
})

const shiftMonth = (m: string, delta: number) => {
  const [year, mon] = m.split('-').map(Number)
  return toMonth(new Date(year, mon - 1 + delta, 1))
}

const goTo = (m: string) => {
  if (m > currentMonth) return
  router.replace({ query: { ...route.query, month: m } })
}

const monthLabel = computed(() => {
  const [year, mon] = month.value.split('-').map(Number)
  return new Date(year, mon - 1, 1).toLocaleDateString(
    locale.value === 'de' ? 'de-AT' : locale.value,
    {
      month: 'long',
      year: 'numeric'
    }
  )
})

const isRunning = computed(() => month.value === currentMonth)

const report = ref<MonthlyReport | null>(null)
const loading = ref(false)
const loadFailed = ref(false)
const sending = ref(false)
const toast = ref<{ message: string; type: string } | null>(null)

async function load() {
  const requested = month.value
  loading.value = true
  loadFailed.value = false

  try {
    const res = await fetchMonthlyReport(requested)
    if (requested === month.value) report.value = res.data
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Loading monthly report failed:', error)

    if (requested === month.value) {
      report.value = null
      loadFailed.value = true
    }
  } finally {
    if (requested === month.value) loading.value = false
  }
}

useAuthLoad(load)
watch(month, load)

async function download(format: 'csv' | 'pdf') {
  try {
    await downloadMonthlyReport(month.value, format)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Downloading monthly report failed:', error)
    toast.value = { message: t('monthlyReportDownloadFailed'), type: 'error' }
  }
}

async function send() {
  if (!window.confirm(t('monthlyReportSendConfirm', { month: monthLabel.value }))) return
  sending.value = true

  try {
    await sendMonthlyReport(month.value)
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
        <div class="month-nav">
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
          <h2>{{ monthLabel }}</h2>
          <Badge v-if="isRunning" variant="info">{{ $t('monthlyReportRunning') }}</Badge>
        </div>

        <Card v-if="loadFailed" class="notice">{{ $t('monthlyReportLoadFailed') }}</Card>

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
