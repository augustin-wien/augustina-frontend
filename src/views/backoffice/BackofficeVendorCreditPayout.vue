<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">Auszahlung</h1></template
    >

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
              Für <strong>{{ vendor.LicenseID }}</strong
              >, <strong>{{ vendor.FirstName }}</strong>
              <strong>{{ vendor.LastName }}</strong
              >:
            </div>

            <div className="container">
              <div className="mx-3">
                <div className="col text-lg underline">Guthaben</div>
                <div className="col text-md">{{ formatCredit(vendor.Balance) }} Euro</div>
              </div>
              <div>Für folgende Zahlungen auszahlen:</div>
              <div
                v-for="payment in paymentsForPayout"
                :key="payment.ID"
                className="grid grid-cols-3"
              >
                <div className="text-xs">{{ formatDate(payment.Timestamp) }}</div>
                <div className="text-xs">{{ getItemName(payment.Item) }}</div>
                <div className="text-xs">{{ formatReceiver(payment) }} Euro</div>
              </div>
              <div className="mx-3">
                <div className="col">
                  <button
                    type="submit"
                    value="Bestätigen"
                    className="p-3 m-3 rounded-full bg-lime-600 text-white"
                    :onClick="payoutVendor"
                  >
                    Auszahlen
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.container {
  flex-direction: column;
}
</style>

<script lang="ts" setup>
import { useKeycloakStore } from '@/stores/keycloak'
import { vendorsStore, type Vendor } from '@/stores/vendor'
import { ref, computed, onMounted, watch, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { usePayoutStore } from '@/stores/payout'
import { formatDate, formatCredit } from '@/utils/utils'
import { useItemsStore } from '@/stores/items'
import type { Payment } from '@/stores/payments'
import router from '@/router'
const keycloakStore = useKeycloakStore()

const store = vendorsStore()
const payoutStore = usePayoutStore()
const itemsStore = useItemsStore()

const paymentsForPayout = computed(()=>payoutStore.paymentsForPayout)


// Compute a reactive property for vendors
const vendors = computed(() => store.vendors)

// Get the current route
const route = useRoute()
const idparams = route.params.ID

// Compute the 'vendor' property based on the 'ID' parameter
const vendor: ComputedRef<Vendor> = computed(() => {
  const numericIdParams = Number(idparams) // Convert the string to a number or NaN
  if (!isNaN(numericIdParams)) {
    // Find the vendor in the 'vendors' array that matches the 'ID' parameter
    return vendors.value.find((vendor: Vendor) => vendor.ID === numericIdParams)
  } else {
    // Return null if the 'ID' parameter is not a valid number
    return null
  }
})
const items = computed(() => itemsStore.items)
watch(vendor, (val: Vendor) => {
  if (val) {
    amount.value = val.Balance / 100
    console.log(val.LicenseID)
    payoutStore.getPaymentsForPayout(val.LicenseID)
  }
})
// Initialize a reactive property 'amount' for input data
const amount = ref<number>(0.0)
const authenticated = computed(() => keycloakStore.authenticated)

onMounted(() => {
  if (authenticated.value) {
    itemsStore.getItems()
    store.getVendors()
  }
  if (vendor.value) {
    amount.value = vendor.value.Balance / 100
  }
})
// post the amount with the licenseID to the payout store
const payoutVendor = async () => {
  const data = {
    VendorLicenseID: vendor.value.LicenseID,
    From: null,
    To: null
  }
  await payoutStore.postPayout(data)
  store.getVendor(vendor.value.ID).then((v: Vendor) => {
    amount.value = v.Balance / 100
  })
}
const formatReceiver = (payment: Payment) => {
  const amount = formatCredit(payment.Amount)

  if(payment.ReceiverName === vendor.value.LicenseID) {
    return `+${amount}`
  }else {
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
