<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePreferredDark } from '@vueuse/core'
import { ref, computed } from 'vue'
import { usePaymentsStore } from '@/stores/payments'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useItemsStore } from '@/stores/items'
import { type Payment } from '@/stores/payments'
import { exportAsCsv, formatCredit } from '@/utils/utils'
import { useSettingsStore } from '@/stores/settings'
import { faFileCsv, faPrint } from '@fortawesome/free-solid-svg-icons'
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
const endDate = ref(tomorrow)
const date = ref([startDate.value, endDate.value])
const isDark = usePreferredDark()
const paymentStore = usePaymentsStore()
const itemsStore = useItemsStore()
const settingsStore = useSettingsStore()

//fetch paymentlist data once component is mounted

const onRangeStart = (value: any) => {
  startDate.value = value // Update the startDate variable
  paymentStore.getPayouts(startDate.value, endDate.value)
}

const onRangeEnd = (value: any) => {
  endDate.value = value // Update the endDate variable
  paymentStore.getPayouts(startDate.value, endDate.value)
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
  })
}

const formatDate = (date: Date) => date.toLocaleDateString('de-DE')

const printPage = () => window.print()

const payments = computed(() => paymentStore.payments)

const translateSender = (receiver: string) => {
  return receiver == 'Orga' ? settingsStore.settings.NewspaperName : receiver
}

const items = computed(() => itemsStore.itemsBackoffice)

useAuthLoad(() => {
  paymentStore.getPayouts(startDate.value, endDate.value)
  itemsStore.getItemsBackoffice()
})

const sumItemsForOrder = (payment: any, itemID: number) => {
  let sum = 0

  payment.IsPayoutFor?.forEach((payout: Payment) => {
    if (payout.Item === itemID) {
      if (payout.Receiver === payment.Sender) {
        sum += payout.Amount
      } else {
        sum -= payout.Amount
      }
    }
  })

  return sum
}

const exportTable = () => {
  if (!payments.value || payments.value.length == 0) {
    alert('Nothing to export')
    return
  }

  const itemNames = items.value.map((item) => item.Name)

  const header = ['Datum', 'Sender', 'Empfänger', ...itemNames, 'Gesamt']

  const data = payments.value.map((payment: Payment) => {
    const itemAmounts = items.value.map((item) => sumItemsForOrder(payment, item.ID))
    return [
      formatTime(payment.Timestamp),
      translateSender(payment.SenderName),
      payment.AuthorizedBy,
      ...itemAmounts,
      formatCredit(payment.Amount)
    ]
  })

  exportAsCsv(
    [header, ...data],
    `payouts_${startDate.value.toLocaleDateString()}-${endDate.value.toLocaleDateString()}`
  )
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('protocol')">
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
        <Button variant="secondary" @click="exportTable">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('export') }}
        </Button>
        <Button variant="secondary" @click="printPage">
          <font-awesome-icon :icon="faPrint" /> {{ $t('print') }}
        </Button>
      </PageHeader>
      <p class="print-only print-range">{{ formatDate(startDate) }} – {{ formatDate(endDate) }}</p>
    </template>

    <template #main>
      <Card class="section payouts-print">
        <table class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('date') }}</th>
              <th>{{ $t('to') }}</th>
              <th>{{ $t('from') }}</th>
              <th v-for="item in items" :key="`th_${item.ID}`">
                {{ $t(item.Name) }}
              </th>
              <th>{{ $t('total') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, id) in payments" :key="id">
              <td>{{ formatTime(payment.Timestamp) }}</td>
              <td>{{ translateSender(payment.SenderName) }}</td>
              <td>{{ payment.AuthorizedBy }}</td>
              <td v-for="item in items" :key="`td_${payment.ID}_${item.ID}`">
                {{ formatCredit(sumItemsForOrder(payment, item.ID)) }} €
              </td>
              <td>{{ formatCredit(payment.Amount) }} €</td>
            </tr>
            <tr v-if="payments && payments.length > 0" class="totals-row">
              <td class="font-bold">{{ $t('total') }}</td>
              <td></td>
              <td></td>
              <td v-for="item in items" :key="`td_total_${item.ID}`" class="font-bold">
                {{
                  formatCredit(
                    payments.reduce((acc, payment) => acc + sumItemsForOrder(payment, item.ID), 0)
                  )
                }}
                €
              </td>
              <td class="font-bold">
                {{ formatCredit(payments.reduce((acc, payment) => acc + payment.Amount, 0)) }} €
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </template>
  </component>
</template>

<style scoped>
.totals-row td {
  border-top: 2px solid var(--color-border);
}
.print-range {
  margin-top: 4px;
  font-size: 13px;
}
@media print {
  .payouts-print {
    border: none;
    padding: 0;
  }
  .payouts-print .aug-table {
    font-size: 11px;
  }
}
</style>

<style>
/* One column per item makes the table wide - print on the landscape named page. The page name sits
   on the container holding both the header (title + date range) and the table: setting it on the
   table alone forces a page break at the name change, leaving the title alone on page 1. */
@media print {
  .main-container:has(.payouts-print) {
    page: payouts-landscape;
  }
}
@page payouts-landscape {
  size: A4 landscape;
  margin: 12mm;
}
</style>
