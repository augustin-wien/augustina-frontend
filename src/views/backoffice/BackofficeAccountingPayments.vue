<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">Umsätze</h1>
      <span>
        <VueDatePicker v-model="date" range :enable-time-picker="false" placeholder="Zeitraum wählen"
          @range-start="onRangeStart" @range-end="onRangeEnd" class="max-w-md" />
      </span>
    </template>
    <template #main>
      <div class="main">
        <div class="w-full mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className=" space-y-3 space-x-3">
            <h1 class="text-2xl font-bold">Umsätze im gewählten Zeitraum</h1>

            <table className="table-auto w-full border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">Datum</th>
                  <th className="p-3">Von</th>
                  <th className="p-3">An</th>
                  <th className="p-3">Betrag</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr v-for="(payment, id) in payments" :key="id">
                  <td className="border-t-2 p-3">{{ formatTime(payment.Timestamp) }}</td>
                  <td className="border-t-2 p-3">{{ translateSender(payment.SenderName) }}</td>
                  <td className="border-t-2 p-3">{{ translateReceiver(payment.ReceiverName) }}{{ payment.AuthorizedBy ?
                    'durch ' + payment.AuthorizedBy : '' }}</td>
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
import { ref, computed, onMounted, watch} from 'vue'
import { usePaymentStore } from '@/stores/paymentdata'
import { useKeycloakStore } from '@/stores/keycloak';

const keycloakStore = useKeycloakStore()


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
const store = usePaymentStore()

//fetch paymentlist data once component is mounted

const onRangeStart = (value: any) => {
  startDate.value = value // Update the startDate variable
  store.getPayments(startDate.value, endDate.value)
}

const onRangeEnd = (value: any) => {
  endDate.value = value // Update the endDate variable
  store.getPayments(startDate.value, endDate.value)
}

const formatAmount = (amount: number) => {
  return (amount / 100).toFixed(2)
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
  return receiver == "Cash" ? "Barkasse" : receiver
}
const translateSender = (receiver: string) => {
  return receiver == "Orga" ? "Augustin" : receiver
}
const authenticated = computed(() => keycloakStore.authenticated)
onMounted(() => {
  if (authenticated.value) {
    store.getPayments(startDate.value, endDate.value)
  } else {
    watch(authenticated, () => {
      store.getPayments(startDate.value, endDate.value)
    })
  }
})
</script>

<style>
tr {
  padding: 10px;
}

td {
  padding: 10px;
}
</style>
