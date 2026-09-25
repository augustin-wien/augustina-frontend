<script lang="ts" setup>
import { vendorsStore } from '@/stores/vendor'
import { computed, ref, watch } from 'vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { exportAsCsv, formatCredit } from '@/utils/utils'
import { type Vendor } from '@/stores/vendor'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import VendorStatusBadge from '@/components/VendorStatusBadge.vue'

const store = vendorsStore()

useAuthLoad(() => store.getVendors())

const isRecalculating = ref(false)

async function recalculate() {
  isRecalculating.value = true
  await store.recalculateBalances()
  isRecalculating.value = false
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

const exportTable = () => {
  if (!displayVendors.value || displayVendors.value.length == 0) {
    alert('Nothing to export')
    return
  }

  const header = ['Ausweis', 'Betrag', 'Letzte Auszahlung', 'Gesperrt', 'Deaktiviert']

  const data = displayVendors.value.map((vendor: Vendor) => {
    return [
      vendor?.LicenseID,
      formatCredit(vendor.Balance) + ' €',
      vendor.LastPayout ? formatDate(vendor.LastPayout) : 'nicht ausgezahlt',
      vendor.IsBlocked ? 'ja' : 'nein',
      vendor.IsDisabled ? 'ja' : 'nein'
    ]
  })

  const now = new Date()

  exportAsCsv([header, ...data], `credits_${now.toLocaleDateString()}`)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('openCredits')">
        <input
          id="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="$t('IDNumber')"
          class="aug-input"
          style="width: auto"
        />
        <Button variant="secondary" @click="search">{{ $t('search') }}</Button>
        <Button variant="secondary" :disabled="isRecalculating" @click="recalculate">
          {{ isRecalculating ? '…' : $t('recalculateBalances') }}
        </Button>
        <Button variant="secondary" @click="exportTable">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('export') }}
        </Button>
      </PageHeader>
    </template>

    <template #main>
      <Card v-if="vendors" class="section">
        <table class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('IDNumber') }}</th>
              <th>{{ $t('amount') }}</th>
              <th>{{ $t('lastPayout') }}</th>
              <th>{{ $t('measure') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(vendor, id) in displayVendors"
              :key="id"
              :class="{ 'inactive-vendor': vendor.IsBlocked || vendor.IsDisabled }"
            >
              <td>
                {{ vendor?.LicenseID }}
                <VendorStatusBadge
                  :blocked="vendor.IsBlocked"
                  :disabled="vendor.IsDisabled"
                  :note="vendor.BlockedNote"
                />
              </td>
              <td>{{ formatCredit(vendor.Balance) }} €</td>
              <td>{{ vendor.LastPayout ? formatDate(vendor.LastPayout) : '' }}</td>
              <td>
                <router-link v-if="vendor?.ID" :to="`/backoffice/credits/payout/${vendor.ID}`">
                  <Button variant="secondary" :disabled="vendor.Balance === 0">
                    {{ $t('payNow') }}
                  </Button>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </template>
  </component>
</template>

<style scoped>
.inactive-vendor {
  background-color: var(--color-danger-bg);
}
</style>
