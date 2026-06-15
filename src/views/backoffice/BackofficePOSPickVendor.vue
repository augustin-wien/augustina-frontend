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
const loading = ref(true)

useAuthLoad(async () => {
  loading.value = true
  await Promise.all([vendorStore.getVendors(), settingsStore.getSettingsFromApi()])
  loading.value = false
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

function formatCents(cents: number) {
  return (cents / 100).toFixed(2) + ' €'
}

function initials(first: string, last: string) {
  return ((first?.[0] ?? '') + (last?.[0] ?? '')).toUpperCase()
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <div class="flex justify-between items-center mt-3">
        <h1 class="font-bold text-2xl">{{ $t('posTitle') }}</h1>
      </div>
    </template>

    <template #main>
      <div class="max-w-5xl">
        <div
          v-if="!posEnabled"
          class="mb-4 rounded bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3 text-sm"
        >
          {{ $t('posDisabled') }}
        </div>

        <!-- Search -->
        <input
          v-model="search"
          type="text"
          :placeholder="$t('posPickVendor')"
          class="mb-6 w-full max-w-sm border rounded-lg px-4 py-2 text-sm text-gray-700 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <!-- Loading -->
        <div v-if="loading" class="flex justify-center py-16">
          <svg
            class="animate-spin h-8 w-8 text-blue-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              class="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>

        <!-- Empty state -->
        <div v-else-if="vendors.length === 0" class="text-sm text-gray-400 italic">
          {{ $t('noVendorsFound') }}
        </div>

        <!-- Vendor cards -->
        <div v-else class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            v-for="vendor in vendors"
            :key="vendor.ID"
            class="text-left bg-white rounded-lg shadow-sm border border-gray-100 px-5 py-4 flex items-center gap-4 hover:shadow-md hover:border-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            :disabled="!posEnabled"
            @click="openPOS(vendor.LicenseID ?? '')"
          >
            <!-- Avatar -->
            <div
              class="w-11 h-11 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shrink-0"
            >
              {{ initials(vendor.FirstName, vendor.LastName) }}
            </div>

            <!-- Info -->
            <div class="min-w-0 flex-1">
              <div class="font-semibold text-gray-800 truncate">
                {{ vendor.FirstName }} {{ vendor.LastName }}
              </div>
              <div class="text-xs text-gray-400 mt-0.5">{{ vendor.LicenseID }}</div>
              <div
                v-if="vendor.Balance != null"
                class="text-xs mt-1"
                :class="vendor.Balance > 0 ? 'text-blue-600 font-medium' : 'text-gray-400'"
              >
                {{ $t('posBalance') }}: {{ formatCents(vendor.Balance) }}
              </div>
            </div>

            <!-- Arrow -->
            <span class="text-gray-300 text-lg shrink-0">›</span>
          </button>
        </div>
      </div>
    </template>
  </component>
</template>
