<script lang="ts" setup>
// Import necessary dependencies and types
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { useSettingsStore } from '@/stores/settings'
import { ref, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { exportAsCsv, formatCredit } from '@/utils/utils'
import { downloadAllQrCodes } from '@/utils/qrCode'

import {
  faCashRegister,
  faCreditCard,
  faArrowAltCircleRight,
  faQrcode,
  faComment,
  faFileCsv,
  faFileInvoice,
  faFileZipper
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import QrCodeGenerator from '@/components/QrCodeGenerator.vue'
import VendorInfo from '@/components/VendorInfo.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import VendorStatusBadge from '@/components/VendorStatusBadge.vue'

const { t } = useI18n()

// Initialize the vendor store
const store = vendorsStore()
const settingsStore = useSettingsStore()
const posEnabled = computed(() => settingsStore.settings.POSEnabled)

// The vendor list can take a while to load, so show placeholder rows in the meantime
const loading = ref(false)

const loadVendors = async () => {
  loading.value = true

  try {
    await store.getVendors()
  } finally {
    loading.value = false
  }
}

useAuthLoad(loadVendors)

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
    loadVendors()
  }
}

// Create a computed property to display vendors based on searchQuery
const displayVendors = computed(() => {
  return searchQuery.value ? store.filteredVendors : vendors.value
})

// Date of the vendor's first online sale, '–' if they never sold online
const formatOnlineSale = (date: string | null | undefined) =>
  date ? new Date(date).toLocaleDateString() : '–'

const exportTable = () => {
  if (!displayVendors.value || displayVendors.value.length == 0) {
    alert('Nothing to export')
    return
  }

  const header = [
    'ID',
    'Ausweisnummer',
    'Vorname',
    'Nachname',
    'Aktuelles Guthaben',
    'Gesperrt',
    'Sperrvermerk',
    'Deaktiviert',
    'Erster Onlineverkauf'
  ]

  const data = displayVendors.value.map((vendor: Vendor) => {
    return [
      vendor.ID,
      vendor.LicenseID,
      vendor.FirstName,
      vendor.LastName,
      formatCredit(vendor.Balance) + ' €',
      vendor.IsBlocked ? 'ja' : 'nein',
      vendor.IsBlocked ? vendor.BlockedNote : '',
      vendor.IsDisabled ? 'ja' : 'nein',
      formatOnlineSale(vendor.FirstOnlineSale)
    ]
  })

  const now = new Date()
  exportAsCsv([header, ...data], `vendors_${now.toLocaleDateString()}`)
}

// Number of QR codes rendered so far while the zip is being built, null when idle
const qrDownloadProgress = ref<number | null>(null)

const downloadQrCodes = async () => {
  // Deactivated vendors don't sell any more, so they don't need a QR code
  const list = (displayVendors.value ?? []).filter((vendor) => !vendor.IsDisabled)

  if (list.length === 0 || qrDownloadProgress.value !== null) return

  qrDownloadProgress.value = 0

  try {
    await downloadAllQrCodes(list, settingsStore.settings, (done) => {
      qrDownloadProgress.value = done
    })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Downloading QR codes failed:', error)
    alert(t('qrCodesDownloadFailed'))
  } finally {
    qrDownloadProgress.value = null
  }
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
        <Button
          variant="secondary"
          :disabled="qrDownloadProgress !== null || !displayVendors?.length"
          @click="downloadQrCodes"
        >
          <font-awesome-icon :icon="faFileZipper" />
          <template v-if="qrDownloadProgress !== null">
            {{ $t('qrCodesDownloading') }} {{ qrDownloadProgress }}/{{ displayVendors?.length }}
          </template>
          <template v-else>{{ $t('allQrCodes') }}</template>
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
              <th>{{ $t('firstOnlineSale') }}</th>
              <th>{{ $t('measure') }}</th>
            </tr>
          </thead>
          <tbody :aria-busy="loading">
            <template v-if="loading && !displayVendors?.length">
              <tr v-for="n in 8" :key="`skeleton-${n}`" aria-hidden="true">
                <td><span class="aug-skeleton" style="width: 60px" /></td>
                <td>
                  <span class="aug-skeleton" :style="{ width: `${60 + ((n * 37) % 50)}px` }" />
                </td>
                <td>
                  <span class="aug-skeleton" :style="{ width: `${70 + ((n * 53) % 60)}px` }" />
                </td>
                <td><span class="aug-skeleton" style="width: 50px" /></td>
                <td><span class="aug-skeleton" style="width: 70px" /></td>
                <td><span class="aug-skeleton" style="width: 180px" /></td>
              </tr>
            </template>
            <tr
              v-for="vendor in displayVendors"
              :key="vendor.ID"
              :class="{ 'disabled-vendor': vendor.IsDisabled || vendor.IsBlocked }"
            >
              <td>
                <router-link :to="`/backoffice/userprofile/${vendor.ID}`">
                  {{ vendor?.LicenseID }}
                </router-link>
                <VendorStatusBadge
                  :blocked="vendor.IsBlocked"
                  :disabled="vendor.IsDisabled"
                  :note="vendor.BlockedNote"
                />
              </td>
              <td>{{ vendor.FirstName }}</td>
              <td>{{ vendor.LastName }}</td>
              <td>{{ formatCredit(vendor.Balance) }}€</td>
              <td>{{ formatOnlineSale(vendor.FirstOnlineSale) }}</td>
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
                <template v-if="posEnabled">
                  <button
                    v-if="vendor.IsBlocked || vendor.IsDisabled"
                    type="button"
                    disabled
                    class="aug-icon-btn"
                    aria-label="Kassa"
                  >
                    <font-awesome-icon :icon="faCashRegister" />
                  </button>
                  <router-link v-else :to="`/backoffice/pos/${vendor.LicenseID}`">
                    <button type="button" class="aug-icon-btn" aria-label="Kassa">
                      <font-awesome-icon :icon="faCashRegister" />
                    </button>
                  </router-link>
                </template>
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
