<script setup lang="ts">
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useSettingsStore } from '@/stores/settings'
import { vendorsStore } from '@/stores/vendor'
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'

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
      <PageHeader :title="$t('posTitle')" />
    </template>

    <template #main>
      <div class="max-w-5xl">
        <div v-if="!posEnabled" class="pos-disabled-banner">
          {{ $t('posDisabled') }}
        </div>

        <!-- Search -->
        <input
          v-model="search"
          type="text"
          :placeholder="$t('posPickVendor')"
          class="aug-input search-input"
        />

        <!-- Loading -->
        <div v-if="loading" class="loading-row">
          <svg class="spinner" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle
              class="spinner-track"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              stroke-width="4"
            />
            <path class="spinner-head" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
          </svg>
        </div>

        <!-- Empty state -->
        <div v-else-if="vendors.length === 0" class="empty-text">
          {{ $t('noVendorsFound') }}
        </div>

        <!-- Vendor cards -->
        <div v-else class="vendor-grid">
          <button
            v-for="vendor in vendors"
            :key="vendor.ID"
            type="button"
            class="vendor-card"
            :disabled="!posEnabled"
            @click="openPOS(vendor.LicenseID ?? '')"
          >
            <div class="vendor-avatar">
              {{ initials(vendor.FirstName, vendor.LastName) }}
            </div>

            <div class="vendor-info">
              <div class="vendor-name">{{ vendor.FirstName }} {{ vendor.LastName }}</div>
              <div class="vendor-license">{{ vendor.LicenseID }}</div>
              <div
                v-if="vendor.Balance != null"
                class="vendor-balance"
                :class="{ 'vendor-balance-positive': vendor.Balance > 0 }"
              >
                {{ $t('posBalance') }}: {{ formatCents(vendor.Balance) }}
              </div>
            </div>

            <span class="vendor-arrow">›</span>
          </button>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.pos-disabled-banner {
  margin-bottom: 16px;
  padding: 12px 16px;
  border-radius: var(--radius-sm);
  background: var(--color-info-bg);
  color: var(--color-info);
  font-size: 13.5px;
}
.search-input {
  max-width: 380px;
  margin-bottom: 24px;
}
.loading-row {
  display: flex;
  justify-content: center;
  padding: 64px 0;
}
.spinner {
  width: 32px;
  height: 32px;
  color: var(--color-accent);
  animation: spin 1s linear infinite;
}
.spinner-track {
  opacity: 0.25;
}
.spinner-head {
  opacity: 0.75;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
.empty-text {
  font-size: 13.5px;
  font-style: italic;
  color: var(--color-text-muted);
}
.vendor-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
  gap: 16px;
}
.vendor-card {
  display: flex;
  align-items: center;
  gap: 16px;
  text-align: left;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  padding: 16px 20px;
  cursor: pointer;
  transition:
    border-color 0.15s ease,
    box-shadow 0.15s ease;
}
.vendor-card:not(:disabled):hover {
  border-color: var(--color-accent);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}
.vendor-card:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.vendor-avatar {
  width: 44px;
  height: 44px;
  border-radius: 999px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-accent);
  color: var(--color-accent-fg);
  font-weight: 700;
  font-size: 13px;
}
.vendor-info {
  min-width: 0;
  flex: 1;
}
.vendor-name {
  font-weight: 600;
  color: var(--color-text);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vendor-license {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 2px;
}
.vendor-balance {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
}
.vendor-balance-positive {
  color: var(--color-accent);
  font-weight: 600;
}
.vendor-arrow {
  flex-shrink: 0;
  font-size: 18px;
  color: var(--color-text-muted);
}
</style>
