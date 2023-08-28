<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div class="w-full max-w-md mx-auto mt-4">
          <form @submit.prevent="submitItem" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="Name"
                >Name:</label
              >
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="newItem.Name"
                type="text"
                id="name"
                required
              />

              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="Description"
                >Beschreibung:</label
              >
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="newItem.Description"
                type="text"
                id="description"
                required
              />

              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="price"
                >Preis:</label
              >
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="newItem.Price"
                type="number"
                id="price"
                required
              />

              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="image"
                >Logo:</label
              >
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="newItem.Image"
                type="text"
                id="image"
                required
              />
            </div>

            <div class="flex place-content-center">
              <button type="submit" class="p-3 rounded-full bg-lime-600 text-white">Anlegen</button>
            </div>
          </form>
          <Toast v-if="toast" :toast="toast" />
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { itemStore } from '../stores/items'
import type { Item } from '@/stores/items'
import Toast from '@/components/ToastMessage.vue'

const store = itemStore()

const newItem = ref({
  Description: 'string',
  Id: 0,
  Image: 'string',
  Name: 'string',
  Price: 0
})

const toast = ref<{ type: string; message: string } | null>(null)

const submitItem = async () => {
  try {
    await store.createItem(newItem.value as Item)
    showToast('success', 'Produkt erfolgreich angelegt')
  } catch (err) {
    console.error('Error creating item:', err)
    showToast('error', 'Produkt konnte nicht angelegt werden')
  }
}

const showToast = (type: string, message: string) => {
  // Set the toast message
  toast.value = { type, message }
  // Clear the toast after a delay (e.g., 5 seconds)
  setTimeout(() => {
    toast.value = null
  }, 5000)
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
