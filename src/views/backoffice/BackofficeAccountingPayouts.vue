<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">Logbuch</h1>
      <p className="text-lg">Zeitraum eingeben:</p>
      <span>
        <VueDatePicker
          v-model="date"
          range
          :enable-time-picker="false"
          placeholder="Zeitraum wählen"
          @range-start="onRangeStart"
          @range-end="onRangeEnd"
          class="max-w-md"
        />
      </span>
    </template>

    <template #main>
      <div class="main">
        <div class="w-full mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-center text-2xl space-y-3 space-x-3">
            <table className="table-auto border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">Datum</th>
                  <th className="p-3">An</th>
                  <th className="p-3">Durch</th>
                  <th className="p-3" v-for="item in items">{{ item.Name }}</th>
                  <th className="p-3">Gesamt</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr v-for="(payment, id) in payments" :key="id">
                  <td className="border-t-2 p-3">{{ formatTime(payment.Timestamp) }}</td>
                  <td className="border-t-2 p-3">
                    {{ translateSender(payment.SenderName) }}
                  </td>
                  <td className="border-t-2 p-3">{{ payment.AuthorizedBy }}</td>
                  <td className="border-t-2 p-3" v-for="item in items">
                    {{ sumItemsForOrder(payment, item.ID) }}
                  </td>
                  <td className="border-t-2 p-3">{{ formatAmount(payment.Amount) }} €</td>
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

const formatAmount = (amount: number) => {
  return (amount / 100).toFixed(2)
}

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('de-DE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

const payments = computed(() => paymentStore.payments)
const translateSender = (receiver: string) => {
  return receiver == 'Orga' ? 'Augustin' : receiver
}
const authenticated = computed(() => keycloakStore.authenticated)
const items = computed(() => itemsStore.items)

onMounted(() => {
  if (authenticated.value) {
    paymentStore.getPayouts(startDate.value, endDate.value)
    itemsStore.getItems()
  } else {
    watch(authenticated, () => {
      paymentStore.getPayouts(startDate.value, endDate.value)
      itemsStore.getItems()
    })
  }
})

const sumItemsForOrder = (payment: any, itemID: number) => {
  let sum = 0
  payment.IsPayoutFor.forEach((payout: Payment) => {
    if (payout.Item === itemID) {
      if (payout.Receiver === payment.Sender) {
        sum += payout.Amount
      } else {
        sum -= payout.Amount
      }
    }
  })
  return `${formatAmount(sum)} €`
}
</script>

<style>
tr {
  padding: 10px;
}

td {
  padding: 10px;
}
</style>
