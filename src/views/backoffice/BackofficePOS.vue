<script setup lang="ts">
import { postPOSOrder } from '@/api/api'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useItemsStore, type Item } from '@/stores/items'
import { useSettingsStore } from '@/stores/settings'
import { vendorsStore } from '@/stores/vendor'
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const licenseId = route.params.id as string

const vendorStore = vendorsStore()
const itemsStore = useItemsStore()
const settingsStore = useSettingsStore()

const vendor = computed(() =>
  (vendorStore.vendors ?? []).find((v) => v.LicenseID === licenseId)
)
const posEnabled = computed(() => settingsStore.settings.POSEnabled)

// qty map: itemId -> quantity
const quantities = ref<Record<number, number>>({})

useAuthLoad(async () => {
  await Promise.all([
    vendorStore.getVendors(),
    itemsStore.getItemsBackoffice(),
    settingsStore.getSettingsFromApi(),
    vendorStore.getVendorComments(0) // placeholder; we reload below once vendor.ID is available
  ])
})

useAuthLoad(async () => {
  await vendorStore.getVendors()
  await itemsStore.getItemsBackoffice()
  await settingsStore.getSettingsFromApi()

  // default qty 10 for issues
  for (const item of posItems.value) {
    quantities.value[item.ID] = item.Type === 'issue' ? 10 : 0
  }

  if (vendor.value) {
    await vendorStore.getVendorComments(vendor.value.ID)
  }
})

const posItems = computed(() =>
  itemsStore.itemsBackoffice.filter(
    (i: Item) =>
      !i.Disabled &&
      !i.IsPDFItem &&
      !i.LicenseItem &&
      (i.Type === 'normal_item' || i.Type === 'issue')
  )
)

const total = computed(() =>
  posItems.value.reduce((sum, item) => {
    const qty = quantities.value[item.ID] ?? 0
    return sum + item.Price * qty
  }, 0)
)

const vendorBalance = computed(() => vendor.value?.Balance ?? 0)
const useBalance = ref(true)

const balancePortion = computed(() => {
  if (!useBalance.value || vendorBalance.value <= 0) return 0
  return Math.min(vendorBalance.value, total.value)
})
const cashPortion = computed(() => total.value - balancePortion.value)

function formatCents(cents: number) {
  return (cents / 100).toFixed(2) + ' €'
}

function inc(id: number) {
  quantities.value[id] = (quantities.value[id] ?? 0) + 1
}
function dec(id: number) {
  const current = quantities.value[id] ?? 0
  if (current > 0) quantities.value[id] = current - 1
}

// Sale submission
const submitting = ref(false)
const saleSuccess = ref(false)
const saleError = ref('')

async function completeSale() {
  const entries = posItems.value
    .filter((item) => (quantities.value[item.ID] ?? 0) > 0)
    .map((item) => ({ item: item.ID, quantity: quantities.value[item.ID]! }))

  if (entries.length === 0) return

  submitting.value = true
  saleError.value = ''
  try {
    await postPOSOrder(licenseId, entries, useBalance.value)
    saleSuccess.value = true
    // Refresh vendor balance
    await vendorStore.getVendors()
  } catch {
    saleError.value = 'Error completing sale. Please try again.'
  } finally {
    submitting.value = false
  }
}

function newSale() {
  saleSuccess.value = false
  saleError.value = ''
  for (const item of posItems.value) {
    quantities.value[item.ID] = item.Type === 'issue' ? 10 : 0
  }
}

// Comments
const newComment = ref('')
const addingComment = ref(false)

async function addComment() {
  if (!newComment.value.trim() || !vendor.value) return
  addingComment.value = true
  try {
    await vendorStore.createVendorComment({ comment: newComment.value } as any, vendor.value.ID)
    newComment.value = ''
    await vendorStore.getVendorComments(vendor.value.ID)
  } finally {
    addingComment.value = false
  }
}

const commentsOpen = ref(true)
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
  <template #header>
    <div class="flex items-center gap-4 p-4">
      <button class="text-gray-500 hover:underline text-sm" @click="router.back()">← Back</button>
      <h1 class="text-2xl font-bold">{{ $t('posTitle') }}</h1>
    </div>
  </template>

  <template #main>
    <div class="p-4 max-w-3xl">
      <!-- POS disabled banner -->
      <div
        v-if="!posEnabled"
        class="mb-4 rounded bg-yellow-100 border border-yellow-400 text-yellow-800 px-4 py-3"
      >
        {{ $t('posDisabled') }}
      </div>

      <!-- Vendor header -->
      <div v-if="vendor" class="mb-6 p-4 bg-white rounded shadow-sm">
        <div class="text-lg font-semibold">{{ vendor.FirstName }} {{ vendor.LastName }}</div>
        <div class="text-sm text-gray-500">{{ vendor.LicenseID }}</div>
        <div class="mt-1 text-sm">
          {{ $t('posBalance') }}: <strong>{{ formatCents(vendorBalance) }}</strong>
        </div>
      </div>

      <!-- Success state -->
      <div v-if="saleSuccess" class="p-6 bg-green-50 border border-green-300 rounded text-center">
        <div class="text-xl font-bold text-green-700 mb-2">{{ $t('posSaleConfirmed') }}</div>
        <div class="text-sm text-gray-600 mb-4">
          <span v-if="balancePortion > 0">{{ formatCents(balancePortion) }} {{ $t('posFromBalance') }} + </span>
          <span>{{ formatCents(cashPortion) }} {{ $t('posPayCash') }}</span>
        </div>
        <button
          class="px-6 py-2 rounded bg-blue-600 text-white font-semibold hover:bg-blue-700"
          @click="newSale"
        >
          {{ $t('posNewSale') }}
        </button>
      </div>

      <template v-else>
        <!-- Item grid -->
        <div v-if="posItems.length === 0" class="mb-6 text-sm text-gray-500 italic">
          {{ $t('posNoItems') }}
        </div>
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
          <div
            v-for="item in posItems"
            :key="item.ID"
            class="flex items-center justify-between bg-white rounded shadow-sm p-3"
          >
            <div>
              <div class="font-medium">{{ item.Name }}</div>
              <div class="text-sm text-gray-500">{{ formatCents(item.Price) }}</div>
            </div>
            <div class="flex items-center gap-2">
              <button
                class="w-8 h-8 rounded bg-gray-200 font-bold text-lg leading-none"
                @click="dec(item.ID)"
              >−</button>
              <input
                type="number"
                min="0"
                class="w-14 text-center font-semibold border rounded py-1"
                :value="quantities[item.ID] ?? 0"
                @change="quantities[item.ID] = Math.max(0, parseInt(($event.target as HTMLInputElement).value) || 0)"
              />
              <button
                class="w-8 h-8 rounded bg-gray-200 font-bold text-lg leading-none"
                @click="inc(item.ID)"
              >+</button>
            </div>
          </div>
        </div>

        <!-- Payment split -->
        <div class="bg-white rounded shadow-sm p-4 mb-4">
          <div class="flex justify-between text-lg font-semibold mb-3">
            <span>{{ $t('posTotal') }}</span>
            <span>{{ formatCents(total) }}</span>
          </div>

          <label v-if="vendorBalance > 0" class="flex items-center gap-2 mb-3 cursor-pointer">
            <input v-model="useBalance" type="checkbox" />
            <span class="text-sm">
              {{ $t('posUseBalance') }} ({{ formatCents(vendorBalance) }})
            </span>
          </label>

          <div v-if="total > 0" class="text-sm text-gray-600 space-y-1">
            <div v-if="balancePortion > 0" class="flex justify-between">
              <span>{{ $t('posFromBalance') }}</span>
              <span>{{ formatCents(balancePortion) }}</span>
            </div>
            <div class="flex justify-between">
              <span>{{ $t('posPayCash') }}</span>
              <span>{{ formatCents(cashPortion) }}</span>
            </div>
            <div v-if="balancePortion > 0" class="flex justify-between text-gray-400 mt-1">
              <span>{{ $t('posBalanceAfter') }}</span>
              <span>{{ formatCents(vendorBalance - balancePortion) }}</span>
            </div>
          </div>
        </div>

        <div v-if="saleError" class="mb-3 text-red-600 text-sm">{{ saleError }}</div>

        <button
          class="w-full py-3 rounded bg-blue-600 text-white font-bold text-lg hover:bg-blue-700 disabled:opacity-50"
          :disabled="total === 0 || submitting || !posEnabled"
          @click="completeSale"
        >
          {{ submitting ? '...' : $t('posCompleteSale') }}
        </button>
      </template>

      <!-- Comments panel -->
      <div class="mt-6 bg-white rounded shadow-sm">
        <button
          class="w-full flex justify-between items-center p-4 font-semibold"
          @click="commentsOpen = !commentsOpen"
        >
          <span>{{ $t('vendorComments') }} ({{ (vendorStore.vendorComments ?? []).length }})</span>
          <span>{{ commentsOpen ? '▲' : '▼' }}</span>
        </button>
        <div v-if="commentsOpen" class="px-4 pb-4">
          <div
            v-for="c in vendorStore.vendorComments ?? []"
            :key="c.id"
            class="border-b py-2 text-sm"
          >
            <span class="text-gray-400 text-xs mr-2">{{ c.id }}</span>{{ c.comment }}
          </div>
          <div v-if="!(vendorStore.vendorComments ?? []).length" class="text-sm text-gray-400 py-2">
            {{ $t('noComments') }}
          </div>
          <div class="flex gap-2 mt-3">
            <input
              v-model="newComment"
              type="text"
              :placeholder="$t('addComment')"
              class="flex-1 border rounded px-3 py-1 text-sm"
              @keyup.enter="addComment"
            />
            <button
              class="px-3 py-1 rounded bg-gray-700 text-white text-sm hover:bg-gray-800 disabled:opacity-50"
              :disabled="addingComment || !newComment.trim()"
              @click="addComment"
            >
              {{ $t('add') }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  </component>
</template>
