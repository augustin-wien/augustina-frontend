<script lang="ts" setup>
import { vendorsStore } from '@/stores/vendor'
import { computed, ref, watch } from 'vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { exportAsCsv, formatCredit } from '@/utils/utils'
import { type Vendor } from '@/stores/vendor'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'

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
      <PageHeader :title="$t('openCredits')">
        <input
          id="searchInput"
          v-model="searchQuery"
          type="text"
          :placeholder="$t('IDNumber')"
          class="aug-input"
          style="width: auto"
        />
        <Button variant="secondary">{{ $t('search') }}</Button>
        <Button variant="secondary" :disabled="isRecalculating" @click="recalculate">
          {{ isRecalculating ? '…' : $t('recalculateBalances') }}
        </Button>
        <Button variant="secondary" @click="exportTable">{{ $t('export') }}</Button>
      </PageHeader>
    </template>

    <template #main>
      <div v-if="vendors" class="main">
        <div class="w-full mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div class="text-xl space-y-3 page-content space-x-2">
            <table class="table-auto w-full border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th class="p-3">{{ $t('IDNumber') }}</th>
                  <th class="p-3">{{ $t('amount') }}</th>
                  <th class="p-3">{{ $t('lastPayout') }}</th>
                  <th class="p-3">{{ $t('measure') }}</th>
                </tr>
              </thead>
              <tbody class="text-sm p-3">
                <tr v-for="(vendor, id) in displayVendors" :key="id">
                  <td class="border-t-2 p-3">
                    {{ vendor?.LicenseID }}
                  </td>
                  <td class="border-t-2 p-3">{{ formatCredit(vendor.Balance) }} €</td>
                  <td class="border-t-2 p-3">
                    {{ vendor.LastPayout ? formatDate(vendor.LastPayout) : '' }}
                  </td>
                  <router-link v-if="vendor?.ID" :to="`/backoffice/credits/payout/${vendor.ID}`">
                    <button class="p-3 rounded-full customcolor" :disabled="vendor.Balance === 0">
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
</style>
