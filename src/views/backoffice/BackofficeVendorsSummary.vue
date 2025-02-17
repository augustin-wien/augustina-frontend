<script lang="ts" setup>
// Import necessary dependencies and types
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { ref, computed, onMounted, watch } from 'vue'
import keycloak from '@/keycloak/keycloak'
import { exportAsCsv, formatCredit } from '@/utils/utils'

import { faCreditCard, faArrowAltCircleRight, faQrcode } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import QrCodeGenerator from '@/components/QrCodeGenerator.vue'
import VendorInfo from '@/components/VendorInfo.vue'

// Initialize the vendor store
const store = vendorsStore()

// Fetch the vendors' data when the component is mounted
onMounted(() => {
  if (keycloak.keycloak) {
    if (keycloak.keycloak.authenticated) {
      store.getVendors()
    } else {
      keycloak.keycloak.onAuthSuccess = () => {
        store.getVendors()
      }
    }
  }
})

// Create a computed property for vendors data
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

// Create a computed property to display vendors based on searchQuery
const displayVendors = computed(() => {
  return searchQuery.value ? store.filteredVendors : vendors.value
})

const exportTable = () => {
  if (!displayVendors.value || displayVendors.value.length == 0) {
    alert('Nothing to export')
    return
  }

  const header = ['Ausweisnummer', 'Vorname', 'Nachname', 'Aktuelles Guthaben']

  const data = displayVendors.value.map((vendor: Vendor) => {
    return [
      vendor.LicenseID,
      vendor.FirstName,
      vendor.LastName,
      formatCredit(vendor.Balance) + ' €'
    ]
  })

  const now = new Date()
  exportAsCsv([header, ...data], `vendors_${now.toLocaleDateString()}`)
}

const showQRCode = ref(false)
const showVendorInfo = ref(false)
const selectedVendor = ref<Vendor | null>(null)
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <div class="flex space-between justify-between content-center items-center pt-3">
        <h1 className="font-bold text-2xl">{{ $t('menuVendors') }}</h1>
        <div>
          <span>
            <input
              id="searchInput"
              v-model="searchQuery"
              type="text"
              :placeholder="$t('SearchPlaceholder')"
              class="border-2 border-gray-400 rounded-md p-2 ml-2"
              @keyup.enter="search"
            />
            <button class="py-2 px-4 rounded-full customcolor ml-2 h-[44px]" @click="search">
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
      <div class="main">
        <div class="mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-xl space-y-3 space-x-3 page-content">
            <table className="table-auto w-full border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">{{ $t('IDNumber') }}</th>
                  <th className="p-3">{{ $t('firstName') }}</th>
                  <th className="p-3">{{ $t('lastName') }}</th>
                  <th className="p-3">{{ $t('currentCredit') }}</th>
                  <th className="p-3">{{ $t('measure') }}</th>
                </tr>
              </thead>
              <tbody className="text-sm p-3">
                <tr
                  v-for="vendor in displayVendors"
                  :key="vendor.ID"
                  :class="vendor.IsDisabled ? 'disabled-vendor border-t-2' : 'border-t-2'"
                >
                  <td className="p-3">
                    <router-link :to="`/backoffice/userprofile/${vendor.ID}`">
                      {{ vendor.IsDisabled ? $t('Disabled') + ': ' : '' }}
                      {{ vendor?.LicenseID }}
                    </router-link>
                  </td>
                  <td className="p-3">{{ vendor.FirstName }}</td>
                  <td className="p-3">{{ vendor.LastName }}</td>
                  <td className="p-3">{{ formatCredit(vendor.Balance) }}€</td>

                  <td class="flex justify-center">
                    <button
                      className="p-2 rounded-full h-10 w-10 customcolor mr-2"
                      @click="
                        async () => {
                          await store.getVendor(vendor.ID)
                          showVendorInfo = true
                        }
                      "
                    >
                      <font-awesome-icon :icon="faArrowAltCircleRight" />
                    </button>
                    <router-link
                      v-if="vendor.Balance !== 0"
                      :to="`/backoffice/credits/payout/${vendor.ID}`"
                    >
                      <button className="p-2 rounded-full customcolor mr-2 h-10 w-10">
                        <font-awesome-icon :icon="faCreditCard" />
                      </button>
                    </router-link>
                    <button v-else disabled className="p-2 rounded-full customcolor mr-2 h-10 w-10">
                      <font-awesome-icon :icon="faCreditCard" />
                    </button>
                    <button
                      className="p-2 rounded-full h-10 w-10 customcolor mr-2"
                      @click="
                        () => {
                          showQRCode = true
                          selectedVendor = vendor
                        }
                      "
                    >
                      <font-awesome-icon :icon="faQrcode" />
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <QrCodeGenerator
        v-if="showQRCode"
        :show-q-r-code="showQRCode"
        :vendor="selectedVendor"
        @close="showQRCode = false"
      />
      <VendorInfo
        v-if="showVendorInfo"
        :show-vendorinfo="showVendorInfo"
        :vendor="selectedVendor"
        @close="showVendorInfo = false"
      />
      <footer>
        <router-link to="/backoffice/newvendor">
          <button className="p-3 rounded-full customcolor fixed bottom-10 right-10 h-16 w-16">
            {{ $t('new') }}
          </button>
        </router-link>
      </footer>
    </template>
  </component>
</template>

<style scoped>
tr {
  padding: 10px;
}

td {
  padding: 10px;
}

button:disabled,
button[disabled] {
  border: 1px solid #999999;
  background-color: #cccccc;
  color: #666666;
}

.disabled-vendor {
  background-color: #f8d7da;
}
</style>
