<script lang="ts" setup>
import { useItemsStore } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import { usePaymentsStore, type Payment } from '@/stores/payments'
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { vendorsStore } from '@/stores/vendor'
import { exportAsCsv, formatCredit } from '@/utils/utils'
import { useSettingsStore } from '@/stores/settings'
import { useI18n } from 'vue-i18n'

const { locale } = useI18n()
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
const vendorStore = vendorsStore()
const vendors = computed(() => vendorStore.vendors)

//fetch paymentlist data once component is mounted

const route = useRoute()

const vendorFilter = computed(() => (route.query.vendor ? (route.query.vendor as string) : ''))

const onDateUpdate = (value: Date[]) => {
  if (value && value[0] && value[1]) {
    startDate.value = value[0]
    endDate.value = value[1]
    store.getPayments(startDate.value, endDate.value, vendorFilter.value)
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

const authenticated = computed(() => keycloakStore.authenticated)

onMounted(() => {
  if (authenticated.value) {
    itemsStore.getItemsBackoffice().then(() => {
      store.getPayments(startDate.value, endDate.value, vendorFilter.value)
    })

    // ensure vendors loaded so we can link to profiles
    if (!vendorStore.vendors || vendorStore.vendors.length === 0) {
      vendorStore.getVendors()
    }
  } else {
    watch(authenticated, () => {
      itemsStore.getItemsBackoffice().then(() => {
        store.getPayments(startDate.value, endDate.value, vendorFilter.value)
      })
    })
  }
})

const findVendorIdByLicense = (licenseID: string | undefined | null) => {
  if (!licenseID) return null
  const v = vendors.value.find((x: any) => x.LicenseID === licenseID)
  return v ? v.ID : null
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
      <div class="flex space-between justify-between content-center items-center mt-3">
        <h1 className="font-bold text-2xl">
          {{ $t('bank statement') }}<span v-if="vendorFilter"> - {{ vendorFilter }}</span>
        </h1>
        <div>
          <span>
            <VueDatePicker
              v-model="date"
              range
              :enable-time-picker="false"
              :placeholder="$t('chooseDateRange')"
              class="max-w-md"
              :locale="locale"
              @update:model-value="onDateUpdate"
            />
          </span>
        </div>
        <div class="flex items-center space-x-2">
          <router-link
            v-if="vendorFilter && findVendorIdByLicense(vendorFilter)"
            :to="`/backoffice/userprofile/${findVendorIdByLicense(vendorFilter)}/update`"
          >
            <button class="py-2 px-4 rounded-full customcolor h-[44px]">Profil</button>
          </router-link>

          <button
            class="py-2 px-4 rounded-full customcolor ml-2 h-[44px] mr-6"
            @click="exportTable"
          >
            {{ $t('export') }}
          </button>
        </div>
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
