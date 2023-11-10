<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t('openCredits') }}</h1>
      <span>
        <input
          id="searchInput"
          type="text"
          :placeholder="$t('IDNumber')"
          v-model="searchQuery"
          class="border-2 border-gray-400 rounded-md p-2 ml-2"
        />
        <button class="p-3 rounded-full bg-lime-600 text-white ml-2">{{ $t('search') }}</button>
      </span>
    </template>

    <template #main>
      <div class="main" v-if="vendors">
        <div class="w-full mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-center text-2xl space-y-3 space-x-3 page-content space-x-2 mt-5">
            <div className="table-auto border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">{{ $t('IDNumber') }}</th>
                  <th className="p-3">{{ $t('amount') }}</th>
                  <th className="p-3">{{ $t('lastPayout') }}</th>
                  <th className="p-3">{{ $t('measure') }}</th>
                </tr>
              </thead>
              <tbody className="text-sm  p-3">
                <tr v-for="(vendor, id) in displayVendors" :key="id">
                  <td className="border-t-2 p-3">
                    {{ vendor?.LicenseID }}
                  </td>
                  <td className="border-t-2 p-3">{{ formatCredit(vendor.Balance) }} €</td>
                  <td className="border-t-2 p-3">{{ formatDate(vendor.LastPayout) }}</td>
                  <router-link :to="`/backoffice/credits/payout/${vendor.ID}`" v-if="vendor?.ID">
                    <button
                      className="p-3 rounded-full bg-lime-600 text-white"
                      :disabled="vendor.Balance === 0"
                    >
                      {{ $t('payNow') }}
                    </button>
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
import keycloak from '@/keycloak/keycloak'

const store = vendorsStore()

// Fetch the vendors' data when the component is mounted
keycloak.keycloak.onAuthSuccess = () => {
  store.getVendors()
}

// Fetch the vendors' data when the component is mounted
onMounted(() => {
  if (keycloak.keycloak.authenticated) {
    store.getVendors()
  }
})
function formatCredit(credit: number) {
  return (credit / 100).toFixed(2)
}
function formatDate(date: string) {
  if (!date || date === '') return ''
  return new Date(date).toLocaleString()
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
<style scoped>
button:disabled,
button[disabled] {
  border: 1px solid #999999;
  background-color: #cccccc;
  color: #666666;
}
</style>
