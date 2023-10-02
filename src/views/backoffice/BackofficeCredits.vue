<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">Offene Beträge</h1>
      <span>
        <input
          id="searchInput"
          type="text"
          placeholder="Suche Ausweisnummer"
          v-model="searchQuery"
          class="border-2 border-gray-400 rounded-md p-2 ml-2"
        />
        <button class="p-3 rounded-full bg-lime-600 text-white">Suchen</button>
      </span>
    </template>

    <template #main>
      <div class="main" v-if="vendors">
        <div class="w-full mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-center text-2xl space-y-3 space-x-3 page-content space-x-2 mt-5">
            <div className="table-auto border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">Ausweisnummer</th>
                  <th className="p-3">Betrag</th>
                  <th className="p-3">Zuletzt beglichen</th>
                  <th className="p-3">Aktion</th>
                </tr>
              </thead>
              <tbody className="text-sm  p-3">
                <tr v-for="(vendor, id) in displayVendors" :key="id">
                  <td className="border-t-2 p-3">
                    {{ vendor?.LicenseID }}
                  </td>
                  <td className="border-t-2 p-3">{{ formatCredit(vendor.Balance) }} €</td>
                  <td className="border-t-2 p-3">{{ vendor.LastPayout }}</td>
                  <router-link :to="`/backoffice/credits/payout/${vendor.ID}`" v-if="vendor?.ID">
                    <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                  </router-link>
                </tr>
              </tbody>
            </div>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { vendorsStore } from '@/stores/vendor'
import { computed, onMounted, ref, watch } from 'vue'

const store = vendorsStore()

// Fetch the vendors' data when the component is mounted
onMounted(() => {
  store.getVendors()
})
function formatCredit(credit: number) {
  return (credit / 100).toFixed(2)
}
const vendors = computed(() => store.vendors)
// create a search function for the search input
const searchQuery = ref('')
watch(searchQuery, () => {
  search()
})
const search = () => {
  if (searchQuery.value) {
    store.searchVendors(searchQuery.value)
  } else {
    store.getVendors()
  }
}
const displayVendors = computed(() => {
  return searchQuery.value ? store.filteredVendors : vendors.value
})
</script>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
