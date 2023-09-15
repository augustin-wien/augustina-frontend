<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div class="w-full max-w-md mx-auto mt-4" v-if="item">
          <form @submit.prevent="updateItem" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="Name"
                >Name:</label
              >
              <div class="flex flex-row">
                <span class="p-2">{{ item.Name }} </span>
                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="updatedItem.Name"
                  type="text"
                  id="Name"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="description"
                >Beschreibung:</label
              >
              <div class="flex flex-row">
                <span class="p-2">{{ item.Description }} </span>
                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="updatedItem.Description"
                  type="text"
                  id="description"
                  required
                />
              </div>

              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="price"
                >Preis:</label
              >
              <div class="flex flex-row">
                <span class="p-2">{{ item.Price }} </span>
                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="updatedItem.Price"
                  type="number"
                  id="price"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="image"
                >Logo:</label
              >
              <div class="flex flex-row">
                <span class="p-2">{{ item.Image }} </span>
                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  @change="updateImage"
                  type="file"
                  id="image"
                />
              </div>
            </div>

            <div class="flex place-content-center justify-between">
              <button
                type="submit"
                class="p-3 rounded-full bg-lime-600 text-white"
                @click="updateItem"
              >
                Bestätigen
              </button>
              <button
                type="submit"
                class="p-3 rounded-full bg-red-600 text-white"
                @click="deleteItem"
              >
                Löschen
              </button>
            </div>
          </form>
          <Toast v-if="toast" :toast="toast" />
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted } from 'vue'
import { itemStore } from '../stores/items'
import type { Item } from '@/stores/items'
import { useRoute } from 'vue-router'
import Toast from '@/components/ToastMessage.vue'

const store = itemStore()

const updatedItem = ref({
  Description: 'Jahreskalender',
  ID: 0,
  Image: 'tbd',
  Name: 'Kalender',
  Price: 0
})

store.getItems()
const items = computed(() => store.items)

const route = useRoute()
const idparams = route.params.ID

const item = computed(() => {
  const numericIdParams = Number(idparams) // Convert the string to a number or NaN
  if (!isNaN(numericIdParams)) {
    let i = items.value.find((item) => item.ID === numericIdParams)
    //@ts-ignore
    updatedItem.value = i
    return i
  } else {
    return null
  }
})
onMounted(() => {})
const toast = ref<{ type: string; message: string } | null>(null)

const updateItem = async () => {
  try {
    await store.updateItem(updatedItem.value as Item)
    showToast('success', 'Produkt erfolgreich aktualisiert')
  } catch (error) {
    console.error('Error creating item:', error)
    showToast('error', 'Produkt konnte nicht angelegt werden')
  }
}
const deleteItem = async () => {
  try {
    if (item.value) {
      await store.deleteItem(item.value.ID)
      showToast('success', 'Produkt erfolgreich gelöscht')
    }
  } catch (error) {
    console.error('Error deleting item:', error)
    showToast('error', 'Produkt konnte nicht gelöscht werden')
  }
}

const showToast = (type: string, message: string) => {
  toast.value = { type, message }
  setTimeout(() => {
    toast.value = null
  }, 5000)
}

const updateImage = (event: any) => {
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    updatedItem.value.Image = reader.result as string
    console.log(reader.result)
  }
}
</script>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
