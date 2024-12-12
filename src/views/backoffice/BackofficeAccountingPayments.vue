<script lang="ts" setup>
import { useItemsStore } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import { usePaymentsStore, type Payment } from '@/stores/payments'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, onMounted, ref, watch } from 'vue'
import { exportAsCsv, formatCredit } from '@/utils/utils'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const keycloakStore = useKeycloakStore()
const itemsStore = useItemsStore()
const items = computed(() => itemsStore.itemsBackoffice)

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

//fetch paymentlist data once component is mounted

const onRangeStart = (value: Date) => {
  startDate.value = value // Update the startDate variable
  store.getPayments(startDate.value, endDate.value)
}

const onRangeEnd = (value: Date) => {
  endDate.value = value // Update the endDate variable
  store.getPayments(startDate.value, endDate.value)
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

const authenticated = computed(() => keycloakStore.authenticated)

onMounted(() => {
  if (authenticated.value) {
    itemsStore.getItemsBackoffice().then(() => {
      store.getPayments(startDate.value, endDate.value)
    })
  } else {
    watch(authenticated, () => {
      itemsStore.getItemsBackoffice().then(() => {
        store.getPayments(startDate.value, endDate.value)
      })
    })
  }
})

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
      <div class="flex space-between justify-between content-center items-center mt-3">
        <h1 className="font-bold text-2xl">{{ $t('menuAccounting') }}</h1>
        <div>
          <span>
            <VueDatePicker
              v-model="date"
              range
              :enable-time-picker="false"
              :placeholder="$t('chooseDateRange')"
              class="max-w-md"
              @range-start="onRangeStart"
              @range-end="onRangeEnd"
            />
          </span>
        </div>
        <button class="py-2 px-4 rounded-full customcolor ml-2 h-[44px] mr-6" @click="exportTable">
          {{ $t('export') }}
        </button>
      </div>
    </template>
    <template #main>
      <div class="main">
        <div class="w-full mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className=" space-y-3 space-x-3">
            <h1 class="text-xl font-bold">{{ $t('accountingTitle') }}</h1>
            <table className="table-auto w-full border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">{{ $t('date') }}</th>
                  <th className="p-3">{{ $t('from') }}</th>
                  <th className="p-3">{{ $t('to') }}</th>
                  <th className="p-3">{{ $t('item') }}</th>
                  <th className="p-3">{{ $t('amount') }}</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr v-for="(payment, id) in payments" :key="id">
                  <td className="border-t-2 p-3">{{ formatTime(payment.Timestamp) }}</td>
                  <td className="border-t-2 p-3">
                    {{ translateSender(payment.SenderName) }}
                  </td>
                  <td className="border-t-2 p-3">
                    {{ translateReceiver(payment.ReceiverName)
                    }}{{ payment.AuthorizedBy ? ' durch ' + payment.AuthorizedBy : '' }}
                  </td>
                  <td className="border-t-2 p-3">
                    {{ translateItem(payment) }}
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
