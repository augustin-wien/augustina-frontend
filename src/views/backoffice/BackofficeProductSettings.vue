<script lang="ts" setup>
import { useItemsStore } from '@/stores/items'
import { computed } from 'vue'
import { formatCredit } from '@/utils/utils'
import type { Item } from '@/stores/items'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useI18n } from 'vue-i18n'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const { t } = useI18n()
const itemsStore = useItemsStore()

useAuthLoad(() => {
  itemsStore.getItemsBackoffice()
})

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
    t('isDisabled')
  ]

  const rows = items.value.map((item: Item) => [
    item.ID,
    item.Name,
    item.Description,
    item.Price,
    item.ItemOrder,
    item.Type ?? '',
    item.Disabled ? t('yes') : t('no')
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
      <Card class="section">
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
