<script lang="ts" setup>
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import type { Item } from '@/stores/items'
import { useItemsStore, ITEM_TYPES } from '@/stores/items'
import { useKeycloakStore } from '@/stores/keycloak'
import { useSettingsStore } from '@/stores/settings'
import { faPen } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import FormField from '@/components/ui/FormField.vue'
import Modal from '@/components/ui/Modal.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

const itemsStore = useItemsStore()
const keycloakStore = useKeycloakStore()
const settingsStore = useSettingsStore()

const availableItemTypes = computed(() =>
  ITEM_TYPES.filter((type) => type !== 'abonement' || settingsStore.settings.AbonementEnabled)
)

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
      <PageHeader
        :title="item?.Name ?? ''"
        show-back
        @back="router.push({ name: 'Backoffice Product Settings' })"
      />
    </template>

    <template v-if="updatedItem" #main>
      <div v-if="item" class="product-page">
        <div class="product-grid">
          <!-- Left column: Basic info -->
          <Card>
            <h2 class="section-title">{{ $t('name') }} &amp; {{ $t('itemType') }}</h2>
            <div class="field-stack">
              <FormField :label="$t('productId')">
                <input type="text" :value="updatedItem.ID" class="aug-input" readonly />
              </FormField>
              <FormField :label="$t('itemType')" for="itemType">
                <select id="itemType" v-model="updatedItem.Type" class="aug-input">
                  <option v-for="t in availableItemTypes" :key="t" :value="t">
                    {{ $t(`itemType_${t}`) }}
                  </option>
                </select>
              </FormField>
              <FormField :label="$t('name')" for="itemName">
                <input
                  id="itemName"
                  v-model="updatedItem.Name"
                  type="text"
                  class="aug-input"
                  required
                />
              </FormField>
              <FormField :label="$t('description')" for="description">
                <input
                  id="description"
                  v-model="updatedItem.Description"
                  type="text"
                  class="aug-input"
                />
              </FormField>
              <div class="field-row-2">
                <FormField :label="`${$t('price')} (Cent)`" for="price">
                  <input
                    id="price"
                    v-model="updatedItem.Price"
                    type="number"
                    class="aug-input"
                    required
                  />
                </FormField>
                <FormField :label="$t('order')" for="itemOrder">
                  <input
                    id="itemOrder"
                    v-model="updatedItem.ItemOrder"
                    type="number"
                    class="aug-input"
                  />
                </FormField>
              </div>
            </div>
          </Card>

          <!-- Right column: Appearance + Visibility + License -->
          <div class="field-stack">
            <Card>
              <h2 class="section-title">{{ $t('image') }} &amp; {{ $t('color') }}</h2>
              <div class="field-stack">
                <div class="field-row-2">
                  <FormField :label="$t('Item background color')" for="itemColor">
                    <input
                      id="itemColor"
                      v-model="updatedItem.ItemColor"
                      type="color"
                      class="color-input"
                    />
                  </FormField>
                  <FormField :label="$t('Item text color')" for="itemTextColor">
                    <input
                      id="itemTextColor"
                      v-model="updatedItem.ItemTextColor"
                      type="color"
                      class="color-input"
                    />
                  </FormField>
                </div>
                <FormField :label="$t('image')">
                  <img
                    v-if="item.Image"
                    :src="previewImage(item.Image)"
                    alt="item image"
                    class="item-image-preview"
                  />
                  <input
                    id="image"
                    type="file"
                    accept="image/png, image/jpeg"
                    class="aug-input"
                    @change="updateImage"
                  />
                </FormField>
              </div>
            </Card>

            <Card>
              <h2 class="section-title">{{ $t('isDisabled') }}</h2>
              <label class="aug-toggle">
                <input id="isDisabled" v-model="updatedItem.Disabled" type="checkbox" />
                <span class="aug-toggle-track"></span>
                <span>{{ updatedItem.Disabled ? $t('yes') : $t('no') }}</span>
              </label>
            </Card>

            <Card>
              <h2 class="section-title">{{ $t('licenseItem') }}</h2>
              <div class="field-stack">
                <label class="aug-toggle">
                  <input id="isLicenseItem" v-model="updatedItem.IsLicenseItem" type="checkbox" />
                  <span class="aug-toggle-track"></span>
                  <span>{{ $t('isLicenseItem') }}</span>
                </label>

                <template v-if="!updatedItem.IsLicenseItem">
                  <FormField :label="$t('licenseItem')" for="licenseItem">
                    <div class="license-item-row">
                      <select id="licenseItem" v-model="updatedItem.LicenseItem" class="aug-input">
                        <option :value="undefined">-- {{ $t('none') }} --</option>
                        <option v-for="elItem in licenseItems" :key="elItem.ID" :value="elItem.ID">
                          {{ elItem.Name }}
                        </option>
                      </select>
                      <router-link
                        v-if="updatedItem.LicenseItem"
                        :to="`/backoffice/productsettings/update/${updatedItem.LicenseItem}`"
                      >
                        <button type="button" class="aug-icon-btn" :title="$t('edit')">
                          <font-awesome-icon :icon="faPen" />
                        </button>
                      </router-link>
                    </div>
                  </FormField>

                  <template v-if="updatedItem.LicenseItem !== undefined">
                    <label class="aug-toggle">
                      <input id="isPDFItem" v-model="updatedItem.IsPDFItem" type="checkbox" />
                      <span class="aug-toggle-track"></span>
                      <span>{{ $t('isPDFLicenseItem') }}</span>
                    </label>

                    <FormField
                      v-if="!updatedItem.IsPDFItem"
                      :label="$t('licenseGroup')"
                      for="licenseGroup"
                    >
                      <input
                        id="licenseGroup"
                        v-model="updatedItem.LicenseGroup"
                        type="text"
                        class="aug-input"
                      />
                    </FormField>

                    <FormField v-if="updatedItem.IsPDFItem" :label="$t('pdf item')" for="pdf">
                      <input
                        id="pdf"
                        type="file"
                        accept=".pdf"
                        class="aug-input"
                        @change="updatePDF"
                      />
                    </FormField>
                  </template>
                </template>
              </div>
            </Card>
          </div>
        </div>

        <div class="form-actions">
          <Button type="button" variant="danger" @click="showDeleteModalF">{{
            $t('delete')
          }}</Button>
          <Button type="button" variant="primary" @click="updateItem">{{ $t('save') }}</Button>
        </div>

        <Toast v-if="toast" :toast="toast" @close="toast = null" />
      </div>

      <Modal
        :open="showDeleteModal"
        size="sm"
        :title="`${updatedItem.Name} ${$t('delete')}`"
        @close="showDeleteModal = false"
      >
        <p>{{ $t('deletionConfirmation') }}</p>
        <template #footer>
          <Button variant="ghost" @click="showDeleteModal = false">{{ $t('cancel') }}</Button>
          <Button variant="danger" @click="deleteItem">{{ $t('delete') }}</Button>
        </template>
      </Modal>
    </template>
  </component>
</template>

<style scoped>
.product-page {
  margin-top: 16px;
  padding-bottom: 40px;
}
.product-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;
}
.section-title {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  margin-bottom: 14px;
}
.field-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}
.field-row-2 {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
}
.color-input {
  width: 100%;
  height: 40px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  cursor: pointer;
  padding: 2px;
}
.item-image-preview {
  max-height: 160px;
  object-fit: contain;
  border-radius: var(--radius-sm);
  margin-bottom: 8px;
}
.license-item-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.license-item-row .aug-input {
  flex: 1;
}
.form-actions {
  display: flex;
  justify-content: space-between;
  padding-top: 16px;
}

@media (max-width: 900px) {
  .product-grid {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 640px) {
  .field-row-2 {
    grid-template-columns: 1fr;
  }
}
</style>
