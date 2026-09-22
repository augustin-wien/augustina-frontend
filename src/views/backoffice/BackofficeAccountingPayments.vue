<script lang="ts" setup>
import { useItemsStore } from '@/stores/items'
import { useOrdersStore } from '@/stores/orders'
import { usePaymentsStore, type Payment } from '@/stores/payments'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePreferredDark } from '@vueuse/core'
import { computed, ref } from 'vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useRoute } from 'vue-router'
import { vendorsStore } from '@/stores/vendor'
import { exportAsCsv, formatCredit } from '@/utils/utils'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from 'vue-i18n'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const { locale } = useI18n()
const isDark = usePreferredDark()
const settingsStore = useSettingsStore()
const ordersStore = useOrdersStore()
const itemsStore = useItemsStore()
const items = computed(() => itemsStore.itemsBackoffice)
const odooEnabled = computed(() => !!settingsStore.settings?.OdooEnabled)

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
const store = usePaymentsStore()
const vendorStore = vendorsStore()
const vendors = computed(() => vendorStore.vendors)

//fetch paymentlist data once component is mounted

const route = useRoute()

const vendorFilter = computed(() => (route.query.vendor ? (route.query.vendor as string) : ''))

const onDateUpdate = (value: Date[]) => {
  if (value && value[0] && value[1]) {
    startDate.value = value[0]
    endDate.value = value[1]
    store.getPayments(startDate.value, endDate.value, `vendor=${vendorFilter.value}`)
  }
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const payments = computed(() => store.payments)

const translateReceiver = (receiver: string) => {
  return receiver == 'Cash' ? 'Barkasse' : receiver
}

const translateSender = (receiver: string) => {
  return receiver == 'Orga' ? settingsStore.settings.NewspaperName : receiver
}

const translateItem = (payment: Payment) => {
  const item = items.value.find((item) => item.ID === payment.Item)

  if (item) {
    return item.Name
  }

  if (payment.IsPayoutFor && payment.IsPayoutFor.length > 0) {
    return 'Auszahlung'
  }

  return ''
}

useAuthLoad(() => {
  itemsStore.getItemsBackoffice().then(() => {
    store.getPayments(startDate.value, endDate.value, `vendor=${vendorFilter.value}`)
  })

  if (!vendorStore.vendors || vendorStore.vendors.length === 0) {
    vendorStore.getVendors()
  }
})

const findVendorIdByLicense = (licenseID: string | undefined | null) => {
  if (!licenseID) return null
  const v = vendors.value.find((x: any) => x.LicenseID === licenseID)
  return v ? v.ID : null
}

const handleResendToOdoo = async (orderID: number) => {
  try {
    await ordersStore.resendOdooWebhook(orderID)
    alert('Transaction resend to Odoo triggered successfully')
  } catch (error: any) {
    console.error('Resend to Odoo failed', error)
    const message = error.response?.data?.error?.message || 'Failed to resend transaction to Odoo'
    alert(message)
  }
}

const exportTable = () => {
  if (!payments.value || payments.value.length == 0) {
    alert('Nothing to export')
    return
  }

  const header = ['Datum', 'Sender', 'Empfänger', 'Artikel', 'Betrag']

  const data = payments.value.map((payment: Payment) => {
    return [
      formatTime(payment.Timestamp),
      translateSender(payment.SenderName),
      translateReceiver(payment.ReceiverName),
      translateItem(payment),
      formatCredit(payment.Amount)
    ]
  })

  exportAsCsv(
    [header, ...data],
    `payments_${startDate.value.toLocaleDateString()}-${endDate.value.toLocaleDateString()}`
  )
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader
        :title="vendorFilter ? `${$t('bank statement')} - ${vendorFilter}` : $t('bank statement')"
      >
        <VueDatePicker
          v-model="date"
          range
          :enable-time-picker="false"
          :placeholder="$t('chooseDateRange')"
          class="max-w-md"
          :locale="locale"
          :dark="isDark"
          @update:model-value="onDateUpdate"
        />
        <router-link
          v-if="vendorFilter && findVendorIdByLicense(vendorFilter)"
          :to="`/backoffice/userprofile/${findVendorIdByLicense(vendorFilter)}/update`"
        >
          <Button variant="secondary">Profil</Button>
        </router-link>
        <Button variant="secondary" @click="exportTable">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('export') }}
        </Button>
      </PageHeader>
    </template>
    <template #main>
      <Card class="section">
        <h2 class="section-title">{{ $t('accountingTitle') }}</h2>
        <table class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('date') }}</th>
              <th>{{ $t('from') }}</th>
              <th>{{ $t('to') }}</th>
              <th>{{ $t('item') }}</th>
              <th>{{ $t('amount') }}</th>
              <th v-if="odooEnabled">Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, id) in payments" :key="id">
              <td>{{ formatTime(payment.Timestamp) }}</td>
              <td>{{ translateSender(payment.SenderName) }}</td>
              <td>
                {{ translateReceiver(payment.ReceiverName)
                }}{{ payment.AuthorizedBy ? ' durch ' + payment.AuthorizedBy : '' }}
              </td>
              <td>{{ translateItem(payment) }}</td>
              <td>{{ formatCredit(payment.Amount) }} €</td>
              <td v-if="odooEnabled && payment.Order">
                <button type="button" class="link-btn" @click="handleResendToOdoo(payment.Order)">
                  Resend to Odoo
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </template>
  </component>
</template>

<style scoped>
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
}
.link-btn {
  border: none;
  background: none;
  padding: 0;
  color: var(--color-accent);
  font-weight: 600;
  cursor: pointer;
}
.link-btn:hover {
  text-decoration: underline;
}
</style>
