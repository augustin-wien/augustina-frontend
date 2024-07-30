<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ref, computed, watch, onMounted } from 'vue'
import { usePaymentsStore } from '@/stores/payments'
import { useKeycloakStore } from '@/stores/keycloak'
import { useItemsStore } from '@/stores/items'
import { exportAsCsv, formatCredit } from '@/utils/utils'
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
const keycloakStore = useKeycloakStore()
const store = usePaymentsStore()
const itemsStore = useItemsStore()
const items = computed(() => itemsStore.itemsBackoffice)

const authenticated = computed(() => keycloakStore.authenticated)

onMounted(() => {
  if (authenticated.value) {
    store.getSales(startDate.value, endDate.value)
    itemsStore.getItemsBackoffice()
  } else {
    watch(authenticated, (val: boolean) => {
      if (val) store.getSales(startDate.value, endDate.value)
      itemsStore.getItemsBackoffice()
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

const formatTime = (time: string) => {
  const date = new Date(time)
  return date.toLocaleDateString('de-DE', {
    hour: '2-digit',
    minute: '2-digit'
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

const exportTable = () => {
  if (!payments.value || payments.value.length == 0) {
    alert('Nothing to export')
    return
  }

  const header = ['Datum', 'An', 'Artikel', 'Betrag']

  const data = payments.value.map((payment: Payment) => {
    return [
      formatTime(payment.Timestamp),
      translateSender(payment.ReceiverName),
      getItemName(payment.Item),
      formatCredit(payment.Amount)
    ]
  })

  exportAsCsv(
    [header, ...data],
    `sales_${startDate.value.toLocaleDateString()}-${endDate.value.toLocaleDateString()}`
  )
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <div class="flex space-between mt-3 justify-between content-center items-center">
        <h1 className="font-bold text-2xl">{{ $t('inbox') }}</h1>
        <div>
          <VueDatePicker
            v-model="date"
            range
            :enable-time-picker="false"
            :placeholder="$t('enterPeriod')"
            class="max-w-md"
            @range-start="onRangeStart"
            @range-end="onRangeEnd"
          />
        </div>
        <button
          class="rounded-full bg-lime-600 ml-2 text-white hover:bg-lime-700 px-4 py-2 h-10 mr-5"
          @click="exportTable"
        >
          {{ $t('export') }}
        </button>
      </div>
    </template>

    <template v-if="authenticated && items.length > 0" #main>
      <div class="main">
        <div class="mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-xl space-y-3 space-x-3 ">
            <table className="table-auto w-full border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">{{ $t('date') }}</th>
                  <th className="p-3">{{ $t('to') }}</th>
                  <th className="p-3">{{ $t('item') }}</th>
                  <th className="p-3">{{ $t('amount') }}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr v-for="(payment, id) in payments" :key="id">
                  <td className="border-t-2 p-3">{{ formatTime(payment.Timestamp) }}</td>
                  <td className="border-t-2 p-3">
                    {{ translateSender(payment.ReceiverName) }}
                  </td>
                  <td className="border-t-2 p-3">{{ $t(getItemName(payment.Item)) }}</td>
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
