<script lang="ts" setup>
import { vendorsStore } from '@/stores/vendor'
import type { LocationOverview, VendorLocation } from '@/stores/vendor'
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { exportAsCsv } from '@/utils/utils'
import { formatWorkingTimeSummary } from '@/utils/workingTime'
import { faFileCsv, faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import VendorStatusBadge from '@/components/VendorStatusBadge.vue'
import AddressModal from '@/components/AddressModal.vue'

const { t } = useI18n()
const store = vendorsStore()

const loading = ref(false)
const loadFailed = ref(false)

useAuthLoad(async () => {
  loading.value = true
  loadFailed.value = false

  try {
    // The vendor list feeds the vendor picker in the edit dialog
    await Promise.all([store.getAllLocations(), store.getVendors()])
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Loading locations failed:', error)
    loadFailed.value = true
  } finally {
    loading.value = false
  }
})

const searchQuery = ref('')

// The location being edited: null when the dialog is closed, [] for a new one
const editedLocation = ref<VendorLocation[] | null>(null)

const editLocation = (location: LocationOverview) => {
  editedLocation.value = [
    {
      id: location.id,
      name: location.name,
      address: location.address,
      zip: location.zip,
      telephone: location.telephone,
      longitude: location.longitude,
      latitude: location.latitude,
      working_time: location.working_time,
      vendorID: location.vendorID
    }
  ]
}

const saveLocation = async (location: VendorLocation) => {
  try {
    await store.saveLocation(location)
    editedLocation.value = null
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Saving location failed:', error)
    alert(t('locationSaveFailed'))
  }
}

const removeLocation = async (location: LocationOverview) => {
  if (!confirm(t('deleteLocationConfirm', { name: location.name || location.address }))) return

  try {
    await store.removeLocation(location.id)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Deleting location failed:', error)
    alert(t('locationDeleteFailed'))
  }
}

const locations = computed(() => {
  const query = searchQuery.value.trim().toLowerCase()

  if (!query) return store.allLocations

  return store.allLocations.filter((location) =>
    [
      location.vendorLicenseID,
      location.vendorFirstName,
      location.vendorLastName,
      location.name,
      location.address,
      location.zip,
      location.telephone
    ].some((value) => value?.toLowerCase().includes(query))
  )
})

const workingTime = (location: LocationOverview) =>
  formatWorkingTimeSummary(location.working_time, t)

// "ja"/"nein" for a vendor's status, empty for a location without a vendor
const vendorFlag = (location: LocationOverview, flag: boolean) => {
  if (!location.vendorID) return ''

  return flag ? 'ja' : 'nein'
}

const exportTable = () => {
  if (locations.value.length === 0) {
    alert(t('nothingToExport'))
    return
  }

  const header = [
    'Ausweisnummer',
    'Vorname',
    'Nachname',
    'Standort',
    'Adresse',
    'PLZ',
    'Telefon Standort',
    'Telefon Verkäufer:in',
    'Öffnungszeiten',
    'Gesperrt',
    'Deaktiviert',
    'Längengrad',
    'Breitengrad'
  ]

  const rows = locations.value.map((location) => [
    location.vendorLicenseID,
    location.vendorFirstName,
    location.vendorLastName,
    location.name,
    location.address,
    location.zip,
    location.telephone,
    location.vendorTelephone,
    workingTime(location),
    vendorFlag(location, location.vendorIsBlocked),
    vendorFlag(location, location.vendorIsDisabled),
    location.longitude,
    location.latitude
  ])

  exportAsCsv([header, ...rows], `standorte_${new Date().toISOString().split('T')[0]}`)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('menuLocations')">
        <input
          id="locationSearch"
          v-model="searchQuery"
          type="text"
          :placeholder="$t('locationSearchPlaceholder')"
          class="aug-input"
          style="width: auto"
        />
        <Button variant="secondary" @click="exportTable">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('export') }}
        </Button>
        <Button variant="primary" @click="editedLocation = []">
          <font-awesome-icon :icon="faPlus" /> {{ $t('New Location') }}
        </Button>
      </PageHeader>
    </template>

    <template #main>
      <Card class="section">
        <p v-if="loadFailed" class="locations-empty">{{ $t('locationsLoadFailed') }}</p>
        <table v-else class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('IDNumber') }}</th>
              <th>{{ $t('vendorSingular') }}</th>
              <th>{{ $t('location name') }}</th>
              <th>{{ $t('address') }}</th>
              <th>{{ $t('locationTelephone') }}</th>
              <th>{{ $t('workingTime') }}</th>
              <th>{{ $t('measure') }}</th>
            </tr>
          </thead>
          <tbody :aria-busy="loading">
            <template v-if="loading && !locations.length">
              <tr v-for="n in 8" :key="`skeleton-${n}`" aria-hidden="true">
                <td><span class="aug-skeleton" style="width: 50px" /></td>
                <td>
                  <span class="aug-skeleton" :style="{ width: `${80 + ((n * 37) % 50)}px` }" />
                </td>
                <td>
                  <span class="aug-skeleton" :style="{ width: `${70 + ((n * 53) % 60)}px` }" />
                </td>
                <td><span class="aug-skeleton" style="width: 160px" /></td>
                <td><span class="aug-skeleton" style="width: 90px" /></td>
                <td><span class="aug-skeleton" style="width: 140px" /></td>
                <td><span class="aug-skeleton" style="width: 60px" /></td>
              </tr>
            </template>
            <tr v-else-if="!locations.length">
              <td colspan="7" class="locations-empty">{{ $t('noLocations') }}</td>
            </tr>
            <tr
              v-for="location in locations"
              :key="location.id"
              :class="{ 'inactive-vendor': location.vendorIsBlocked || location.vendorIsDisabled }"
            >
              <td>
                <router-link
                  v-if="location.vendorID"
                  :to="`/backoffice/userprofile/${location.vendorID}/update`"
                >
                  {{ location.vendorLicenseID }}
                </router-link>
                <span v-else>–</span>
              </td>
              <td>
                <Badge v-if="!location.vendorID" variant="info">{{ $t('noVendorAssigned') }}</Badge>
                {{ location.vendorFirstName }} {{ location.vendorLastName }}
                <VendorStatusBadge
                  :blocked="location.vendorIsBlocked"
                  :disabled="location.vendorIsDisabled"
                />
              </td>
              <td>{{ location.name }}</td>
              <td>{{ location.address }}, {{ location.zip }}</td>
              <td class="locations-phone">
                <a v-if="location.telephone" :href="`tel:${location.telephone}`">
                  {{ location.telephone }}
                </a>
                <span v-else>–</span>
              </td>
              <td class="locations-working-time">{{ workingTime(location) }}</td>
              <td>
                <div class="locations-actions">
                  <button
                    type="button"
                    class="aug-icon-btn"
                    :aria-label="$t('editLocation')"
                    :title="$t('editLocation')"
                    @click="editLocation(location)"
                  >
                    <font-awesome-icon :icon="faPen" />
                  </button>
                  <button
                    type="button"
                    class="aug-icon-btn aug-icon-btn-danger"
                    :aria-label="$t('delete')"
                    :title="$t('delete')"
                    @click="removeLocation(location)"
                  >
                    <font-awesome-icon :icon="faTrash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
      <AddressModal
        v-if="editedLocation"
        :locations="editedLocation"
        :vendors="store.vendors"
        @close="editedLocation = null"
        @update="saveLocation"
      />
    </template>
  </component>
</template>

<style scoped>
.inactive-vendor {
  background-color: var(--color-danger-bg);
}
.locations-actions {
  display: flex;
  gap: 2px;
}
.locations-phone {
  white-space: nowrap;
}
.locations-working-time {
  font-size: 12px;
  color: var(--color-text-muted);
}
.locations-empty {
  font-size: 13px;
  color: var(--color-text-muted);
}
</style>
