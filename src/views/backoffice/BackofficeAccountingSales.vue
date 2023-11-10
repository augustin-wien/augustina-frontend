<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">Eingang</h1>
      <VueDatePicker
        v-model="date"
        range
        :enable-time-picker="false"
        placeholder="Zeitraum wählen"
        @range-start="onRangeStart"
        @range-end="onRangeEnd"
        class="max-w-md"
      />
    </template>

    <template #main>
      <div class="main">
        <div class="mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-center text-2xl space-y-3 space-x-3 ">
            <table className="table-auto w-full border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">Datum</th>
                  <th className="p-3">An</th>
                  <th className="p-3">Betreff</th>
                  <th className="p-3">Betrag</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr v-for="(payment, id) in payments" :key="id">
                  <td className="border-t-2 p-3">{{ formatTime(payment.Timestamp) }}</td>
                  <td className="border-t-2 p-3">
                    {{ translateSender(payment.ReceiverName) }}
                  </td>
                  <td className="border-t-2 p-3">{{ getItemName(payment.Item) }}</td>
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
const keycloakStore = useKeycloakStore()
const store = usePaymentsStore()
const itemsStore = useItemsStore()
const items = computed(() => itemsStore.items)

const authenticated = computed(() => keycloakStore.authenticated)

onMounted(() => {
  if (authenticated.value) {
    store.getSales(startDate.value, endDate.value)
    itemsStore.getItems()
  } else {
    watch(authenticated, (val: boolean) => {
      if (val) store.getSales(startDate.value, endDate.value)
      itemsStore.getItems()
    })
  }
})

//fetch paymentlist data once component is mounted

const onRangeStart = (value: any) => {
  console.log(value)
  startDate.value = value // Update the startDate variable
  store.getSales(startDate.value, endDate.value)
}

const onRangeEnd = (value: any) => {
  endDate.value = value // Update the endDate variable
  store.getSales(startDate.value, endDate.value)
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

const payments = computed(() => store.payments)
const translateSender = (receiver: string) => {
  return receiver == 'Orga' ? 'Augustin' : receiver
}
const getItemName = (itemID: number) => {
  const item = items.value.find((item) => item.ID === itemID)
  if (item) {
    return item.Name
  } else {
    return 'Unbekannt'
  }
}
</script>