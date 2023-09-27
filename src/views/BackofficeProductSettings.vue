<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main class="w-full">
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1 className="font-bold text-3xl mt-3 pt-3">Produkte</h1>

          <div class="grid grid-cols-5 gap-4">
            <div class="p-3">Bild</div>
            <div class="p-3">Name</div>
            <div class="p-3">Beschreibung</div>
            <div class="p-3">Preis</div>
            <div class="p-3"></div>
          </div>
          <div class="products">
            <div class="grid grid-cols-5 gap-4" v-for="(item, ID) in items" :key="ID">
              <div class="p-3">
                <img :src="apiUrl + item.Image" alt="Kein Bild" class="logo mx-auto my-5" width="80" height="auto" />
              </div>
              <div class="p-3 font-bold">{{ item.Name }}</div>
              <div class="p-3 font-light">{{ item.Description }}</div>

              <div class="p-3 font-light">{{ price(item.Price) }} Euro</div>
              <div class="p-3">
                <router-link :to="`/backoffice/productsettings/update/${item.ID}`">
                  <button class="p-2 rounded-full bg-lime-600 text-white mr-2">Ändern</button>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer>
        <router-link to="/backoffice/newproduct">
          <button className="p-3 rounded-full bg-lime-600 text-white absolute bottom-10 right-10 h-16 w-16">
            Neu
          </button>
        </router-link>
      </footer>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { itemStore } from '../stores/items'
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
  overflow: hidden;
  overflow-y: hidden;
  max-height: 80vh;
  overflow-y: scroll;
}
</style>
