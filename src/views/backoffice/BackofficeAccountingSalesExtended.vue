<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePreferredDark } from '@vueuse/core'
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { fetchVerifiedOrders, resendOrderMail } from '@/api/api'
import agent from '@/api/agent'
import { useItemsStore } from '@/stores/items'
import { useSettingsStore } from '@/stores/settings'
import { exportAsCsv, formatCredit } from '@/utils/utils'
import { faEnvelope, faFileCsv, faRotateRight } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Toast from '@/components/ToastMessage.vue'

// Extended sales view: one row per sale (verified online order) with all the
// products that belong to it. The plain /backoffice/sales list of single sales
// payments stays as it is for existing internal workflows.

interface OrderEntry {
  ID: number
  Item: number
  Quantity: number
  Price: number
  Sender: number
  Receiver: number
  SenderName: string
  ReceiverName: string
  IsSale: boolean
}

interface Order {
  ID: number
  OrderCode: string | null
  TransactionID: string
  Timestamp: string
  VerifiedAt: string | null
  Vendor: number
  CustomerEmail: string | null
  OdooSyncedAt: string | null
  OdooSyncError: string | null
  Entries: OrderEntry[] | null
}

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
const date = ref([startDate.value, endDate.value])
const isDark = usePreferredDark()
const itemsStore = useItemsStore()
const settingsStore = useSettingsStore()
const odooEnabled = computed(() => !!settingsStore.settings?.OdooEnabled)
const columnCount = computed(() => (odooEnabled.value ? 7 : 6))

const orders = ref<Order[]>([])
const loading = ref(false)
const searchQuery = ref('')

async function load() {
  loading.value = true

  try {
    const res = await fetchVerifiedOrders(startDate.value, endDate.value)
    orders.value = res.data ?? []
  } finally {
    loading.value = false
  }
}

useAuthLoad(() => {
  load()
  // Include archived items: sales may reference products that were deleted since.
  itemsStore.getItemsWithArchived()
})

const onRangeStart = (value: Date) => {
  startDate.value = value
  load()
}

const onRangeEnd = (value: Date) => {
  endDate.value = value
  load()
}

const formatDate = (iso: string | null) => {
  if (!iso) return '—'
  const d = new Date(iso)

  return (
    d.toLocaleDateString('de-AT') +
    ' ' +
    d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })
  )
}

const itemName = (itemID: number) => {
  const item = itemsStore.itemsWithArchived.find((i) => i.ID === itemID)

  return item ? t(item.Name) : `#${itemID}`
}

// Entries the customer paid for (buyer -> vendor)
const saleEntries = (order: Order) => (order.Entries ?? []).filter((e) => e.IsSale)
// Bookkeeping entries, e.g. license items (vendor -> orga)
const otherEntries = (order: Order) => (order.Entries ?? []).filter((e) => !e.IsSale)

const orderTotal = (order: Order) =>
  saleEntries(order).reduce((sum, e) => sum + e.Price * e.Quantity, 0)

// The vendor account is the receiver of the sale entries; its name is the license ID
const vendorLicenseId = (order: Order) => saleEntries(order)[0]?.ReceiverName || `#${order.Vendor}`

const saleTime = (order: Order) => order.VerifiedAt || order.Timestamp

// Digital sales deliver the online paper or a PDF download link by mail
const isDigitalSale = (order: Order) =>
  saleEntries(order).some((e) => {
    const item = itemsStore.itemsWithArchived.find((i) => i.ID === e.Item)

    return item && (item.LicenseItem !== null || item.Type === 'abonement')
  })

const canResendMail = (order: Order) => !!order.CustomerEmail && isDigitalSale(order)

const toast = ref<{ type: string; message: string } | null>(null)
const resendingOrderID = ref<number | null>(null)

const showToast = (type: string, message: string) => {
  toast.value = { type, message }

  setTimeout(() => {
    toast.value = null
  }, 5000)
}

async function resendMail(order: Order) {
  if (!confirm(t('salesResendMailConfirm', { email: order.CustomerEmail }))) return

  resendingOrderID.value = order.ID

  try {
    await resendOrderMail(order.ID)
    showToast('success', t('salesResendMailSuccess', { email: order.CustomerEmail }))
  } catch (err) {
    console.error('Error resending order mail:', err)
    showToast('error', t('salesResendMailError'))
  } finally {
    resendingOrderID.value = null
  }
}

// Odoo webhook delivery: delivered, failed after all retries, or never recorded
// (sent before delivery was tracked, or still retrying)
type OdooStatus = 'synced' | 'failed' | 'pending'

const odooStatus = (order: Order): OdooStatus => {
  if (order.OdooSyncedAt) return 'synced'
  if (order.OdooSyncError) return 'failed'
  return 'pending'
}

const odooBadge = { synced: 'success', failed: 'danger', pending: 'neutral' } as const

const odooLabel = {
  synced: 'salesOdooSynced',
  failed: 'salesOdooFailed',
  pending: 'salesOdooPending'
} as const

const odooTitle = (order: Order) => {
  const status = odooStatus(order)
  if (status === 'synced') return formatDate(order.OdooSyncedAt)
  if (status === 'failed') return order.OdooSyncError ?? ''
  return t('salesOdooPendingHint')
}

const resendingOdooOrderID = ref<number | null>(null)

async function resendOdoo(order: Order) {
  if (!confirm(t('salesOdooResendConfirm', { id: order.ID }))) return

  resendingOdooOrderID.value = order.ID

  try {
    const res = await agent.VivaWallet.resendWebhook(order.ID)
    order.OdooSyncedAt = res?.sent_at ?? new Date().toISOString()
    order.OdooSyncError = null
    showToast('success', t('salesOdooResendSuccess', { id: order.ID }))
  } catch (err: any) {
    console.error('Error resending Odoo webhook:', err)
    const message = typeof err?.response?.data === 'string' ? err.response.data.trim() : ''
    order.OdooSyncError = message || t('salesOdooResendError')
    showToast('error', t('salesOdooResendError'))
  } finally {
    resendingOdooOrderID.value = null
  }
}

const filteredOrders = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return orders.value

  return orders.value.filter((order) =>
    [
      String(order.ID),
      order.OrderCode ?? '',
      order.TransactionID ?? '',
      order.CustomerEmail ?? '',
      vendorLicenseId(order),
      ...(order.Entries ?? []).map((e) => itemName(e.Item))
    ].some((field) => field.toLowerCase().includes(q))
  )
})

const totalAmount = computed(() =>
  filteredOrders.value.reduce((sum, order) => sum + orderTotal(order), 0)
)

const totalItems = computed(() =>
  filteredOrders.value.reduce(
    (sum, order) => sum + saleEntries(order).reduce((s, e) => s + e.Quantity, 0),
    0
  )
)

// One CSV row per product, so a sale with several products can be regrouped by its ID
const exportTable = () => {
  if (filteredOrders.value.length === 0) {
    alert('Nothing to export')
    return
  }

  const header = [
    t('salesOrderId'),
    'Order Code',
    t('salesTransaction'),
    t('date'),
    t('salesVendor'),
    t('salesCustomer'),
    t('item'),
    t('salesQuantity'),
    t('salesUnitPrice'),
    t('amount'),
    t('total')
  ]

  const rows = filteredOrders.value.flatMap((order) =>
    saleEntries(order).map((entry) => [
      order.ID,
      order.OrderCode ?? '',
      order.TransactionID ?? '',
      formatDate(saleTime(order)),
      vendorLicenseId(order),
      order.CustomerEmail ?? '',
      itemName(entry.Item),
      entry.Quantity,
      formatCredit(entry.Price),
      formatCredit(entry.Price * entry.Quantity),
      formatCredit(orderTotal(order))
    ])
  )

  exportAsCsv(
    [header, ...rows],
    `sales_extended_${startDate.value.toLocaleDateString()}-${endDate.value.toLocaleDateString()}`
  )
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('salesExtendedTitle')">
        <VueDatePicker
          v-model="date"
          range
          :enable-time-picker="false"
          :placeholder="$t('enterPeriod')"
          class="max-w-md"
          :dark="isDark"
          @range-start="onRangeStart"
          @range-end="onRangeEnd"
        />
        <input
          v-model="searchQuery"
          type="search"
          :placeholder="$t('salesSearchPlaceholder')"
          class="aug-input search-input"
        />
        <Button variant="secondary" :disabled="filteredOrders.length === 0" @click="exportTable">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('export') }}
        </Button>
      </PageHeader>
    </template>

    <template #main>
      <div class="main space-y-4">
        <Toast v-if="toast" :toast="toast" @close="toast = null" />
        <p class="hint">{{ $t('salesExtendedHint') }}</p>

        <div class="stat-grid">
          <Card>
            <div class="stat-label">{{ $t('salesOrderCount') }}</div>
            <div class="stat-value">{{ filteredOrders.length }}</div>
          </Card>
          <Card>
            <div class="stat-label">{{ $t('salesItemCount') }}</div>
            <div class="stat-value">{{ totalItems }}</div>
          </Card>
          <Card>
            <div class="stat-label">{{ $t('total') }}</div>
            <div class="stat-value">{{ formatCredit(totalAmount) }} €</div>
          </Card>
        </div>

        <Card class="table-section">
          <table class="aug-table">
            <thead>
              <tr>
                <th>{{ $t('salesOrderId') }}</th>
                <th>{{ $t('date') }}</th>
                <th>{{ $t('salesVendor') }}</th>
                <th>{{ $t('salesProducts') }}</th>
                <th>{{ $t('salesCustomer') }}</th>
                <th v-if="odooEnabled">Odoo</th>
                <th class="text-right">{{ $t('total') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-if="loading">
                <td :colspan="columnCount" class="entry-empty">…</td>
              </tr>
              <tr v-else-if="filteredOrders.length === 0">
                <td :colspan="columnCount" class="entry-empty">{{ $t('salesNoOrders') }}</td>
              </tr>
              <tr v-for="order in filteredOrders" :key="order.ID">
                <td class="nowrap">
                  <div class="font-semibold">#{{ order.ID }}</div>
                  <div v-if="order.OrderCode" class="muted mono">{{ order.OrderCode }}</div>
                  <div
                    v-if="order.TransactionID"
                    class="muted mono"
                    :title="$t('salesTransaction')"
                  >
                    {{ order.TransactionID }}
                  </div>
                </td>
                <td class="nowrap">{{ formatDate(saleTime(order)) }}</td>
                <td class="nowrap">{{ vendorLicenseId(order) }}</td>
                <td>
                  <table class="entry-table">
                    <tr v-for="entry in saleEntries(order)" :key="entry.ID">
                      <td class="qty">{{ entry.Quantity }}×</td>
                      <td>{{ itemName(entry.Item) }}</td>
                      <td class="text-right muted nowrap">à {{ formatCredit(entry.Price) }} €</td>
                      <td class="text-right nowrap">
                        {{ formatCredit(entry.Price * entry.Quantity) }} €
                      </td>
                    </tr>
                    <tr v-if="otherEntries(order).length" class="muted">
                      <td colspan="4" class="booking-heading">{{ $t('salesBookings') }}</td>
                    </tr>
                    <tr v-for="entry in otherEntries(order)" :key="entry.ID" class="muted">
                      <td class="qty">{{ entry.Quantity }}×</td>
                      <td>
                        {{ itemName(entry.Item) }}
                        <span class="nowrap"
                          >({{ entry.SenderName }} → {{ entry.ReceiverName }})</span
                        >
                      </td>
                      <td class="text-right nowrap">à {{ formatCredit(entry.Price) }} €</td>
                      <td class="text-right nowrap">
                        {{ formatCredit(entry.Price * entry.Quantity) }} €
                      </td>
                    </tr>
                  </table>
                </td>
                <td>
                  <div>{{ order.CustomerEmail || '—' }}</div>
                  <Button
                    v-if="canResendMail(order)"
                    variant="ghost"
                    class="resend-btn"
                    :disabled="resendingOrderID === order.ID"
                    :title="$t('salesResendMailHint')"
                    @click="resendMail(order)"
                  >
                    <font-awesome-icon :icon="faEnvelope" /> {{ $t('salesResendMail') }}
                  </Button>
                </td>
                <td v-if="odooEnabled" class="nowrap">
                  <Badge :variant="odooBadge[odooStatus(order)]" :title="odooTitle(order)">
                    {{ $t(odooLabel[odooStatus(order)]) }}
                  </Badge>
                  <div v-if="odooStatus(order) === 'synced'" class="muted">
                    {{ formatDate(order.OdooSyncedAt) }}
                  </div>
                  <Button
                    v-else
                    variant="ghost"
                    class="resend-btn"
                    :disabled="resendingOdooOrderID === order.ID"
                    @click="resendOdoo(order)"
                  >
                    <font-awesome-icon
                      :icon="faRotateRight"
                      :spin="resendingOdooOrderID === order.ID"
                    />
                    {{
                      resendingOdooOrderID === order.ID
                        ? $t('salesOdooResending')
                        : $t('salesOdooResend')
                    }}
                  </Button>
                </td>
                <td class="text-right font-semibold nowrap">
                  {{ formatCredit(orderTotal(order)) }} €
                </td>
              </tr>
              <tr v-if="filteredOrders.length > 0" class="totals-row">
                <td class="font-bold" :colspan="columnCount - 1">
                  {{ $t('total') }} ({{ filteredOrders.length }})
                </td>
                <td class="text-right font-bold nowrap">{{ formatCredit(totalAmount) }} €</td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
    </template>
  </component>
</template>

<style scoped>
.hint {
  color: var(--color-text-muted);
  font-size: 13px;
}
.search-input {
  width: auto;
  min-width: 240px;
}
.stat-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
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
.table-section {
  overflow-x: auto;
}
.entry-table {
  width: 100%;
  border-collapse: collapse;
}
.entry-table td {
  padding: 2px 8px 2px 0;
  border: none;
  vertical-align: top;
}
.booking-heading {
  padding-top: 6px !important;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  font-size: 10px;
}
.qty {
  width: 1%;
  white-space: nowrap;
  font-weight: 600;
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
.resend-btn {
  margin-top: 4px;
  padding: 2px 8px;
  font-size: 12px;
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
    grid-template-columns: 1fr;
  }
}
</style>
