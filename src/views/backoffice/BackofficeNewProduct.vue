<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">Neues Produkt anlegen</h1></template
    >
    <template #main>
      <div class="main">
        <div class="w-full max-w-md mx-auto mt-4">
          <div class="flex place-content-center justify-between">
            <h1 class="text-2xl font-bold">Neues Produkt</h1>
            <button
              @click="router.push('/backoffice/productsettings')"
              class="px-2 rounded-full bg-red-600 text-white font-bold"
            >
              X
            </button>
          </div>
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
                hint="Name des Produkts"
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
                >Bild:</label
              >
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                type="file"
                id="image"
                accept="image/png, image/jpeg"
                @change="updateImage"
              />
            </div>

            <div class="flex justify-between">
              <button
                class="p-3 rounded-full mr-3 bg-red-600 bg-lime-600 text-white"
                @click="cancel"
              >
                Abbrechen
              </button>
              <button type="submit" class="p-3 rounded-full bg-lime-600 text-white">Anlegen</button>
            </div>
          </form>
          <Toast v-if="toast" :toast="toast" />
        </div>
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { itemStore } from '@/stores/items'
import type { Item } from '@/stores/items'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'

const store = itemStore()

const newItem = ref({
  Description: '',
  ID: 0,
  Image: '',
  Name: '',
  Price: 0
})

const toast = ref<{ type: string; message: string } | null>(null)

const submitItem = async () => {
  try {
    store
      .createItem(newItem.value as Item)
      .then(() => {
        console.log('Item created')
        router.push({ name: 'Backoffice Product Settings' })
      })
      .catch((err) => {
        showToast(
          'error',
          'Produkt konnte nicht angelegt werden. ' + err.response.data.error.message
        )
      })
  } catch (err: any) {
    showToast('error', 'Produkt konnte nicht angelegt werden' + err)
    console.error('Error creating item:', err)
  }
}

const cancel = (e: Event) => {
  e.preventDefault()
  router.go(-1)
}
const showToast = (type: string, message: string) => {
  // Set the toast message
  toast.value = { type, message }
  // Clear the toast after a delay (e.g., 5 seconds)
  setTimeout(() => {
    toast.value = null
  }, 5000)
}
const updateImage = (event: any) => {
  const file = event.target.files[0]
  const reader = new FileReader()
  reader.readAsDataURL(file)
  reader.onload = () => {
    newItem.value.Image = reader.result as string
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
