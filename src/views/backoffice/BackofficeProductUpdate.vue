<script lang="ts" setup>
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import type { Item } from '@/stores/items'
import { useItemsStore, ITEM_TYPES } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const itemsStore = useItemsStore()
const keycloakStore = useKeycloakStore()
const authenticated = computed(() => keycloakStore.authenticated)

const updatedItem = ref<Item | null>()

watch(
  authenticated,
  (val) => {
    if (val) {
      itemsStore.getItems()
      itemsStore.getItemsBackoffice()
    }
  },
  { immediate: true }
)

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
      <h1 class="font-bold mt-3 pt-3 text-2xl">{{ item?.Name }}</h1>
    </template>

    <template v-if="updatedItem" #main>
      <div v-if="item" class="mt-4 pb-10">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 items-start">
          <!-- Left column: Basic info -->
          <section class="bg-white shadow-sm rounded-lg p-6">
            <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
              {{ $t('name') }} &amp; {{ $t('itemType') }}
            </h2>
            <div class="space-y-4">
              <div>
                <label class="field-label">{{ $t('productId') }}</label>
                <input
                  type="text"
                  :value="updatedItem.ID"
                  class="field-input bg-gray-100 text-gray-500"
                  readonly
                />
              </div>
              <div>
                <label class="field-label" for="itemType">{{ $t('itemType') }}</label>
                <select id="itemType" v-model="updatedItem.Type" class="field-input">
                  <option v-for="t in ITEM_TYPES" :key="t" :value="t">
                    {{ $t(`itemType_${t}`) }}
                  </option>
                </select>
              </div>
              <div>
                <label class="field-label" for="itemName">{{ $t('name') }}</label>
                <input
                  id="itemName"
                  v-model="updatedItem.Name"
                  type="text"
                  class="field-input"
                  required
                />
              </div>
              <div>
                <label class="field-label" for="description">{{ $t('description') }}</label>
                <input
                  id="description"
                  v-model="updatedItem.Description"
                  type="text"
                  class="field-input"
                />
              </div>
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="field-label" for="price">{{ $t('price') }} (Cent)</label>
                  <input
                    id="price"
                    v-model="updatedItem.Price"
                    type="number"
                    class="field-input"
                    required
                  />
                </div>
                <div>
                  <label class="field-label" for="itemOrder">{{ $t('order') }}</label>
                  <input
                    id="itemOrder"
                    v-model="updatedItem.ItemOrder"
                    type="number"
                    class="field-input"
                  />
                </div>
              </div>
            </div>
          </section>

          <!-- Right column: Appearance + Visibility + License -->
          <div class="space-y-4">
            <!-- Section: Appearance -->
            <section class="bg-white shadow-sm rounded-lg p-6">
              <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                {{ $t('image') }} &amp; {{ $t('color') }}
              </h2>
              <div class="space-y-4">
                <div class="grid grid-cols-2 gap-4">
                  <div>
                    <label class="field-label" for="itemColor">{{
                      $t('Item background color')
                    }}</label>
                    <input
                      id="itemColor"
                      v-model="updatedItem.ItemColor"
                      type="color"
                      class="h-10 w-full rounded border cursor-pointer"
                    />
                  </div>
                  <div>
                    <label class="field-label" for="itemTextColor">{{
                      $t('Item text color')
                    }}</label>
                    <input
                      id="itemTextColor"
                      v-model="updatedItem.ItemTextColor"
                      type="color"
                      class="h-10 w-full rounded border cursor-pointer"
                    />
                  </div>
                </div>
                <div>
                  <label class="field-label">{{ $t('image') }}</label>
                  <img
                    v-if="item.Image"
                    :src="previewImage(item.Image)"
                    alt="item image"
                    class="mb-2 rounded max-h-40 object-contain"
                  />
                  <input
                    id="image"
                    type="file"
                    accept="image/png, image/jpeg"
                    class="field-input"
                    @change="updateImage"
                  />
                </div>
              </div>
            </section>

            <!-- Section: Visibility -->
            <section class="bg-white shadow-sm rounded-lg p-6">
              <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                {{ $t('isDisabled') }}
              </h2>
              <label class="flex items-center gap-3 cursor-pointer">
                <input
                  id="isDisabled"
                  v-model="updatedItem.Disabled"
                  type="checkbox"
                  class="sr-only peer"
                />
                <div
                  class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                ></div>
                <span class="text-sm">{{ updatedItem.Disabled ? $t('yes') : $t('no') }}</span>
              </label>
            </section>

            <!-- Section: Digital license -->
            <section class="bg-white shadow-sm rounded-lg p-6">
              <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">
                {{ $t('licenseItem') }}
              </h2>
              <div class="space-y-4">
                <label class="flex items-center gap-3 cursor-pointer">
                  <input
                    id="isLicenseItem"
                    v-model="updatedItem.IsLicenseItem"
                    type="checkbox"
                    class="sr-only peer"
                  />
                  <div
                    class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                  ></div>
                  <span class="text-sm font-medium">{{ $t('isLicenseItem') }}</span>
                </label>

                <template v-if="!updatedItem.IsLicenseItem">
                  <div>
                    <label class="field-label" for="licenseItem">{{ $t('licenseItem') }}</label>
                    <div class="flex gap-2 items-center">
                      <select
                        id="licenseItem"
                        v-model="updatedItem.LicenseItem"
                        class="field-input flex-1"
                      >
                        <option :value="undefined">-- {{ $t('none') }} --</option>
                        <option v-for="elItem in licenseItems" :key="elItem.ID" :value="elItem.ID">
                          {{ elItem.Name }}
                        </option>
                      </select>
                      <router-link
                        v-if="updatedItem.LicenseItem"
                        :to="`/backoffice/productsettings/update/${updatedItem.LicenseItem}`"
                      >
                        <button
                          type="button"
                          class="p-2 rounded-full customcolor h-10 w-10 flex-shrink-0"
                          :title="$t('edit')"
                        >
                          <font-awesome-icon :icon="faPen" />
                        </button>
                      </router-link>
                    </div>
                  </div>

                  <template v-if="updatedItem.LicenseItem !== undefined">
                    <label class="flex items-center gap-3 cursor-pointer">
                      <input
                        id="isPDFItem"
                        v-model="updatedItem.IsPDFItem"
                        type="checkbox"
                        class="sr-only peer"
                      />
                      <div
                        class="relative w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full"
                      ></div>
                      <span class="text-sm font-medium">{{ $t('isPDFLicenseItem') }}</span>
                    </label>

                    <div v-if="!updatedItem.IsPDFItem">
                      <label class="field-label" for="licenseGroup">{{ $t('licenseGroup') }}</label>
                      <input
                        id="licenseGroup"
                        v-model="updatedItem.LicenseGroup"
                        type="text"
                        class="field-input"
                      />
                    </div>

                    <div v-if="updatedItem.IsPDFItem">
                      <label class="field-label" for="pdf">{{ $t('pdf item') }}</label>
                      <input
                        id="pdf"
                        type="file"
                        accept=".pdf"
                        class="field-input"
                        @change="updatePDF"
                      />
                    </div>
                  </template>
                </template>
              </div>
            </section>
          </div>
          <!-- end right column -->
        </div>
        <!-- end grid -->

        <!-- Action buttons -->
        <div class="flex justify-between pt-4">
          <button
            type="button"
            class="py-2 px-6 rounded-full bg-red-600 text-white"
            @click="showDeleteModalF"
          >
            {{ $t('delete') }}
          </button>
          <button type="button" class="py-2 px-6 rounded-full customcolor" @click="updateItem">
            {{ $t('save') }}
          </button>
        </div>

        <Toast v-if="toast" :toast="toast" @close="toast = null" />
      </div>

      <!-- Delete confirmation modal -->
      <div
        v-if="showDeleteModal"
        class="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      >
        <div class="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
          <h3 class="text-lg font-semibold mb-3">{{ updatedItem.Name }} {{ $t('delete') }}</h3>
          <p class="text-gray-500 mb-6">{{ $t('deletionConfirmation') }}</p>
          <div class="flex justify-end gap-3">
            <button
              type="button"
              class="py-2 px-5 rounded-lg border text-gray-600"
              @click="showDeleteModal = false"
            >
              {{ $t('cancel') }}
            </button>
            <button
              type="button"
              class="py-2 px-5 rounded-lg bg-red-600 text-white"
              @click="deleteItem"
            >
              {{ $t('delete') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.field-label {
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #374151;
  margin-bottom: 0.25rem;
}

.field-input {
  width: 100%;
  border: 1px solid #d1d5db;
  border-radius: 0.375rem;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  color: #374151;
  outline: none;
}

.field-input:focus {
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.3);
}
</style>
