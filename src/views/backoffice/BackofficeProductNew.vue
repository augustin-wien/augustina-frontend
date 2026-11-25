<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useItemsStore, ITEM_TYPES } from '@/stores/items'
import type { Item } from '@/stores/items'
import { useSettingsStore, vouchersEnabled } from '@/stores/settings'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import FormField from '@/components/ui/FormField.vue'

const { t } = useI18n()

const store = useItemsStore()
const settingsStore = useSettingsStore()

const availableItemTypes = computed(() =>
  ITEM_TYPES.filter((type) => {
    if (type === 'abonement') return settingsStore.settings.AbonementEnabled
    if (type === 'abonement_voucher') return vouchersEnabled(settingsStore.settings)
    return true
  })
)

const newItem = ref({
  Description: '',
  ID: 0,
  Image: '' as any,
  Name: '',
  Price: 0,
  Type: 'normal_item',
  LicenseCost: 50,
  LicenseGroup: '',
  AboDurationMonths: 12
})

const needsLicense = computed(() =>
  ['online_issue', 'abonement', 'abonement_voucher'].includes(newItem.value.Type)
)

const isVoucher = computed(() => newItem.value.Type === 'abonement_voucher')

const toast = ref<{ type: string; message: string } | null>(null)

const submitItem = async () => {
  if (needsLicense.value && (!newItem.value.LicenseCost || newItem.value.LicenseCost <= 0)) {
    showToast('error', t('licenseCostRequired'))
    return
  }

  if (needsLicense.value && !newItem.value.LicenseGroup.trim()) {
    showToast('error', t('licenseGroupRequired'))
    return
  }

  if (
    isVoucher.value &&
    (!newItem.value.AboDurationMonths ||
      newItem.value.AboDurationMonths < 1 ||
      newItem.value.AboDurationMonths > 120)
  ) {
    showToast('error', t('aboDurationRequired'))
    return
  }

  try {
    await store
      .createItem(newItem.value as Item)
      .then(() => {
        router.push({ name: 'Backoffice Product Settings' })
      })
      .catch((err) => {
        showToast(
          'error',
          'Produkt konnte nicht angelegt werden. ' + err?.response?.data?.error?.message
        )
      })
  } catch (err: any) {
    showToast('error', 'Produkt konnte nicht angelegt werden: ' + err)
    console.error('Error creating item:', err)
  }
}

const cancel = (e: Event) => {
  e.preventDefault()
  router.go(-1)
}

const showToast = (type: string, message: string) => {
  toast.value = { type, message }

  setTimeout(() => {
    toast.value = null
  }, 5000)
}

const updateImage = (event: any) => {
  const file = event.target.files[0]
  newItem.value.Image = file
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader
        :title="`${$t('newProduct')} ${$t('create')}`"
        show-back
        @back="router.push('/backoffice/productsettings')"
      />
    </template>
    <template #main>
      <Toast v-if="toast" :toast="toast" @close="toast = null" />

      <Card class="section">
        <form @submit.prevent="submitItem">
          <div class="field-grid">
            <FormField :label="$t('itemType')" for="itemType" required>
              <select id="itemType" v-model="newItem.Type" class="aug-input" required>
                <option v-for="type in availableItemTypes" :key="type" :value="type">
                  {{ $t('itemType_' + type) }}
                </option>
              </select>
            </FormField>

            <FormField :label="$t('name')" for="name" required>
              <input id="name" v-model="newItem.Name" type="text" class="aug-input" required />
            </FormField>

            <FormField :label="$t('description')" for="description" required class="field-span-2">
              <input
                id="description"
                v-model="newItem.Description"
                type="text"
                class="aug-input"
                required
              />
            </FormField>

            <FormField :label="`${$t('price')} (Cent)`" for="price" required>
              <input
                id="price"
                v-model="newItem.Price"
                type="number"
                min="1"
                class="aug-input"
                required
              />
            </FormField>

            <template v-if="needsLicense">
              <FormField
                :label="$t('licenseGroup')"
                for="licenseGroup"
                required
                :hint="$t('licenseGroupHint')"
              >
                <input
                  id="licenseGroup"
                  v-model="newItem.LicenseGroup"
                  type="text"
                  class="aug-input"
                  placeholder="z.B. digital_edition"
                  required
                />
              </FormField>

              <FormField
                :label="`${$t('licenseCost')} (Cent)`"
                for="licenseCost"
                required
                :hint="$t('licenseCostHint')"
              >
                <input
                  id="licenseCost"
                  v-model="newItem.LicenseCost"
                  type="number"
                  min="1"
                  class="aug-input"
                  required
                />
              </FormField>

              <FormField
                v-if="isVoucher"
                :label="$t('aboDurationMonths')"
                for="aboDurationMonths"
                required
                :hint="$t('aboDurationMonthsHint')"
              >
                <input
                  id="aboDurationMonths"
                  v-model.number="newItem.AboDurationMonths"
                  type="number"
                  min="1"
                  max="120"
                  class="aug-input"
                  required
                />
              </FormField>
            </template>

            <FormField :label="$t('image')" for="image" class="field-span-2">
              <input
                id="image"
                type="file"
                accept="image/png, image/jpeg"
                class="aug-input"
                @change="updateImage"
              />
            </FormField>
          </div>

          <div class="form-actions">
            <Button variant="ghost" @click="cancel">{{ $t('cancel') }}</Button>
            <Button type="submit" variant="primary">{{ $t('create') }}</Button>
          </div>
        </form>
      </Card>
    </template>
  </component>
</template>

<style scoped>
.section {
  max-width: 640px;
  margin: 0 auto;
}
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}
.field-span-2 {
  grid-column: span 2;
}
.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

@media (max-width: 640px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
  .field-span-2 {
    grid-column: span 1;
  }
}
</style>
