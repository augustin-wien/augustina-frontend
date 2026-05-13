<script setup lang="ts">
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useSettingsStore } from '@/stores/settings'
import { vendorsStore } from '@/stores/vendor'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const vendorStore = vendorsStore()
const settingsStore = useSettingsStore()
const router = useRouter()

const search = ref('')

useAuthLoad(() => {
  vendorStore.getVendors()
  settingsStore.getSettingsFromApi()
})

const vendors = computed(() =>
  (vendorStore.vendors ?? []).filter((v) => {
    const q = search.value.toLowerCase()
    if (!q) return true
    return (
      v.LicenseID?.toLowerCase().includes(q) ||
      (v.FirstName + ' ' + v.LastName).toLowerCase().includes(q)
    )
  })
)

const posEnabled = computed(() => settingsStore.settings.POSEnabled)

function openPOS(licenseId: string) {
  router.push({ name: 'BackofficePOS', params: { id: licenseId } })
}
</script>

<template>
  <div slot="header">
    <h1 class="text-2xl font-bold p-4">{{ $t('posTitle') }}</h1>
  </div>

  <template #main>
    <div class="p-4">
      <div
        v-if="!posEnabled"
        class="mb-4 rounded bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3"
      >
        {{ $t('posDisabled') }}
      </div>

      <input
        v-model="search"
        type="text"
        :placeholder="$t('posPickVendor')"
        class="mb-4 w-full max-w-sm border rounded px-3 py-2 text-gray-700"
      />

      <table class="w-full text-left border-collapse">
        <thead>
          <tr class="border-b bg-gray-100">
            <th class="px-3 py-2">{{ $t('LicenseID') }}</th>
            <th class="px-3 py-2">{{ $t('FirstName') }}</th>
            <th class="px-3 py-2">{{ $t('LastName') }}</th>
            <th class="px-3 py-2"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="vendor in vendors" :key="vendor.ID" class="border-b hover:bg-gray-50">
            <td class="px-3 py-2">{{ vendor.LicenseID }}</td>
            <td class="px-3 py-2">{{ vendor.FirstName }}</td>
            <td class="px-3 py-2">{{ vendor.LastName }}</td>
            <td class="px-3 py-2">
              <button
                class="px-3 py-1 rounded bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50"
                :disabled="!posEnabled"
                @click="openPOS(vendor.LicenseID ?? '')"
              >
                {{ $t('posOpenPOS') }}
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </template>
</template>
