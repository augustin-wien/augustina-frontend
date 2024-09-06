<script lang="ts" setup>
import { vendorsStore } from '@/stores/vendor'
import { computed, onMounted, ref, watch } from 'vue'
import keycloak from '@/keycloak/keycloak'
import { exportAsCsv, formatCredit } from '@/utils/utils'
import { type Vendor } from '@/stores/vendor'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const store = vendorsStore()

// Fetch the vendors' data when the component is mounted
onMounted(() => {
  document.title = import.meta.env.VITE_PAGE_NAME + ' | Credits'

  if (keycloak.keycloak?.authenticated) {
    store.getVendors()
  } else {
    if (keycloak.keycloak) {
      // Fetch the vendors' data when the component is mounted
      keycloak.keycloak.onAuthSuccess = () => {
        store.getVendors()
      }
    }
  }
})

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

const exportTable = () => {
  if (!displayVendors.value || displayVendors.value.length == 0) {
    alert('Nothing to export')
    return
  }

  const header = ['Ausweis', 'Betrag', 'Letzte Auszahlung']

  const data = displayVendors.value.map((vendor: Vendor) => {
    return [
      vendor?.LicenseID,
      formatCredit(vendor.Balance) + ' €',
      vendor.LastPayout ? formatDate(vendor.LastPayout) : 'nicht ausgezahlt'
    ]
  })

  const now = new Date()

  exportAsCsv([header, ...data], `credits_${now.toLocaleDateString()}`)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <div class="flex space-between justify-between content-center items-center pt-3">
        <h1 className="font-bold text-2xl">{{ $t('openCredits') }}</h1>
        <div>
          <span>
            <input
              id="searchInput"
              v-model="searchQuery"
              type="text"
              :placeholder="$t('IDNumber')"
              class="border-2 border-gray-400 rounded-md p-2 ml-2"
            />
            <button class="py-2 px-4 rounded-full customcolor ml-2 h-[44px]">
              {{ $t('search') }}
            </button>
          </span>
        </div>
        <button class="py-2 px-4 rounded-full customcolor h-[44px] mr-6" @click="exportTable">
          {{ $t('export') }}
        </button>
      </div>
    </template>

    <template #main>
      <div v-if="vendors" class="main">
        <div class="w-full mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-xl space-y-3 page-content space-x-2">
            <table className="table-auto w-full border-spacing-4 border-collapse">
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
                  <router-link v-if="vendor?.ID" :to="`/backoffice/credits/payout/${vendor.ID}`">
                    <button
                      className="p-3 rounded-full customcolor"
                      :disabled="vendor.Balance === 0"
                    >
                      {{ $t('payNow') }}
                    </button>
                  </router-link>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
button:disabled,
button[disabled] {
  border: 1px solid #999999;
  background-color: #cccccc;
  color: #666666;
}

.customcolor {
  background-color: v-bind(settingsStore.settings.Color);
  color: v-bind(settingsStore.settings.FontColor);
}
</style>
