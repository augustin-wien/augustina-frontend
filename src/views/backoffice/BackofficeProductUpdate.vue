<script lang="ts" setup>
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import type { Item } from '@/stores/items'
import { useItemsStore } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'

import { computed, onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const itemsStore = useItemsStore()
const keycloakStore = useKeycloakStore()
const authenticated = computed(() => keycloakStore.authenticated)

const updatedItem = ref<Item | null>()

onMounted(() => {
  if (authenticated.value) {
    itemsStore.getItems()
    itemsStore.getItemsBackoffice()
  } else {
    watch(authenticated, () => {
      itemsStore.getItems()
      itemsStore.getItemsBackoffice()
    })
  }
})

const items = computed(() => itemsStore.itemsBackoffice)

const licenseItems = computed(() => itemsStore.itemsBackoffice.filter((item) => item.IsLicenseItem))

const item = computed(() => updatedItem.value)

const route = useRoute()
const idParams = computed(() => Number(route.params.ID))

function getItem() {
  if (!isNaN(idParams.value)) {
    const i = items.value.find((item) => item.ID === idParams.value)
    //@ts-ignore
    return JSON.parse(JSON.stringify(i))
  } else {
    return null
  }
}

watch(idParams, (newVal) => {
  if (newVal) {
    updatedItem.value = getItem()
  }
})

watch(items, (newVal) => {
  if (newVal) {
    updatedItem.value = getItem()
  }
})

const toast = ref<{ type: string; message: string } | null>(null)

const updateItem = async () => {
  try {
    itemsStore
      .updateItem(updatedItem.value as Item)
      .then(() => {
        showToast('success', 'Produkt erfolgreich aktualisiert')

        itemsStore.getItems().then(() => {
          router.push({ name: 'Backoffice Product Settings' })
        })
      })
      .catch((err) => {
        showToast('error', 'Produkt konnte nicht aktualisiert werden' + err)
      })
  } catch (error) {
    // eslint-disable-next-line no-console
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
      await itemsStore.deleteItem(item.value.ID)
      showToast('success', 'Produkt erfolgreich gelöscht')
      router.push({ name: 'Backoffice Product Settings' })
    }
  } catch (error) {
    // eslint-disable-next-line no-console
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
  if (!updatedItem.value) return
  updatedItem.value.Image = event.target?.files[0]
}

const updatePDF = (event: any) => {
  if (!updatedItem.value) return
  updatedItem.value.PDF = event.target?.files[0]
}

const apiUrl = import.meta.env.VITE_API_URL

const previewImage = (image: string | Blob | MediaSource) => {
  if (!image || image === '') return
  else if (typeof image === 'string') return apiUrl + image
  // @ts-ignore
  else return URL.createObjectURL(image)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">
        {{ $t('menuProducts') }} {{ $t('menuSettings') }}
      </h1>
    </template>
    <template v-if="updatedItem" #main>
      <div class="main">
        <div v-if="item" class="w-full mx-auto mt-4">
          <div class="flex place-content-center justify-between">
            <h1 class="text-2xl font-bold">{{ item.Name }} {{ $t('change') }}</h1>
            <button
              class="px-2 rounded-full font-bold"
              @click="router.push('/backoffice/productsettings')"
            >
              X
            </button>
          </div>

          <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="Name"
                >{{ $t('name') }}:</label
              >
              <div class="flex flex-row">
                <input
                  id="Name"
                  v-model="updatedItem.Name"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="description"
                >{{ $t('description') }}:</label
              >
              <div class="flex flex-row">
                <input
                  id="description"
                  v-model="updatedItem.Description"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="description"
                >{{ $t('Item order (higher moves the item up)') }}:</label
              >
              <div class="flex flex-row">
                <input
                  id="description"
                  v-model="updatedItem.ItemOrder"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="price"
                >{{ $t('price') }} (Cent):</label
              >
              <div class="flex flex-row">
                <input
                  id="price"
                  v-model="updatedItem.Price"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="number"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="image"
                >{{ $t('image') }}:</label
              >
              <div class="flex flex-col">
                <img
                  v-if="item.Image"
                  :src="previewImage(item.Image)"
                  alt="item image"
                  class="productImage"
                  width="100%"
                  height="auto"
                />
                <input
                  id="image"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  accept="image/png, image/jpeg"
                  type="file"
                  @change="updateImage"
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="image">{{
                $t('isLicenseItem')
              }}</label>
              <label class="inline-flex items-center cursor-pointer mt-4">
                <input
                  id="isLicenseItem"
                  v-model="updatedItem.IsLicenseItem"
                  class="sr-only peer"
                  type="checkbox"
                />
                <div
                  class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                ></div>
                <span class="ms-3 text-sm font-medium">{{
                  updatedItem.IsLicenseItem ? $t('yes') : $t('no')
                }}</span>
              </label>
              <div v-if="!updatedItem.IsLicenseItem">
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="image"
                  >{{ $t('licenseItem') }}:</label
                >
                <select
                  v-model="updatedItem.LicenseItem"
                  class="w-full h-10 pl-3 pr-6 text-base placeholder-gray-600 border rounded-lg appearance-none focus:shadow-outline"
                >
                  <option :value="undefined">-- {{ $t('none') }} --</option>
                  <option v-for="elItem in licenseItems" :key="elItem.ID" :value="elItem.ID">
                    {{ elItem.Name }}
                  </option>
                </select>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="pdf">{{
                  $t('isPDFLicenseItem')
                }}</label>
                <label
                  v-if="updatedItem.LicenseItem !== undefined"
                  class="inline-flex items-center cursor-pointer mt-4"
                >
                  <input
                    id="isLicenseItem"
                    v-model="updatedItem.IsPDFItem"
                    class="sr-only peer"
                    type="checkbox"
                  />
                  <div
                    class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"
                  ></div>
                  <span class="ms-3 text-sm font-medium">{{
                    updatedItem.IsPDFItem ? $t('yes') : $t('no')
                  }}</span>
                </label>
                <div v-if="updatedItem.LicenseItem !== undefined && !updatedItem.IsPDFItem">
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="image"
                    >{{ $t('licenseGroup') }}:</label
                  >
                  <input
                    id="licenseGroup"
                    v-model="updatedItem.LicenseGroup"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                  />
                </div>
                <label
                  v-if="updatedItem.LicenseItem !== undefined && updatedItem.IsPDFItem"
                  class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                  for="pdf"
                  >{{ $t('pdf item') }}:</label
                >
                <div
                  v-if="updatedItem.LicenseItem !== undefined && updatedItem.IsPDFItem"
                  class="flex flex-col"
                >
                  <input
                    id="pdf"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    accept=".pdf"
                    type="file"
                    @change="updatePDF"
                  />
                </div>
              </div>
            </div>

            <div class="flex place-content-center justify-between">
              <button
                type="submit"
                class="p-3 rounded-full bg-red-600 text-white"
                @click="showDeleteModalF"
              >
                {{ $t('delete') }}
              </button>
              <button
                type="submit"
                class="p-3 rounded-full bg-lime-600 text-white"
                @click="updateItem"
              >
                {{ $t('confirmation') }}
              </button>
            </div>
          </div>
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
                      {{ updatedItem.Name }} {{ $t('delete') }}
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
                      {{ $t('deletionConfirmation') }}
                    </p>
                  </div>
                  <!-- Modal footer -->
                  <div
                    class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600"
                  >
                    <button
                      data-modal-hide="defaultModal"
                      type="button"
                      class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                      @click="deleteItem"
                    >
                      {{ $t('delete') }}
                    </button>
                    <button
                      data-modal-hide="defaultModal"
                      type="button"
                      class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                      @click="showDeleteModal = false"
                    >
                      {{ $t('cancel') }}
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
