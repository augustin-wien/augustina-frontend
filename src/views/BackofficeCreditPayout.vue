<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3" v-if="vendor">
          <h1>Auszahlung</h1>

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
              <button className="p-3 m-3 rounded-full bg-lime-600 text-white">Bestätigen</button>
            </div>
            <div className="row mx-3">
              <div className="col text-lg underline">Individuellen Betrag</div>
              <div className="col">
                <p>Auszuzahlender Betrag: {{ amount }} Euro</p>
                <input
                  className="text-center border"
                  v-model="amount"
                  type="number"
                  placeholder="5"
                />
                <button className="p-3 m-3 rounded-full bg-lime-600 text-white">Bestätigen</button>
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
const vendors = computed(() => store.vendors)

const route = useRoute()
const idparams = route.params.ID

const vendor = computed(() => {
  const numericIdParams = Number(idparams) // Convert the string to a number or NaN
  if (!isNaN(numericIdParams)) {
    return vendors.value.find((vendor) => vendor.ID === numericIdParams)
  } else {
    return null
  }
})
console.log(idparams)
const amount = ref('')
</script>
