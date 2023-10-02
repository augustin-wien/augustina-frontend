<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header> <h1 className="font-bold mt-3 pt-3 text-2xl">Umsätze</h1></template>
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className=" space-y-3 space-x-3">
          <p className="text-lg">Zeitraum eingeben:</p>
          <VueDatePicker
            v-model="date"
            range
            :enable-time-picker="false"
            placeholder="Zeitraum wählen"
            @range-start="onRangeStart"
            @range-end="onRangeEnd"
          />
          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th className="p-3">Datum</th>
                <th className="p-3">Betrag</th>
                <th className="p-3">Betreff</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr v-for="(payment, id) in payments" :key="id">
                <td className="border-t-2 p-3">{{ formatTime(payment.Timestamp) }}</td>
                <td className="border-t-2 p-3">{{ formatAmount(payment.Amount) }} €</td>
                <td className="border-t-2 p-3">
                  von {{ payment.Sender }} an {{ payment.Receiver
                  }}{{ payment.AuthorizedBy ? ' durch ' + payment.AuthorizedBy : '' }}
                </td>
              </tr>
            </tbody>
          </div>
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ref, onMounted, computed, watch } from 'vue'
import { usePaymentStore } from '@/stores/paymentdata'
import { useKeycloakStore } from '@/stores/keycloak'

const startDate = ref<Date>(new Date(new Date().setDate(new Date().getDate() - 1)))
const endDate = ref(new Date(new Date().setDate(startDate.value.getDate() + 1)))
const date = ref([startDate.value, endDate.value])

const keycloakStore = useKeycloakStore()
const store = usePaymentStore()

if (keycloakStore.authenticated) {
  store.getPayments(startDate.value.toISOString(), endDate.value.toISOString())
} else {
  watch(keycloakStore.authenticated, (newVal) => {
    store.getPayments(startDate.value.toISOString(), endDate.value.toISOString())
  })
}

//fetch paymentlist data once component is mounted

const onRangeStart = (value: any) => {
  startDate.value = value.toISOString() // Update the startDate variable
  store.getPayments(startDate.value, endDate.value)
}

const onRangeEnd = (value: any) => {
  endDate.value = value.toISOString() // Update the endDate variable
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
</script>

<style>
tr {
  padding: 10px;
}

td {
  padding: 10px;
}
</style>
