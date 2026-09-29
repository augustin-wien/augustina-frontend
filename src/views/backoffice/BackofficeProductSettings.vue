<script lang="ts" setup>
import { useItemsStore } from '@/stores/items'
import { computed, ref } from 'vue'
import { formatCredit } from '@/utils/utils'
import type { Item } from '@/stores/items'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useI18n } from 'vue-i18n'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Toast from '@/components/ToastMessage.vue'

const { t } = useI18n()
const itemsStore = useItemsStore()

const currentTab = ref<'active' | 'archived'>('active')
const toast = ref<{ type: string; message: string } | null>(null)
const restoringId = ref<number | null>(null)

useAuthLoad(() => {
  itemsStore.getItemsBackoffice()
  itemsStore.getArchivedItems()
})

const archivedItems = computed(() => itemsStore.archivedItems)

const showToast = (type: string, message: string) => {
  toast.value = { type, message }

  setTimeout(() => {
    toast.value = null
  }, 5000)
}

async function restore(item: Item) {
  if (!confirm(t('restoreProductConfirm', { name: item.Name }))) return
  restoringId.value = item.ID

  try {
    await itemsStore.restoreItem(item.ID)
    showToast('success', t('restoreProductSuccess'))
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error restoring item:', error)
    showToast('error', t('restoreProductError'))
  } finally {
    restoringId.value = null
  }
}

const items = computed(() => {
  const tmpItems = JSON.parse(JSON.stringify(itemsStore.itemsBackoffice))
  // Sort items by is license item first, then put disabled items to the bottom
  const filter = ['donation', 'transactionCosts']
  return tmpItems
    .filter((item: Item) => !filter.includes(item.Name))
    .sort((a: Item, b: Item) => {
      // license items first (keep existing behaviour)
      const licenseDiff = Number(a.IsLicenseItem) - Number(b.IsLicenseItem)
      if (licenseDiff !== 0) return licenseDiff
      // then enabled items before disabled ones
      return Number(a.Disabled || false) - Number(b.Disabled || false)
    })
})

const apiUrl = import.meta.env.VITE_API_URL

function exportCSV() {
  const headers = [
    t('productId'),
    t('name'),
    t('description'),
    t('price'),
    t('order'),
    t('itemType'),
    t('isDisabled'),
    t('isArchived')
  ]

  // Archived (deleted) products are exported too, so historic payments can
  // still be matched to a product.
  const rows = [...items.value, ...archivedItems.value].map((item: Item) => [
    item.ID,
    item.Name,
    item.Description,
    item.Price,
    item.ItemOrder,
    item.Type ?? '',
    item.Disabled ? t('yes') : t('no'),
    item.Archived ? t('yes') : t('no')
  ])

  const csvContent = [headers, ...rows]
    .map((row) =>
      row.map((cell: unknown) => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(',')
    )
    .join('\n')

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')

  a.href = url
  a.download = 'products.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('menuProducts')">
        <Button variant="secondary" @click="exportCSV">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('downloadCSV') }}
        </Button>
      </PageHeader>
    </template>
    <template #main>
      <Toast v-if="toast" :toast="toast" @close="toast = null" />
      <div class="tab-nav">
        <button
          type="button"
          class="tab-btn"
          :class="{ 'tab-btn-active': currentTab === 'active' }"
          @click="currentTab = 'active'"
        >
          {{ $t('productsActive') }}
        </button>
        <button
          type="button"
          class="tab-btn"
          :class="{ 'tab-btn-active': currentTab === 'archived' }"
          @click="currentTab = 'archived'"
        >
          {{ $t('productsArchived') }} ({{ archivedItems.length }})
        </button>
      </div>
      <Card v-show="currentTab === 'active'" class="section">
        <table class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('productId') }}</th>
              <th>{{ $t('image') }}</th>
              <th>{{ $t('name') }}</th>
              <th>{{ $t('description') }}</th>
              <th>{{ $t('price') }}</th>
              <th>{{ $t('order') }}</th>
              <th>{{ $t('measure') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in items" :key="item.ID" :class="{ 'disabled-row': item.Disabled }">
              <td class="muted">{{ item.ID }}</td>
              <td>
                <img
                  :src="item.Image ? apiUrl + item.Image : ''"
                  :alt="$t('noImage')"
                  class="product-image"
                  width="80"
                  height="auto"
                />
              </td>
              <td class="font-bold">{{ $t(item.Name) }}</td>
              <td>{{ $t(item.Description) }}</td>
              <td>{{ formatCredit(item.Price) }} €</td>
              <td>{{ item.ItemOrder }}</td>
              <td>
                <router-link :to="`/backoffice/productsettings/update/${item.ID}`">
                  <Button variant="secondary">{{ $t('change') }}</Button>
                </router-link>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
      <Card v-show="currentTab === 'archived'" class="section">
        <p v-if="archivedItems.length === 0" class="muted empty">{{ $t('noArchivedProducts') }}</p>
        <table v-else class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('productId') }}</th>
              <th>{{ $t('image') }}</th>
              <th>{{ $t('name') }}</th>
              <th>{{ $t('description') }}</th>
              <th>{{ $t('itemType') }}</th>
              <th>{{ $t('price') }}</th>
              <th>{{ $t('measure') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in archivedItems" :key="item.ID" class="disabled-row">
              <td>{{ item.ID }}</td>
              <td>
                <img
                  :src="item.Image ? apiUrl + item.Image : ''"
                  :alt="$t('noImage')"
                  class="product-image"
                  width="80"
                  height="auto"
                />
              </td>
              <td class="font-bold">{{ $t(item.Name) }}</td>
              <td>{{ $t(item.Description) }}</td>
              <td>{{ item.Type ? $t(`itemType_${item.Type}`) : '' }}</td>
              <td>{{ formatCredit(item.Price) }} €</td>
              <td>
                <Button
                  variant="secondary"
                  :disabled="restoringId === item.ID"
                  @click="restore(item)"
                >
                  {{ $t('restore') }}
                </Button>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>
    </template>
    <template #footer>
      <footer>
        <router-link to="/backoffice/newproduct">
          <button class="p-3 rounded-full customcolor fixed bottom-10 right-10 h-16 w-16">
            {{ $t('new') }}
          </button>
        </router-link>
      </footer>
    </template>
  </component>
</template>

<style scoped>
.section {
  overflow-x: auto;
}
.tab-nav {
  margin-bottom: 20px;
  display: flex;
  gap: 4px;
  border-bottom: 1px solid var(--color-border);
}
.tab-btn {
  margin-bottom: -1px;
  padding: 10px 16px;
  border: none;
  border-bottom: 2px solid transparent;
  background: transparent;
  font-size: 13.5px;
  font-weight: 600;
  color: var(--color-text-muted);
  cursor: pointer;
}
.tab-btn:hover {
  color: var(--color-text);
}
.tab-btn-active {
  color: var(--color-accent);
  border-bottom-color: var(--color-accent);
}
.empty {
  padding: 16px;
}
.product-image {
  display: block;
  margin: 8px auto;
}
.muted {
  color: var(--color-text-muted);
}
.disabled-row {
  color: var(--color-text-muted);
}
.disabled-row td {
  background-color: var(--color-surface-alt);
}
</style>
