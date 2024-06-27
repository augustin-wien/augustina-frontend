<script lang="ts" setup>
import { useItemsStore } from '@/stores/items'
import { computed, onMounted, watch } from 'vue'
import { formatCredit } from '@/utils/utils'
import { useKeycloakStore } from '@/stores/keycloak'
import type { Item } from '@/stores/items'

const keycloakStore = useKeycloakStore()
const itemsStore = useItemsStore()
const authenticated = computed(() => keycloakStore.authenticated)

// Fetch the items' data when the component is mounted
onMounted(() => {
  if (authenticated.value) {
    itemsStore.getItemsBackoffice()
  } else {
    watch(authenticated, () => {
      itemsStore.getItemsBackoffice()
    })
  }
})

const items = computed(() => {
  const tmpItems = JSON.parse(JSON.stringify(itemsStore.itemsBackoffice))
  // Sort items by is license item and remove donation and transaction costs
  const filter = ['donation', 'transactionCosts']
  return tmpItems
    .sort((a: Item, b: Item) => Number(a.IsLicenseItem) - Number(b.IsLicenseItem))
    .filter((item: Item) => !filter.includes(item.Name))
})

const apiUrl = import.meta.env.VITE_API_URL
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t('menuProducts') }}</h1></template
    >
    <template #main>
      <div class="main w-full">
        <div class="mx-auto bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-xl space-y-3 space-x-3">
            <table className="table-auto w-full border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th class="p-3">{{ $t('image') }}</th>
                  <th class="p-3">{{ $t('name') }}</th>
                  <th class="p-3">{{ $t('description') }}</th>
                  <th class="p-3">{{ $t('price') }}</th>
                  <th class="p-3">{{ $t('measure') }}</th>
                </tr>
              </thead>
              <tbody className="text-sm p-3">
                <tr v-for="(item, ID) in items" :key="ID">
                  <td class="border-t-2 p-3">
                    <img
                      :src="item.Image ? apiUrl + item.Image : ''"
                      :alt="$t('noImage')"
                      class="logo mx-auto my-5"
                      width="80"
                      height="auto"
                    />
                  </td>
                  <td class="border-t-2 p-3 font-bold">{{ $t(item.Name) }}</td>
                  <td class="border-t-2 p-3">{{ $t(item.Description) }}</td>
                  <td class="border-t-2 p-3">{{ formatCredit(item.Price) }} Euro</td>
                  <td>
                    <router-link :to="`/backoffice/productsettings/update/${item.ID}`">
                      <button class="p-3 rounded-full bg-lime-600 text-white">
                        {{ $t('change') }}
                      </button>
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </template>
    <template #footer>
      <footer>
        <router-link to="/backoffice/newproduct">
          <button
            className="p-3 rounded-full bg-lime-600 text-white absolute fixed bottom-10 right-10 h-16 w-16"
          >
            {{ $t('new') }}
          </button>
        </router-link>
      </footer>
    </template>
  </component>
</template>

<style scoped></style>
