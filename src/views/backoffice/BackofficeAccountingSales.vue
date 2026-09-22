<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { usePreferredDark } from '@vueuse/core'
import { ref, computed } from 'vue'
import { usePaymentsStore } from '@/stores/payments'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useItemsStore } from '@/stores/items'
import { exportAsCsv, formatCredit } from '@/utils/utils'
import { type Payment } from '@/stores/payments'
import { useSettingsStore } from '@/stores/settings'
import { useKeycloakStore } from '@/stores/keycloak'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
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
const store = usePaymentsStore()
const itemsStore = useItemsStore()
const items = computed(() => itemsStore.itemsBackoffice)
const settingsStore = useSettingsStore()
const authenticated = computed(() => useKeycloakStore().authenticated)

useAuthLoad(() => {
  store.getSales(startDate.value, endDate.value)
  itemsStore.getItemsBackoffice()
})

//fetch paymentlist data once component is mounted

const onRangeStart = (value: any) => {
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
  return receiver == 'Orga' ? settingsStore.settings.NewspaperName : receiver
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
      <PageHeader :title="$t('inbox')">
        <VueDatePicker
          v-model="date"
          range
          :enable-time-picker="false"
          :placeholder="$t('enterPeriod')"
          class="max-w-md"
          :dark="isDark"
          @range-start="onRangeStart"
          @range-end="onRangeEnd"
        />
        <Button variant="secondary" @click="exportTable">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('export') }}
        </Button>
      </PageHeader>
    </template>

    <template v-if="authenticated && items.length > 0" #main>
      <Card class="section">
        <table class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('date') }}</th>
              <th>{{ $t('to') }}</th>
              <th>{{ $t('item') }}</th>
              <th>{{ $t('amount') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(payment, id) in payments" :key="id">
              <td>{{ formatTime(payment.Timestamp) }}</td>
              <td>{{ translateSender(payment.ReceiverName) }}</td>
              <td>{{ $t(getItemName(payment.Item)) }}</td>
              <td>{{ formatCredit(payment.Amount) }} €</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </template>
  </component>
</template>
