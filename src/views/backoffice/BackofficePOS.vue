<script setup lang="ts">
import { postPOSOrder, fetchPOSOrders } from '@/api/api'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useItemsStore, type Item } from '@/stores/items'
import { useSettingsStore } from '@/stores/settings'
import { vendorsStore } from '@/stores/vendor'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const route = useRoute()
const router = useRouter()
const licenseId = route.params.id as string

const vendorStore = vendorsStore()
const itemsStore = useItemsStore()
const settingsStore = useSettingsStore()

const vendor = computed(() => (vendorStore.vendors ?? []).find((v) => v.LicenseID === licenseId))

const posEnabled = computed(() => settingsStore.settings.POSEnabled)

// qty map: itemId -> quantity
const quantities = ref<Record<number, number>>({})

// POS order history
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
}
const posOrders = ref<POSOrder[]>([])
const historyPage = ref(1)
const historyPageSize = 10

const historyTotalPages = computed(() =>
  Math.max(1, Math.ceil(posOrders.value.length / historyPageSize))
)

const pagedOrders = computed(() => {
  const start = (historyPage.value - 1) * historyPageSize
  return posOrders.value.slice(start, start + historyPageSize)
})

async function loadPOSOrders() {
  try {
    const res = await fetchPOSOrders(licenseId)
    posOrders.value = res.data ?? []
    historyPage.value = 1
  } catch {
    posOrders.value = []
  }
}

useAuthLoad(async () => {
  await Promise.all([
    vendorStore.getVendors(),
    itemsStore.getItemsBackoffice(),
    settingsStore.getSettingsFromApi(),
    loadPOSOrders()
  ])

  // default qty 10 for issues
  for (const item of posItems.value) {
    quantities.value[item.ID] = item.Type === 'issue' ? 10 : 0
  }

  if (vendor.value) {
    await vendorStore.getVendorComments(vendor.value.ID)
  }
})

const posItems = computed(() =>
  itemsStore.itemsBackoffice.filter(
    (i: Item) =>
      !i.Disabled &&
      !i.IsPDFItem &&
      !i.LicenseItem &&
      (i.Type === 'normal_item' || i.Type === 'issue')
  )
)

const total = computed(() =>
  posItems.value.reduce((sum, item) => {
    const qty = quantities.value[item.ID] ?? 0
    return sum + item.Price * qty
  }, 0)
)

const vendorBalance = computed(() => vendor.value?.Balance ?? 0)
const useBalance = ref(true)

const balancePortion = computed(() => {
  if (!useBalance.value || vendorBalance.value <= 0) return 0
  return Math.min(vendorBalance.value, total.value)
})

const cashPortion = computed(() => total.value - balancePortion.value)

function formatCents(cents: number) {
  return (cents / 100).toFixed(2) + ' €'
}

function inc(id: number) {
  quantities.value[id] = (quantities.value[id] ?? 0) + 1
}

function dec(id: number) {
  const current = quantities.value[id] ?? 0
  if (current > 0) quantities.value[id] = current - 1
}

// Sale submission
const submitting = ref(false)
const saleSuccess = ref(false)
const saleError = ref('')

async function completeSale() {
  const entries = posItems.value
    .filter((item) => (quantities.value[item.ID] ?? 0) > 0)
    .map((item) => ({ item: item.ID, quantity: quantities.value[item.ID]! }))

  if (entries.length === 0) return

  submitting.value = true
  saleError.value = ''

  try {
    await postPOSOrder(licenseId, entries, useBalance.value)
    saleSuccess.value = true
    await Promise.all([vendorStore.getVendors(), loadPOSOrders()])
  } catch {
    saleError.value = 'Error completing sale. Please try again.'
  } finally {
    submitting.value = false
  }
}

function newSale() {
  saleSuccess.value = false
  saleError.value = ''

  for (const item of posItems.value) {
    quantities.value[item.ID] = item.Type === 'issue' ? 10 : 0
  }
}

// Comments
const newComment = ref('')
const addingComment = ref(false)

async function addComment() {
  if (!newComment.value.trim() || !vendor.value) return
  addingComment.value = true

  try {
    await vendorStore.createVendorComment({ comment: newComment.value } as any, vendor.value.ID)
    newComment.value = ''
    await vendorStore.getVendorComments(vendor.value.ID)
  } finally {
    addingComment.value = false
  }
}

const commentsOpen = ref(true)

function formatDate(ts: string) {
  const d = new Date(ts)
  return (
    d.toLocaleDateString('de-AT') +
    ' ' +
    d.toLocaleTimeString('de-AT', { hour: '2-digit', minute: '2-digit' })
  )
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('posTitle')" show-back @back="router.back()" />
    </template>

    <template #main>
      <div class="pos-layout">
        <!-- Left column: POS form -->
        <div class="pos-main">
          <div v-if="!posEnabled" class="pos-banner">{{ $t('posDisabled') }}</div>

          <!-- Vendor header -->
          <Card v-if="vendor" class="pos-vendor-card">
            <div>
              <div class="pos-vendor-name">{{ vendor.FirstName }} {{ vendor.LastName }}</div>
              <div class="pos-vendor-license">{{ vendor.LicenseID }}</div>
              <div class="pos-vendor-balance">
                {{ $t('posBalance') }}: <strong>{{ formatCents(vendorBalance) }}</strong>
              </div>
            </div>
            <router-link :to="{ name: 'Update Vendor Profile', params: { ID: vendor.ID } }">
              <Button variant="secondary">{{ $t('editVendor') }}</Button>
            </router-link>
          </Card>

          <!-- Success state -->
          <Card v-if="saleSuccess" class="pos-success">
            <div class="pos-success-title">{{ $t('posSaleConfirmed') }}</div>
            <div class="pos-success-detail">
              <span v-if="balancePortion > 0"
                >{{ formatCents(balancePortion) }} {{ $t('posFromBalance') }} +
              </span>
              <span>{{ formatCents(cashPortion) }} {{ $t('posPayCash') }}</span>
            </div>
            <Button variant="primary" @click="newSale">{{ $t('posNewSale') }}</Button>
          </Card>

          <template v-else>
            <!-- Item grid -->
            <div v-if="posItems.length === 0" class="pos-empty">{{ $t('posNoItems') }}</div>
            <div class="pos-item-grid">
              <div v-for="item in posItems" :key="item.ID" class="pos-item">
                <div>
                  <div class="pos-item-name">{{ item.Name }}</div>
                  <div class="pos-item-price">{{ formatCents(item.Price) }}</div>
                </div>
                <div class="pos-item-stepper">
                  <button type="button" class="aug-icon-btn" @click="dec(item.ID)">−</button>
                  <input
                    type="number"
                    min="0"
                    class="aug-input pos-item-qty"
                    :value="quantities[item.ID] ?? 0"
                    @change="
                      quantities[item.ID] = Math.max(
                        0,
                        parseInt(($event.target as HTMLInputElement).value) || 0
                      )
                    "
                  />
                  <button type="button" class="aug-icon-btn" @click="inc(item.ID)">+</button>
                </div>
              </div>
            </div>

            <!-- Payment split -->
            <Card class="pos-payment">
              <div class="pos-payment-total">
                <span>{{ $t('posTotal') }}</span>
                <span>{{ formatCents(total) }}</span>
              </div>

              <label v-if="vendorBalance > 0" class="pos-balance-toggle">
                <input v-model="useBalance" type="checkbox" />
                <span>{{ $t('posUseBalance') }} ({{ formatCents(vendorBalance) }})</span>
              </label>

              <div v-if="total > 0" class="pos-payment-breakdown">
                <div v-if="balancePortion > 0" class="pos-payment-row">
                  <span>{{ $t('posFromBalance') }}</span>
                  <span>{{ formatCents(balancePortion) }}</span>
                </div>
                <div class="pos-payment-row">
                  <span>{{ $t('posPayCash') }}</span>
                  <span>{{ formatCents(cashPortion) }}</span>
                </div>
                <div v-if="balancePortion > 0" class="pos-payment-row pos-payment-row-muted">
                  <span>{{ $t('posBalanceAfter') }}</span>
                  <span>{{ formatCents(vendorBalance - balancePortion) }}</span>
                </div>
              </div>
            </Card>

            <p v-if="saleError" class="pos-error">{{ saleError }}</p>

            <Button
              variant="primary"
              class="pos-complete-btn"
              :disabled="total === 0 || submitting || !posEnabled"
              @click="completeSale"
            >
              {{ submitting ? '...' : $t('posCompleteSale') }}
            </Button>
          </template>

          <!-- Comments panel -->
          <Card class="pos-comments">
            <button type="button" class="pos-comments-toggle" @click="commentsOpen = !commentsOpen">
              <span
                >{{ $t('vendorComments') }} ({{ (vendorStore.vendorComments ?? []).length }})</span
              >
              <span>{{ commentsOpen ? '▲' : '▼' }}</span>
            </button>
            <div v-if="commentsOpen" class="pos-comments-body">
              <div
                v-for="c in vendorStore.vendorComments ?? []"
                :key="c.id"
                class="pos-comment-row"
              >
                <span class="pos-comment-id">{{ c.id }}</span
                >{{ c.comment }}
              </div>
              <div v-if="!(vendorStore.vendorComments ?? []).length" class="pos-empty">
                {{ $t('noComments') }}
              </div>
              <div class="pos-comment-add">
                <input
                  v-model="newComment"
                  type="text"
                  :placeholder="$t('addComment')"
                  class="aug-input"
                  @keyup.enter="addComment"
                />
                <Button
                  variant="secondary"
                  :disabled="addingComment || !newComment.trim()"
                  @click="addComment"
                >
                  {{ $t('add') }}
                </Button>
              </div>
            </div>
          </Card>
        </div>

        <!-- Right column: purchase history -->
        <div class="pos-history">
          <Card class="pos-history-card">
            <div class="pos-history-header">
              <span>{{ $t('posHistory') }}</span>
              <span v-if="posOrders.length > 0" class="pos-history-count">
                {{ (historyPage - 1) * historyPageSize + 1 }}–{{
                  Math.min(historyPage * historyPageSize, posOrders.length)
                }}
                / {{ posOrders.length }}
              </span>
            </div>
            <div v-if="posOrders.length === 0" class="pos-empty">{{ $t('posNoHistory') }}</div>
            <div v-for="(order, idx) in pagedOrders" :key="idx" class="pos-history-entry">
              <div class="pos-history-entry-top">
                <span class="pos-history-date">{{ formatDate(order.timestamp) }}</span>
                <span class="pos-history-amount">
                  {{ formatCents(order.totalAmount || order.balanceUsed) }}
                </span>
              </div>
              <ul v-if="order.items?.length" class="pos-history-items">
                <li v-for="(item, i) in order.items" :key="i">
                  <span>{{ item.quantity }}× {{ item.itemName || `#${item.itemId}` }}</span>
                  <span class="pos-history-item-amount">{{ formatCents(item.amount) }}</span>
                </li>
              </ul>
              <div class="pos-history-badges">
                <Badge v-if="order.balanceUsed > 0" variant="info">
                  {{ $t('posBalanceUsed') }} {{ formatCents(order.balanceUsed) }}
                </Badge>
                <Badge v-if="order.cashAmount > 0" variant="success">
                  {{ $t('posCash') }} {{ formatCents(order.cashAmount) }}
                </Badge>
                <Badge
                  v-if="!order.balanceUsed && !order.cashAmount && order.totalAmount"
                  variant="success"
                >
                  {{ $t('posCash') }} {{ formatCents(order.totalAmount) }}
                </Badge>
              </div>
            </div>
            <div v-if="historyTotalPages > 1" class="pos-history-pagination">
              <button
                type="button"
                class="aug-icon-btn"
                :disabled="historyPage === 1"
                @click="historyPage--"
              >
                ‹
              </button>
              <span>{{ historyPage }} / {{ historyTotalPages }}</span>
              <button
                type="button"
                class="aug-icon-btn"
                :disabled="historyPage === historyTotalPages"
                @click="historyPage++"
              >
                ›
              </button>
            </div>
          </Card>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.pos-layout {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  padding: 16px;
}
.pos-main {
  flex: 1;
  min-width: 0;
  max-width: 640px;
}
.pos-banner {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-info-bg);
  color: var(--color-info);
  border: 1px solid var(--color-info);
}
.pos-vendor-card {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}
.pos-vendor-name {
  font-size: 16px;
  font-weight: 700;
}
.pos-vendor-license {
  font-size: 13px;
  color: var(--color-text-muted);
}
.pos-vendor-balance {
  margin-top: 4px;
  font-size: 13px;
}
.pos-success {
  text-align: center;
}
.pos-success-title {
  font-size: 19px;
  font-weight: 700;
  color: var(--color-success);
  margin-bottom: 8px;
}
.pos-success-detail {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 16px;
}
.pos-empty {
  font-size: 13px;
  color: var(--color-text-muted);
  font-style: italic;
  margin-bottom: 16px;
}
.pos-item-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 10px;
  margin-bottom: 20px;
}
.pos-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 12px;
}
.pos-item-name {
  font-weight: 600;
  font-size: 14px;
}
.pos-item-price {
  font-size: 12px;
  color: var(--color-text-muted);
}
.pos-item-stepper {
  display: flex;
  align-items: center;
  gap: 6px;
}
.pos-item-qty {
  width: 52px;
  text-align: center;
  font-weight: 600;
  padding: 6px;
}
.pos-payment {
  margin-bottom: 16px;
}
.pos-payment-total {
  display: flex;
  justify-content: space-between;
  font-size: 16px;
  font-weight: 700;
  margin-bottom: 12px;
}
.pos-balance-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  margin-bottom: 12px;
  cursor: pointer;
}
.pos-payment-breakdown {
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 13px;
  color: var(--color-text-muted);
}
.pos-payment-row {
  display: flex;
  justify-content: space-between;
}
.pos-payment-row-muted {
  margin-top: 4px;
  opacity: 0.7;
}
.pos-error {
  margin-bottom: 12px;
  font-size: 13px;
  color: var(--color-danger);
}
.pos-complete-btn {
  width: 100%;
  padding: 14px;
  font-size: 16px;
}
.pos-comments {
  margin-top: 24px;
  padding: 0;
  overflow: hidden;
}
.pos-comments-toggle {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  font-weight: 600;
  background: none;
  border: none;
  cursor: pointer;
}
.pos-comments-body {
  padding: 0 20px 20px;
}
.pos-comment-row {
  border-bottom: 1px solid var(--color-border);
  padding: 8px 0;
  font-size: 13px;
}
.pos-comment-id {
  color: var(--color-text-muted);
  font-size: 11px;
  margin-right: 8px;
}
.pos-comment-add {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
.pos-comment-add .aug-input {
  flex: 1;
}
.pos-history {
  width: 320px;
  flex-shrink: 0;
}
.pos-history-card {
  padding: 0;
}
.pos-history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
  font-weight: 600;
}
.pos-history-count {
  font-size: 11px;
  font-weight: 400;
  color: var(--color-text-muted);
}
.pos-history-entry {
  border-bottom: 1px solid var(--color-border);
  padding: 12px 20px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.pos-history-entry:last-child {
  border-bottom: none;
}
.pos-history-entry-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.pos-history-date {
  font-size: 11px;
  color: var(--color-text-muted);
}
.pos-history-amount {
  font-weight: 700;
  font-size: 13px;
}
.pos-history-items {
  font-size: 13px;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.pos-history-items li {
  display: flex;
  justify-content: space-between;
}
.pos-history-item-amount {
  color: var(--color-text-muted);
}
.pos-history-badges {
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
}
.pos-history-pagination {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 20px;
  border-top: 1px solid var(--color-border);
  font-size: 13px;
  color: var(--color-text-muted);
}
.pos-empty {
  padding: 16px 20px;
}
.pos-history .pos-empty {
  margin-bottom: 0;
}

@media (max-width: 900px) {
  .pos-layout {
    flex-direction: column;
  }
  .pos-main {
    max-width: none;
    width: 100%;
  }
  .pos-history {
    width: 100%;
  }
}
@media (max-width: 480px) {
  .pos-item-grid {
    grid-template-columns: 1fr;
  }
  .pos-vendor-card {
    flex-direction: column;
    align-items: stretch;
    gap: 12px;
  }
}
</style>
