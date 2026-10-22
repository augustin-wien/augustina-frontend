<script lang="ts" setup>
import { vendorsStore } from '@/stores/vendor'
import { useItemsStore } from '@/stores/items'
import { useSettingsStore } from '@/stores/settings'
import type { Payment } from '@/stores/payments'
import { fetchPayments, openVendorNextcloudFolder } from '@/api/api'
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import {
  faCashRegister,
  faCommentDots,
  faCreditCard,
  faFolderOpen,
  faPen,
  faQrcode,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { formatCredit } from '@/utils/utils'
import { formatWorkingTimeSummary } from '@/utils/workingTime'
import { vendorAccountId } from '@/utils/vendorPayments'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import VendorMapView from '@/components/VendorMapView.vue'
import QrCodeGenerator from '@/components/QrCodeGenerator.vue'
import VendorWarnings from '@/components/VendorWarnings.vue'
import { isSetDate as isSet } from '@/utils/vendorComments'
import { itemDisplayName } from '@/utils/itemName'

const RECENT_TRANSACTIONS = 8
const TRANSACTION_DAYS = 90
const AMOUNT_AS_QUANTITY = ['donation', 'transaction_costs']

const { t } = useI18n()
const vendorStore = vendorsStore()
const itemsStore = useItemsStore()
const settingsStore = useSettingsStore()
const route = useRoute()

const vendorId = computed(() => parseInt(route.params.ID?.toString() ?? ''))

// The store keeps the last opened vendor, so don't show it while another one is loading
const vendor = computed(() =>
  vendorStore.vendor?.ID === vendorId.value ? vendorStore.vendor : null
)

const showQRCode = ref(false)

const nextcloudAvailable = computed(
  () => settingsStore.settings.NextcloudEnabled && settingsStore.settings.NextcloudConfigured
)

const nextcloudOpening = ref(false)
const nextcloudFailed = ref(false)

const openDocuments = async () => {
  if (!vendor.value?.LicenseID || nextcloudOpening.value) return
  // Open the tab right away: browsers block windows opened after an await.
  const tab = window.open('', '_blank')
  nextcloudOpening.value = true
  nextcloudFailed.value = false

  try {
    const res = await openVendorNextcloudFolder(vendor.value.LicenseID)
    if (tab) tab.location.href = res.data.URL
    else window.open(res.data.URL, '_blank', 'noopener')
  } catch {
    tab?.close()
    nextcloudFailed.value = true
  } finally {
    nextcloudOpening.value = false
  }
}

const payments = ref<Payment[]>([])
const paymentsLoading = ref(true)
const paymentsFailed = ref(false)

useAuthLoad(async () => {
  if (!vendorId.value) return

  const v = await vendorStore.getVendor(vendorId.value)
  vendorStore.getVendorLocations(vendorId.value)
  vendorStore.getVendorComments(vendorId.value)
  if (!v?.LicenseID) return

  paymentsLoading.value = true
  paymentsFailed.value = false

  try {
    const from = new Date()
    from.setDate(from.getDate() - TRANSACTION_DAYS)
    const to = new Date()
    to.setDate(to.getDate() + 1)

    const [res] = await Promise.all([
      fetchPayments(from, to, `vendor=${encodeURIComponent(v.LicenseID)}`),
      itemsStore.itemsWithArchived.length ? null : itemsStore.getItemsWithArchived()
    ])

    payments.value = res.data ?? []
  } catch {
    paymentsFailed.value = true
  } finally {
    paymentsLoading.value = false
  }
})

const accountId = computed(() =>
  vendor.value ? vendorAccountId(payments.value, vendor.value.LicenseID) : undefined
)

const recentPayments = computed(() => payments.value.slice(-RECENT_TRANSACTIONS).reverse())

const initials = computed(() =>
  ((vendor.value?.FirstName?.[0] ?? '') + (vendor.value?.LastName?.[0] ?? '')).toUpperCase()
)

const locations = computed(() => (vendor.value ? (vendorStore.vendorLocations ?? []) : []))
const mappedLocations = computed(() => locations.value.filter((l) => l.latitude && l.longitude))

const comments = computed(() =>
  [...(vendor.value ? (vendorStore.vendorComments ?? []) : [])].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
)

function formatDay(date: string | Date | null | undefined) {
  return isSet(date) ? new Date(date as string).toLocaleDateString() : '–'
}

function formatDateTime(date: string | Date | null | undefined) {
  return isSet(date)
    ? new Date(date as string).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
    : '–'
}

function accountName(name: string) {
  if (name === 'Cash') return t('profileCash')
  if (name === 'Orga') return settingsStore.settings.NewspaperName
  return name
}

function paymentLabel(payment: Payment) {
  const item = itemsStore.itemsWithArchived.find((i) => i.ID === payment.Item)
  if (!item) return payment.IsPayoutFor?.length ? t('profilePayoutItem') : '–'

  // Donations and transaction costs book their amount in cents as the quantity
  if (payment.Quantity > 1 && !AMOUNT_AS_QUANTITY.includes(item.Type)) {
    return `${payment.Quantity} × ${itemDisplayName(item, t)}`
  }

  return itemDisplayName(item, t)
}

function isIncoming(payment: Payment) {
  if (accountId.value === undefined) return undefined
  return payment.Receiver === accountId.value
}

function counterparty(payment: Payment) {
  const incoming = isIncoming(payment)

  if (incoming === undefined) {
    return `${accountName(payment.SenderName)} → ${accountName(payment.ReceiverName)}`
  }

  return accountName(incoming ? payment.SenderName : payment.ReceiverName)
}

function signedAmount(payment: Payment) {
  const incoming = isIncoming(payment)
  let sign = ''
  if (incoming !== undefined) sign = incoming ? '+' : '−'
  return `${sign}${formatCredit(Math.abs(payment.Amount))} €`
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader
        :title="`${$t('vendorSingular')} ${vendor?.LicenseID ?? ''}`"
        show-back
        @back="router.push('/backoffice/vendorsummary')"
      />
    </template>

    <template #main>
      <div v-if="!vendor" class="profile" aria-busy="true">
        <Card><span class="aug-skeleton" style="width: 240px; height: 44px" /></Card>
      </div>

      <div v-else class="profile">
        <!-- Who -->
        <Card class="hero">
          <div class="hero-avatar" aria-hidden="true">{{ initials }}</div>
          <div class="hero-main">
            <h2 class="hero-name">{{ vendor.FirstName }} {{ vendor.LastName }}</h2>
            <div class="hero-meta">
              <span class="hero-license">{{ vendor.LicenseID }}</span>
              <Badge v-if="vendor.IsBlocked" variant="danger">{{ $t('vendorBlocked') }}</Badge>
              <Badge v-if="vendor.IsDisabled" variant="neutral">{{ $t('deactivated') }}</Badge>
              <Badge v-if="!vendor.IsBlocked && !vendor.IsDisabled" variant="success">
                {{ $t('active') }}
              </Badge>
            </div>
          </div>
          <div class="hero-actions">
            <router-link :to="`/backoffice/userprofile/${vendor.ID}/update`">
              <Button variant="secondary"
                ><font-awesome-icon :icon="faPen" /> {{ $t('change') }}</Button
              >
            </router-link>
            <router-link :to="`/backoffice/userprofile/${vendor.ID}/comments`">
              <Button variant="secondary">
                <font-awesome-icon :icon="faCommentDots" /> {{ $t('comments') }}
              </Button>
            </router-link>
            <Button variant="secondary" @click="showQRCode = true">
              <font-awesome-icon :icon="faQrcode" /> {{ $t('profileQrCode') }}
            </Button>
            <Button
              v-if="nextcloudAvailable && vendor.LicenseID"
              variant="secondary"
              :disabled="nextcloudOpening"
              @click="openDocuments"
            >
              <font-awesome-icon :icon="faFolderOpen" /> {{ $t('nextcloudDocuments') }}
            </Button>
            <router-link
              v-if="settingsStore.settings.POSEnabled"
              :to="`/backoffice/pos/${vendor.LicenseID}`"
            >
              <Button variant="secondary">
                <font-awesome-icon :icon="faCashRegister" /> {{ $t('posOpenPOS') }}
              </Button>
            </router-link>
          </div>
          <p v-if="nextcloudFailed" class="hero-error">{{ $t('nextcloudOpenFailed') }}</p>
        </Card>

        <!-- Things staff must see first -->
        <div v-if="vendor.IsBlocked" class="alert" role="alert">
          <font-awesome-icon :icon="faTriangleExclamation" />
          <div>
            <div class="alert-title">{{ $t('vendorBlocked') }}</div>
            <div class="alert-text">{{ vendor.BlockedNote || '–' }}</div>
          </div>
        </div>
        <VendorWarnings :comments="comments" :vendor-id="vendor.ID" />

        <div class="columns">
          <div class="column">
            <!-- Money -->
            <Card class="balance">
              <div>
                <div class="card-label">{{ $t('currentCredit') }}</div>
                <div class="balance-amount" :class="{ negative: vendor.Balance < 0 }">
                  {{ formatCredit(vendor.Balance) }} €
                </div>
                <div v-if="vendor.Debt" class="balance-debt">
                  <font-awesome-icon :icon="faTriangleExclamation" />
                  <span>
                    <strong>{{ $t('debt') }}:</strong> {{ vendor.Debt }}
                  </span>
                </div>
              </div>
              <router-link
                v-if="vendor.Balance !== 0"
                :to="`/backoffice/credits/payout/${vendor.ID}`"
              >
                <Button variant="primary">
                  <font-awesome-icon :icon="faCreditCard" /> {{ $t('profilePayout') }}
                </Button>
              </router-link>
              <Button v-else variant="primary" disabled>
                <font-awesome-icon :icon="faCreditCard" /> {{ $t('profilePayout') }}
              </Button>
            </Card>

            <Card>
              <div class="card-head">
                <h3 class="card-title">{{ $t('profileRecentTransactions') }}</h3>
                <router-link
                  :to="{ path: '/backoffice/payments', query: { vendor: vendor.LicenseID } }"
                  class="card-link"
                >
                  {{ $t('profileShowAll') }}
                </router-link>
              </div>
              <div v-if="paymentsLoading" class="tx-list" aria-busy="true">
                <span v-for="n in 4" :key="n" class="aug-skeleton" style="height: 36px" />
              </div>
              <p v-else-if="paymentsFailed" class="empty">{{ $t('profileTransactionsFailed') }}</p>
              <p v-else-if="!recentPayments.length" class="empty">
                {{ $t('profileNoTransactions') }}
              </p>
              <ul v-else class="tx-list">
                <li v-for="p in recentPayments" :key="p.ID" class="tx">
                  <div class="tx-main">
                    <div class="tx-title">{{ paymentLabel(p) }}</div>
                    <div class="tx-sub">
                      {{ formatDateTime(p.Timestamp) }} · {{ counterparty(p) }}
                    </div>
                  </div>
                  <div
                    class="tx-amount"
                    :class="{ in: isIncoming(p) === true, out: isIncoming(p) === false }"
                  >
                    {{ signedAmount(p) }}
                  </div>
                </li>
              </ul>
            </Card>

            <Card>
              <div class="card-head">
                <h3 class="card-title">{{ $t('comments') }}</h3>
                <router-link
                  :to="`/backoffice/userprofile/${vendor.ID}/comments`"
                  class="card-link"
                >
                  {{ $t('profileShowAll') }}
                </router-link>
              </div>
              <ul v-if="comments.length" class="item-list">
                <li
                  v-for="c in comments.slice(0, 5)"
                  :key="c.id"
                  class="item"
                  :class="{ warning: c.warning && !isSet(c.resolved_at) }"
                >
                  <div class="item-sub">
                    {{ formatDay(c.created_at) }}
                    <template v-if="c.warning"> · {{ $t('warning') }}</template>
                    <template v-if="isSet(c.resolved_at)">
                      · {{ $t('Resolved at') }} {{ formatDay(c.resolved_at) }}
                    </template>
                  </div>
                  <div class="item-text">{{ c.comment }}</div>
                </li>
              </ul>
              <p v-else class="empty">{{ $t('noComments') }}</p>
            </Card>
          </div>

          <div class="column">
            <Card>
              <h3 class="card-title">{{ $t('profileActivity') }}</h3>
              <dl class="facts">
                <template v-if="settingsStore.settings.IDScanEnabled">
                  <dt>{{ $t('lastIdScan') }}</dt>
                  <dd>{{ formatDateTime(vendor.LastIDScan) }}</dd>
                </template>
                <dt>{{ $t('lastPayout') }}</dt>
                <dd>{{ formatDay(vendor.LastPayout) }}</dd>
                <dt>{{ $t('lastOnlineSale') }}</dt>
                <dd>{{ formatDay(vendor.LastOnlineSale) }}</dd>
              </dl>
            </Card>

            <Card>
              <h3 class="card-title">{{ $t('profileContact') }}</h3>
              <dl class="facts">
                <dt>E-Mail</dt>
                <dd class="break">{{ vendor.HasOwnEmail ? vendor.Email : '–' }}</dd>
                <dt>{{ $t('telephone') }}</dt>
                <dd>{{ vendor.Telephone || '–' }}</dd>
                <dt>{{ $t('language') }}</dt>
                <dd>{{ vendor.Language || '–' }}</dd>
                <dt>{{ $t('vendorSince') }}</dt>
                <dd>{{ formatDay(vendor.VendorSince) }}</dd>
                <dt>{{ $t('registrationDate') }}</dt>
                <dd>{{ formatDay(vendor.RegistrationDate) }}</dd>
                <dt>Smartphone</dt>
                <dd>{{ $t(vendor.HasSmartphone ? 'yes' : 'no') }}</dd>
                <dt>{{ $t('bankAccount') }}</dt>
                <dd>{{ $t(vendor.HasBankAccount ? 'yes' : 'no') }}</dd>
                <dt>{{ $t('onlineMap') }}</dt>
                <dd>{{ $t(vendor.OnlineMap ? 'yes' : 'no') }}</dd>
                <template v-if="vendor.AccountProofUrl">
                  <dt>{{ $t('verificationLink') }}</dt>
                  <dd class="break">{{ vendor.AccountProofUrl }}</dd>
                </template>
              </dl>
            </Card>

            <Card>
              <h3 class="card-title">{{ $t('locations') }}</h3>
              <div v-if="mappedLocations.length" class="map">
                <VendorMapView :locations="mappedLocations" :enable-search="false" />
              </div>
              <ul v-if="locations.length" class="item-list">
                <li v-for="l in locations" :key="l.id" class="item">
                  <div class="item-title">{{ l.name }}</div>
                  <div v-if="l.market_number" class="item-sub">
                    {{ $t('marketNumber') }}: {{ l.market_number }}
                  </div>
                  <div class="item-sub">{{ l.address }}, {{ l.zip }}</div>
                  <div class="item-sub">{{ formatWorkingTimeSummary(l.working_time, t) }}</div>
                </li>
              </ul>
              <p v-else class="empty">{{ $t('noLocations') }}</p>
            </Card>
          </div>
        </div>
      </div>

      <QrCodeGenerator v-if="showQRCode && vendor" :vendor="vendor" @close="showQRCode = false" />
    </template>
  </component>
</template>

<style scoped>
.profile {
  max-width: 1080px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.hero-avatar {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: var(--color-accent-fg);
  font-weight: 700;
  font-size: 18px;
}
.hero-main {
  flex: 1;
  min-width: 180px;
}
.hero-name {
  font-size: 20px;
  font-weight: 700;
  line-height: 1.2;
}
.hero-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 6px;
}
.hero-license {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
.hero-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.hero-error {
  margin: 8px 0 0;
  font-size: 13.5px;
  color: var(--color-danger);
}

.columns {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(0, 2fr);
  gap: 16px;
  align-items: start;
}
.column {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.card-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 8px;
}
.card-title {
  font-size: 14px;
  font-weight: 700;
  margin-bottom: 12px;
}
.card-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}
.card-link {
  font-size: 13px;
  color: var(--color-text-muted);
  text-decoration: underline;
}
.card-link:hover {
  color: var(--color-text);
}
.empty {
  font-size: 13.5px;
  color: var(--color-text-muted);
}

.balance {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
}
.balance-amount {
  font-size: 32px;
  font-weight: 700;
  line-height: 1.2;
  margin-top: 4px;
  font-variant-numeric: tabular-nums;
}
.balance-amount.negative {
  color: var(--color-danger);
}
.balance-debt {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-top: 8px;
  padding: 6px 10px;
  border: 1px solid var(--color-danger);
  border-radius: var(--radius);
  background: var(--color-danger-bg);
  color: var(--color-danger);
  font-size: 13.5px;
}

.tx-list {
  display: flex;
  flex-direction: column;
}
.tx {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid var(--color-border);
}
.tx:first-child {
  border-top: none;
  padding-top: 0;
}
.tx-main {
  min-width: 0;
}
.tx-title {
  font-size: 13.5px;
  font-weight: 600;
}
.tx-sub {
  font-size: 12px;
  color: var(--color-text-muted);
}
.tx-amount {
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
  font-variant-numeric: tabular-nums;
}
.tx-amount.in {
  color: var(--color-success);
}

.facts {
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 8px 16px;
  font-size: 13.5px;
}
.facts dt {
  color: var(--color-text-muted);
}
.facts dd {
  text-align: right;
}
.break {
  overflow-wrap: anywhere;
}

.map {
  margin-bottom: 12px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  isolation: isolate;
}

.item-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}
.item {
  padding: 10px 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
}
.item.warning {
  border-color: var(--color-danger);
  background: var(--color-danger-bg);
  color: var(--color-danger);
}
.item-title {
  font-size: 13.5px;
  font-weight: 600;
}
.item-sub {
  font-size: 12px;
  color: var(--color-text-muted);
}
.item.warning .item-sub {
  color: inherit;
}
.item-text {
  font-size: 13.5px;
  margin-top: 2px;
  white-space: pre-line;
}

@media (max-width: 900px) {
  .columns {
    grid-template-columns: minmax(0, 1fr);
  }
}
</style>
