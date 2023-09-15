<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3" v-if="vendor">
          <h1>
            <strong><u>Auszahlung</u></strong>
          </h1>

          <div>
            Für <strong>{{ vendor.LicenseID }}</strong
            >, <strong>{{ vendor.FirstName }}</strong> <strong>{{ vendor.LastName }}</strong
            >:
          </div>

          <div className="container">
            <div className="row mx-3">
              <div className="col text-lg underline">Gesamtbetrag</div>
              <br />
              <div className="col text-md">{{ vendor.Balance }} Euro</div>
              <input
                type="submit"
                value="Bestätigen"
                className="p-3 m-3 rounded-full bg-lime-600 text-white"
              />
            </div>
            <div className="row mx-3">
              <div className="col text-lg underline">Individuellen Betrag</div>
              <br />
              <div className="col">
                <p className="text-lg">
                  Auszuzahlender Betrag: <strong> {{ amount }} Euro</strong>
                </p>
                <input
                  className="text-center border w-20"
                  v-model="amount"
                  type="number"
                  placeholder="5"
                  :max="vendor ? vendor.Balance : ''"
                />
                <input
                  type="submit"
                  value="Bestätigen"
                  className="p-3 m-3 rounded-full bg-lime-600 text-white"
                />
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </component>
</template>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>

<script lang="ts" setup>
import { vendorsStore } from '../stores/vendor'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

const store = vendorsStore()

store.getVendors()

// Compute a reactive property for vendors
const vendors = computed(() => store.vendors)

// Get the current route
const route = useRoute()
const idparams = route.params.ID

// Compute the 'vendor' property based on the 'ID' parameter
const vendor = computed(() => {
  const numericIdParams = Number(idparams) // Convert the string to a number or NaN
  if (!isNaN(numericIdParams)) {
    // Find the vendor in the 'vendors' array that matches the 'ID' parameter
    return vendors.value.find((vendor) => vendor.ID === numericIdParams)
  } else {
    // Return null if the 'ID' parameter is not a valid number
    return null
  }
})

// Initialize a reactive property 'amount' for input data
const amount = ref('')

// Log the 'idparams' for debugging purposes
console.log(idparams)
</script>
