<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t('menuPayouts') }}</h1>
    </template>

    <template #main>
      <div class="main">
        <div
          class="w-full max-w-md mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
        >
          <div className="text-center text-2xl space-y-3 space-x-3" v-if="vendor">
            <div class="flex place-content-center justify-between">
              <h1 class="text-2xl font-bold"></h1>
              <button
                @click="router.push('/backoffice/credits')"
                class="px-2 rounded-full bg-red-600 text-white font-bold"
              >
                X
              </button>
            </div>
            <div>
              <strong>{{ vendor.LicenseID }}</strong>
              <br />
              {{ `${vendor.FirstName} ${vendor.LastName}` }}
            </div>

            <div className="container">
              <div className="mx-3">
                <div className="col text-lg underline">{{ $t('menuCredits') }}</div>
                <div className="col text-md">{{ formatCredit(vendor.Balance) }} Euro</div>
              </div>
              <div v-if="vendor.Balance > 0">
                <div>{{ $t('payout') }}:</div>
                <div
                  v-for="payment in paymentsForPayout"
                  :key="payment.ID"
                  className="grid grid-cols-3"
                >
                  <div className="text-xs">{{ formatDate(payment.Timestamp) }}</div>
                  <div className="text-xs" v-if="items.length > 0">
                    {{ getItemName(payment.Item) }}
                  </div>
                  <div className="text-xs">{{ formatReceiver(payment) }} Euro</div>
                </div>
              </div>
              <div className="mx-3">
                <div className="col">
                  <button
                    v-if="vendor.Balance > 0"
                    type="submit"
                    value="Bestätigen"
                    className="p-3 m-3 rounded-full bg-lime-600 text-white"
                    :onClick="payoutVendor"
                    :disabled="vendor.Balance === 0"
                  >
                    {{ $t('confirmPayout') }}
                  </button>
                  <button
                    v-else
                    type="submit"
                    value="Bestätigen"
                    className="p-3 m-3 rounded-full bg-lime-600 text-white"
                    disabled
                  >
                    {{ $t('noCredits') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Toast v-if="toast" :toast="toast" />
    </template>
  </component>
</template>

<script lang="ts" setup>
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import { useItemsStore } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import type { Payment } from '@/stores/payments'
import { usePayoutStore } from '@/stores/payout'
import { vendorsStore, type Vendor } from '@/stores/vendor'
import { formatCredit, formatDate } from '@/utils/utils'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
const keycloakStore = useKeycloakStore()

const store = vendorsStore()
const payoutStore = usePayoutStore()
const itemsStore = useItemsStore()

const paymentsForPayout = computed(() => payoutStore.paymentsForPayout)


// Compute a reactive property for vendors
const vendors = computed(() => store.vendors)

// Get the current route
const route = useRoute()
const idparams = route.params.ID
const vendorID = Number(idparams) // Convert the string to a number or NaN
const items = computed(() => itemsStore.itemsBackoffice)
const setVendor = () => {
  if (store.vendors.length === 0) return null
  if (!isNaN(vendorID)) {
    // Find the vendor in the 'vendors' array that matches the 'ID' parameter
    const val = store.vendors.find((vend: Vendor) => {
      return vend.ID === vendorID
    })
    if (!val) {
      // Return null if the 'ID' parameter is not a valid number
      return null
    }
    if (items?.value.length === 0) itemsStore.getItemsBackoffice()
    payoutStore.getPaymentsForPayout(val.LicenseID)
    return val
  } else {
    // Return null if the 'ID' parameter is not a valid number
    return null
  }
}
// Compute the 'vendor' property based on the 'ID' parameter
const vendor = ref<Vendor | null>(setVendor())
watch(vendor, (val: Vendor | null) => {
  if (val) {
    amount.value = val.Balance / 100
    payoutStore.getPaymentsForPayout(val.LicenseID)
  }
})
watch(store.vendors, () => {
  vendor.value = setVendor()
  itemsStore.getItemsBackoffice()
  if (vendor.value) payoutStore.getPaymentsForPayout(vendor.value.LicenseID)
})
// Initialize a reactive property 'amount' for input data
const amount = ref<number>(0.0)
const authenticated = computed(() => keycloakStore.authenticated)

onMounted(() => {
  if (authenticated.value) {
    itemsStore.getItemsBackoffice()
    store.getVendors()
  }
  if (vendor.value) {
    amount.value = vendor.value.Balance / 100
  }
  if (vendors.value.length === 0) {
    if (authenticated.value) {
      store.getVendors().then(() => {
        vendor.value = setVendor()
      })
    } else {
      watch(authenticated, () => {
        store.getVendors().then(() => {
          vendor.value = setVendor()
        })
      })
    }
  }
})
// post the amount with the licenseID to the payout store
const payoutVendor = async () => {
  if (!vendor.value) return
  const data = {
    VendorLicenseID: vendor.value.LicenseID,
    From: null,
    To: null
  }
  payoutStore.postPayout(data).then(() => {
    router.push('/backoffice/credits')
  }).catch((error) => {
    console.log(error)
    showToast('error', error.message + ' ' + error.response.data.error.message)
  })
}
const toast = ref(null)
const showToast = (type: string, message: string) => {
  toast.value = { type, message }
  setTimeout(() => {
    toast.value = null
  }, 5000)
}
const formatReceiver = (payment: Payment) => {
  const amount = formatCredit(payment.Amount)

  if (payment.ReceiverName === vendor.value?.LicenseID) {
    return `+${amount}`
  } else {
    return `-${amount}`
  }
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

<style scoped>
.container {
  flex-direction: column;
}

button:disabled,
button[disabled] {
  border: 1px solid #999999;
  background-color: #cccccc;
  color: #666666;
}
</style>
