<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">Bearbeitung</h1></template
    >
    <template #main>
      <div class="main">
        <div class="w-full max-w-md mx-auto mt-4" v-if="item">
          <div class="flex place-content-center justify-between">
            <h1 class="text-2xl font-bold">{{ item.Name }} bearbeiten</h1>
            <button
              @click="router.push('/backoffice/productsettings')"
              class="px-2 rounded-full bg-red-600 text-white font-bold"
            >
              X
            </button>
          </div>

          <form
            @submit.prevent="updateItem"
            class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="Name"
                >Name:</label
              >
              <div class="flex flex-row">
                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="updatedItem.Name"
                  type="text"
                  id="Name"
                  required
                />
              </div>
              <label
                class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                for="description"
                >Beschreibung:</label
              >
              <div class="flex flex-row">
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
                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="updatedItem.Price"
                  type="number"
                  id="price"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="image"
                >Bild:</label
              >
              <div class="flex flex-col">
                <div v-if="item.Image.startsWith">
                  <img
                    :src="item.Image.startsWith('img') ? apiUrl + item.Image : item.Image"
                    alt="item image"
                    class="productImage"
                    width="100%"
                    height="auto"
                    v-if="item.Image"
                  />
                </div>
                <div v-else>
                  <img
                    :src="previewImage(item.Image)"
                    alt="item image"
                    class="productImage"
                    width="100%"
                    height="auto"
                    v-if="item.Image"
                  />
                </div>
                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  accept="image/png, image/jpeg"
                  @change="updateImage"
                  type="file"
                  id="image"
                />
              </div>
            </div>

            <div class="flex place-content-center justify-between">
              <button
                type="submit"
                class="p-3 rounded-full bg-red-600 text-white"
                @click="showDeleteModalF"
              >
                Löschen
              </button>
              <button
                type="submit"
                class="p-3 rounded-full bg-lime-600 text-white"
                @click="updateItem"
              >
                Speichern
              </button>
            </div>
          </form>
          <Toast v-if="toast" :toast="toast" />
          <!-- delete modal -->
          <div v-if="showDeleteModal">
            <div
              id="defaultModal"
              tabindex="-1"
              aria-hidden="false"
              class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden flex items-center justify-center overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
            >
              <div class="relative w-full max-w-2xl max-h-full">
                <!-- Modal content -->
                <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                  <!-- Modal header -->
                  <div
                    class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600"
                  >
                    <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                      {{ updatedItem.Name }} löschen
                    </h3>
                    <button
                      type="button"
                      class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                      data-modal-hide="defaultModal"
                      @click="showDeleteModal = false"
                    >
                      <svg
                        class="w-3 h-3"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 14 14"
                      >
                        <path
                          stroke="currentColor"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          stroke-width="2"
                          d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                        />
                      </svg>
                      <span class="sr-only">Close modal</span>
                    </button>
                  </div>
                  <!-- Modal body -->
                  <div class="p-6 space-y-6">
                    <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                      Willst du das Produkt wirklich löschen?
                    </p>
                  </div>
                  <!-- Modal footer -->
                  <div
                    class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600"
                  >
                    <button
                      data-modal-hide="defaultModal"
                      type="button"
                      @click="deleteItem"
                      class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    >
                      Löschen
                    </button>
                    <button
                      data-modal-hide="defaultModal"
                      type="button"
                      class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                      @click="showDeleteModal = false"
                    >
                      Abbrechen
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { itemStore } from '@/stores/items'
import type { Item } from '@/stores/items'
import { useRoute } from 'vue-router'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'

const store = itemStore()

const updatedItem = ref({
  Description: 'Jahreskalender',
  ID: 0,
  Image: 'tbd',
  Name: 'Kalender',
  Price: 0,
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
    return i
  } else {
    return null
  }
})
watch(item, (newVal) => {
  if (newVal) {
    updatedItem.value = newVal
  }
})
onMounted(() => {})
const toast = ref<{ type: string; message: string } | null>(null)

const updateItem = async () => {
  try {
    store
      .updateItem(updatedItem.value as Item)
      .then(() => {
        showToast('success', 'Produkt erfolgreich aktualisiert')
        store.getItems()
      })
      .catch((err) => {
        showToast('error', 'Produkt konnte nicht aktualisiert werden' + err)
      })
  } catch (error) {
    console.error('Error creating item:', error)
    showToast('error', 'Produkt konnte nicht angelegt werden')
  }
}
const showDeleteModal = ref(false)
const showDeleteModalF = (event: Event) => {
  event.preventDefault()
  showDeleteModal.value = true
}

const deleteItem = async () => {
  try {
    if (item.value) {
      await store.deleteItem(item.value.ID)
      showToast('success', 'Produkt erfolgreich gelöscht')
      router.push({ name: 'Backoffice Product Settings' })
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
  updatedItem.value.Image = event.target.files[0]
}

const apiUrl = import.meta.env.VITE_API_URL

const previewImage = (image: object) => {
  if (!image || image === '') return
  return URL.createObjectURL(image)
}
</script>

<style scoped>
tr {
  padding: 10px;
}

td {
  padding: 10px;
}
.productImage {
  width: 100% !important;
}
</style>
