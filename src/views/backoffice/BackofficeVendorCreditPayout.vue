<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header> <h1 className="font-bold mt-3 pt-3 text-2xl">Auszahlung</h1></template>

    <template #main>
      <div class="main">
        <div class="w-full max-w-md mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
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
              >, <strong>{{ vendor.FirstName }}</strong> <strong>{{ vendor.LastName }}</strong
              >:
            </div>

            <div className="container">
              <div className="mx-3">
                <div className="col text-lg underline">Guthaben</div>
                <div className="col text-md">{{ formatCredit(vendor.Balance) }} Euro</div>
              </div>
              <div className="mx-3">
                <div className="col">
                  <p className="text-lg">
                    Auszuzahlender Betrag: <strong> {{ formatCredit(amount * 100) }} Euro</strong>
                  </p>
                  <input
                    className="text-center border w-20"
                    v-model="amount"
                    type="number"
                    steps="0.10"
                    placeholder="5"
                    :max="vendor ? vendor.Balance / 100 : ''"
                  />
                  <button
                    type="submit"
                    value="Bestätigen"
                    className="p-3 m-3 rounded-full bg-lime-600 text-white"
                    :onClick="payoutVendor"
                  >
                    Bestätigen
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
import { vendorsStore, type Vendor } from '@/stores/vendor'
import { ref, computed, onMounted, type ComputedRef } from 'vue'
import { useRoute } from 'vue-router'
import { payoutStore } from '@/stores/payout'
import router from '@/router'

const store = vendorsStore()
const storePayout = payoutStore()

store.getVendors()

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

// Initialize a reactive property 'amount' for input data
const amount = ref<number>(0.0)
onMounted(() => {
  if (vendor.value) {
    amount.value = vendor.value.Balance / 100
  }
})
// post the amount with the licenseID to the payout store
const payoutVendor = async () => {
  const data = {
    VendorLicenseID: vendor.value.LicenseID,
    Amount: Number((amount.value * 100).toFixed(0))
  }
  await storePayout.postPayout(data)
  store.getVendor(vendor.value.ID).then((v: Vendor) => {
    console.log(v)
    amount.value = v.Balance / 100
  })
}
function formatCredit(credit: number) {
  return (credit / 100).toFixed(2)
}
</script>