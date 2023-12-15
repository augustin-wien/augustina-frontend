<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <div class="flex space-between justify-between content-center items-center">
        <div>
          <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t('protocol') }}</h1>
          <p className="text-lg">{{ $t('enterPeriod') }}:</p>
          <span>
            <VueDatePicker
              v-model="date"
              range
              :enable-time-picker="false"
              :placeholder="$t('chooseDateRange')"
              @range-start="onRangeStart"
              @range-end="onRangeEnd"
              class="max-w-md"
            />
          </span>
        </div>
        <button
          class="rounded-full bg-lime-600 ml-2 text-white hover:bg-lime-700 px-4 py-2 h-10 mr-5"
          @click="exportTable"
        >
          {{ $t('export') }}
        </button>
      </div>
    </template>

    <template #main>
      <div class="main">
        <div class="w-full mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-center text-2xl space-y-3 space-x-3">
            <table className="table-auto border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">{{ $t('date') }}</th>
                  <th className="p-3">{{ $t('to') }}</th>
                  <th className="p-3">{{ $t('from') }}</th>
                  <th className="p-3" v-for="item in items" v-bind:key="`th_${item.ID}`">
                    {{ $t(item.Name) }}
                  </th>
                  <th className="p-3">{{ $t('total') }}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr v-for="(payment, id) in payments" :key="id">
                  <td className="border-t-2 p-3">{{ formatTime(payment.Timestamp) }}</td>
                  <td className="border-t-2 p-3">
                    {{ translateSender(payment.SenderName) }}
                  </td>
                  <td className="border-t-2 p-3">{{ payment.AuthorizedBy }}</td>
                  <td
                    className="border-t-2 p-3"
                    v-for="item in items"
                    v-bind:key="`td_${payment.ID}_${item.ID}`"
                  >
                    {{ sumItemsForOrder(payment, item.ID) }} €
                  </td>
                  <td className="border-t-2 p-3">{{ formatCredit(payment.Amount) }} €</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ref, computed, watch, onMounted } from 'vue'
import { usePaymentsStore } from '@/stores/payments'
import { useKeycloakStore } from '@/stores/keycloak'
import { useItemsStore } from '@/stores/items'
import { type Payment } from '@/stores/payments'
import { exportAsCsv, formatCredit } from '@/utils/utils'

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
const paymentStore = usePaymentsStore()
const keycloakStore = useKeycloakStore()
const itemsStore = useItemsStore()

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

const payments = computed(() => paymentStore.payments)
const translateSender = (receiver: string) => {
  return receiver == 'Orga' ? 'Augustin' : receiver
}
const authenticated = computed(() => keycloakStore.authenticated)
const items = computed(() => itemsStore.itemsBackoffice)

onMounted(() => {
  if (authenticated.value) {
    paymentStore.getPayouts(startDate.value, endDate.value)
    itemsStore.getItemsBackoffice()
  } else {
    watch(authenticated, () => {
      paymentStore.getPayouts(startDate.value, endDate.value)
      itemsStore.getItemsBackoffice()
    })
  }
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
  return formatCredit(sum)
}
const exportTable = () => {
  if (!payments.value || payments.value.length == 0) {
    alert('Nothing to export')
    return
  }
  const itemNames = items.value.map((item) => item.Name)
  const header = [
    'Datum',
    'Sender',
    'Empfänger',
    ...itemNames,
    'Gesamt'
  ]
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

  exportAsCsv([header, ...data], `payouts_${startDate.value.toLocaleDateString()}-${endDate.value.toLocaleDateString()}`)
}
</script>
