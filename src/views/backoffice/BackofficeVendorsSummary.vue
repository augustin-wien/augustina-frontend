<script lang="ts" setup>
// Import necessary dependencies and types
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { ref, computed, watch } from 'vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { exportAsCsv, formatCredit } from '@/utils/utils'

import {
  faCashRegister,
  faCreditCard,
  faArrowAltCircleRight,
  faQrcode,
  faComment,
  faFileCsv,
  faFileInvoice
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import QrCodeGenerator from '@/components/QrCodeGenerator.vue'
import VendorInfo from '@/components/VendorInfo.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

// Initialize the vendor store
const store = vendorsStore()

useAuthLoad(() => store.getVendors())

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

  const header = ['ID', 'Ausweisnummer', 'Vorname', 'Nachname', 'Aktuelles Guthaben']

  const data = displayVendors.value.map((vendor: Vendor) => {
    return [
      vendor.ID,
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
      <PageHeader :title="$t('menuVendors')">
        <input
          id="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="$t('SearchPlaceholder')"
          class="aug-input"
          style="width: auto"
          @keyup.enter="search"
        />
        <Button variant="secondary" @click="search">{{ $t('search') }}</Button>
        <Button variant="secondary" @click="exportTable">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('export') }}
        </Button>
      </PageHeader>
    </template>

    <template #main>
      <Card class="section">
        <table class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('IDNumber') }}</th>
              <th>{{ $t('firstName') }}</th>
              <th>{{ $t('lastName') }}</th>
              <th>{{ $t('currentCredit') }}</th>
              <th>{{ $t('measure') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="vendor in displayVendors"
              :key="vendor.ID"
              :class="{ 'disabled-vendor': vendor.IsDisabled }"
            >
              <td>
                <router-link :to="`/backoffice/userprofile/${vendor.ID}`">
                  {{ vendor.IsDisabled ? $t('Disabled') + ': ' : '' }}
                  {{ vendor?.LicenseID }}
                </router-link>
              </td>
              <td>{{ vendor.FirstName }}</td>
              <td>{{ vendor.LastName }}</td>
              <td>{{ formatCredit(vendor.Balance) }}€</td>
              <td class="entry-actions">
                <button
                  type="button"
                  class="aug-icon-btn"
                  aria-label="Profil ansehen"
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
                  <button type="button" class="aug-icon-btn" aria-label="Guthaben auszahlen">
                    <font-awesome-icon :icon="faCreditCard" />
                  </button>
                </router-link>
                <button
                  v-else
                  type="button"
                  disabled
                  class="aug-icon-btn"
                  aria-label="Guthaben auszahlen"
                >
                  <font-awesome-icon :icon="faCreditCard" />
                </button>
                <button
                  type="button"
                  class="aug-icon-btn"
                  aria-label="QR-Code"
                  @click="
                    () => {
                      showQRCode = true
                      selectedVendor = vendor
                    }
                  "
                >
                  <font-awesome-icon :icon="faQrcode" />
                </button>
                <router-link
                  :to="{ path: '/backoffice/payments', query: { vendor: vendor.LicenseID } }"
                >
                  <button type="button" class="aug-icon-btn" :aria-label="$t('bank statement')">
                    <font-awesome-icon :icon="faFileInvoice" />
                  </button>
                </router-link>
                <router-link :to="`/backoffice/userprofile/${vendor.ID}/comments`">
                  <button type="button" class="aug-icon-btn" aria-label="Kommentare">
                    <font-awesome-icon :icon="faComment" />
                  </button>
                </router-link>
                <router-link :to="`/backoffice/pos/${vendor.LicenseID}`">
                  <button type="button" class="aug-icon-btn" aria-label="Kassa">
                    <font-awesome-icon :icon="faCashRegister" />
                  </button>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
      <QrCodeGenerator
        v-if="showQRCode && selectedVendor"
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
          <button class="p-3 rounded-full customcolor fixed bottom-10 right-10 h-16 w-16">
            {{ $t('new') }}
          </button>
        </router-link>
      </footer>
    </template>
  </component>
</template>

<style scoped>
.entry-actions {
  display: flex;
  gap: 2px;
}
.disabled-vendor {
  background-color: var(--color-danger-bg);
}
</style>
