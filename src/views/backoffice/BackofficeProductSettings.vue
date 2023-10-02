<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header> <h1 className="font-bold mt-3 pt-3 text-2xl">Produkte</h1></template>
    <template #main>
      <main class="w-full">
        <div className="text-center text-2xl space-y-3 space-x-3">
          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th class="p-3">Bild</th>
                <th class="p-3">Name</th>
                <th class="p-3">Beschreibung</th>
                <th class="p-3">Preis</th>
                <th class="p-3">Aktion</th>
              </tr>
            </thead>
            <tbody className="text-sm p-3">
              <tr v-for="(item, ID) in items" :key="ID">
                <td class="border-t-2 p-3">
                  <img
                    :src="item.Image ? apiUrl + item.Image : ''"
                    alt="Kein Bild"
                    class="logo mx-auto my-5"
                    width="80"
                    height="auto"
                  />
                </td>
                <td class="border-t-2 p-3 font-bold">{{ item.Name }}</td>
                <td class="border-t-2 p-3">{{ item.Description }}</td>
                <td class="border-t-2 p-3">{{ price(item.Price) }} Euro</td>
                <td>
                  <router-link :to="`/backoffice/productsettings/update/${item.ID}`">
                    <button class="p-3 rounded-full bg-lime-600 text-white">Ändern</button>
                  </router-link>
                </td>
              </tr>
            </tbody>
          </div>
        </div>
      </main>
    </template>
    <template #footer>
      <footer>
        <router-link to="/backoffice/newproduct">
          <button
            className="p-3 rounded-full bg-lime-600 text-white absolute fixed bottom-10 right-10 h-16 w-16"
          >
            Neu
          </button>
        </router-link>
      </footer>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { itemStore } from '@/stores/items'
import { computed, onMounted } from 'vue'

const store = itemStore()

// Fetch the items' data when the component is mounted
onMounted(() => {
  store.getItems()
})
const items = computed(() => store.items)
const apiUrl = import.meta.env.VITE_API_URL
const price = (price: number) => {
  return (price / 100).toFixed(2)
}
</script>

<style scoped>
.products {
  /* overflow: hidden;
  overflow-y: hidden;
  max-height: 80vh;
  overflow-y: scroll;
  */
}
</style>
