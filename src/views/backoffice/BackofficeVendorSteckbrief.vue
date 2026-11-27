<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import router from '@/router'
import { useSettingsStore } from '@/stores/settings'
import { useAuthLoad } from '@/composables/useAuthLoad'
import {
  deleteVendorSteckbriefImage,
  fetchVendorSteckbrief,
  updateVendorSteckbrief,
  uploadVendorSteckbriefImage,
  type VendorSteckbrief
} from '@/api/api'
import { settingsImageUrl } from '@/utils/settingsImage'
import { faCamera, faPrint, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import FormField from '@/components/ui/FormField.vue'
import SteckbriefSheet from '@/components/SteckbriefSheet.vue'

type TextField = 'Description' | 'Family' | 'Residence' | 'Education' | 'CareerGoal' | 'Support'

const MAX_TEXT = 2000

const { t } = useI18n()
const route = useRoute()
const settingsStore = useSettingsStore()

const vendorId = computed(() => parseInt(route.params.ID?.toString() ?? ''))
const enabled = computed(() => !!settingsStore.settings.SteckbriefEnabled)

const steckbrief = ref<VendorSteckbrief | null>(null)
const loadFailed = ref(false)
const saving = ref(false)
const uploading = ref(false)
const status = ref<{ ok: boolean; text: string } | null>(null)
const fileInput = ref<HTMLInputElement | null>(null)

const fields = computed<{ key: TextField; label: string; multiline: boolean }[]>(() => [
  { key: 'Description', label: t('steckbriefDescription'), multiline: true },
  { key: 'Family', label: t('steckbriefFamily'), multiline: true },
  { key: 'Residence', label: t('steckbriefResidence'), multiline: false },
  { key: 'Education', label: t('steckbriefEducation'), multiline: false },
  { key: 'CareerGoal', label: t('steckbriefCareerGoal'), multiline: false },
  { key: 'Support', label: t('steckbriefSupport'), multiline: true }
])

const photoUrl = computed(() =>
  steckbrief.value?.Image ? settingsImageUrl(steckbrief.value.Image, '') : ''
)

const initials = computed(() =>
  steckbrief.value
    ? `${steckbrief.value.FirstName.charAt(0)}${steckbrief.value.LastName.charAt(0)}`.toUpperCase()
    : ''
)

useAuthLoad(async () => {
  await settingsStore.getSettingsFromApi()

  if (!vendorId.value || !enabled.value) return

  try {
    const res = await fetchVendorSteckbrief(vendorId.value)
    steckbrief.value = res.data
  } catch {
    loadFailed.value = true
  }
})

const save = async () => {
  if (!steckbrief.value || saving.value) return
  saving.value = true
  status.value = null

  try {
    const res = await updateVendorSteckbrief(vendorId.value, steckbrief.value)
    steckbrief.value = res.data
    status.value = { ok: true, text: t('steckbriefSaved') }
  } catch {
    status.value = { ok: false, text: t('steckbriefSaveFailed') }
  } finally {
    saving.value = false
  }
}

const onPhotoSelected = async (event: Event) => {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file || !steckbrief.value) return
  uploading.value = true
  status.value = null

  try {
    const res = await uploadVendorSteckbriefImage(vendorId.value, file)
    steckbrief.value.Image = res.data.Image
  } catch {
    status.value = { ok: false, text: t('steckbriefPhotoFailed') }
  } finally {
    uploading.value = false
  }
}

const printSheet = () => window.print()

const removePhoto = async () => {
  if (!steckbrief.value || !window.confirm(t('steckbriefRemovePhotoConfirm'))) return
  uploading.value = true
  status.value = null

  try {
    const res = await deleteVendorSteckbriefImage(vendorId.value)
    steckbrief.value.Image = res.data.Image
  } catch {
    status.value = { ok: false, text: t('steckbriefPhotoFailed') }
  } finally {
    uploading.value = false
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader
        :title="`${$t('steckbrief')} ${steckbrief?.LicenseID ?? ''}`"
        show-back
        @back="router.push(`/backoffice/userprofile/${vendorId}`)"
      >
        <Button v-if="steckbrief" variant="secondary" @click="printSheet">
          <font-awesome-icon :icon="faPrint" /> {{ $t('print') }}
        </Button>
      </PageHeader>
    </template>

    <template #main>
      <Card v-if="!enabled">
        <p class="empty">{{ $t('steckbriefDisabled') }}</p>
      </Card>
      <Card v-else-if="loadFailed">
        <p class="empty">{{ $t('steckbriefLoadFailed') }}</p>
      </Card>
      <div v-else-if="!steckbrief" aria-busy="true">
        <Card><span class="aug-skeleton" style="width: 240px; height: 44px" /></Card>
      </div>

      <div v-else class="steckbrief-page">
        <Card class="steckbrief-form">
          <form @submit.prevent="save">
            <FormField :label="$t('steckbriefPhoto')" :hint="$t('steckbriefPhotoHint')">
              <div class="photo-row">
                <div class="photo-thumb">
                  <img v-if="photoUrl" :src="photoUrl" alt="" />
                  <span v-else aria-hidden="true">{{ initials }}</span>
                </div>
                <div class="photo-actions">
                  <input
                    ref="fileInput"
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    class="visually-hidden"
                    @change="onPhotoSelected"
                  />
                  <Button variant="secondary" :disabled="uploading" @click="fileInput?.click()">
                    <font-awesome-icon :icon="faCamera" />
                    {{
                      steckbrief.Image ? $t('steckbriefReplacePhoto') : $t('steckbriefUploadPhoto')
                    }}
                  </Button>
                  <Button
                    v-if="steckbrief.Image"
                    variant="ghost"
                    :disabled="uploading"
                    @click="removePhoto"
                  >
                    <font-awesome-icon :icon="faTrash" /> {{ $t('steckbriefRemovePhoto') }}
                  </Button>
                </div>
              </div>
            </FormField>

            <FormField
              v-for="field in fields"
              :key="field.key"
              :label="field.label"
              :for="`steckbrief-${field.key}`"
            >
              <textarea
                v-if="field.multiline"
                :id="`steckbrief-${field.key}`"
                v-model="steckbrief[field.key]"
                class="aug-input"
                rows="3"
                :maxlength="MAX_TEXT"
              />
              <input
                v-else
                :id="`steckbrief-${field.key}`"
                v-model="steckbrief[field.key]"
                type="text"
                class="aug-input"
                :maxlength="MAX_TEXT"
              />
            </FormField>

            <div class="form-actions">
              <Button type="submit" :disabled="saving">{{ $t('save') }}</Button>
              <span v-if="status" :class="status.ok ? 'status-ok' : 'status-error'" role="status">
                {{ status.text }}
              </span>
            </div>
          </form>
        </Card>

        <!-- The sheet itself; this is the only part that is printed -->
        <div class="sheet-paper">
          <SteckbriefSheet :steckbrief="steckbrief" />
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.empty {
  margin: 0;
  color: var(--color-text-muted);
}

.steckbrief-page {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 20px;
  align-items: start;
}
@media (max-width: 1099.98px) {
  .steckbrief-page {
    grid-template-columns: minmax(0, 1fr);
  }
}

.steckbrief-form form {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.steckbrief-form textarea {
  resize: vertical;
  min-height: 72px;
}

.photo-row {
  display: flex;
  align-items: center;
  gap: 16px;
  flex-wrap: wrap;
}
.photo-thumb {
  width: 84px;
  height: 100px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-bg);
  border: 1px solid var(--color-border);
  color: var(--color-text-muted);
  font-weight: 700;
  font-size: 22px;
}
.photo-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.photo-actions {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}
.visually-hidden {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

.form-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
.status-ok {
  font-size: 13.5px;
  color: var(--color-success);
}
.status-error {
  font-size: 13.5px;
  color: var(--color-danger);
}

/* The sheet is a printed document, so it keeps its light colours in dark mode */
.sheet-paper {
  background: #fff;
  color: #000;
  border-radius: var(--radius);
  padding: 28px;
  box-shadow: 0 1px 3px rgb(0 0 0 / 12%);
}

@media print {
  .sheet-paper {
    box-shadow: none;
    padding: 0;
  }
  @page {
    size: A4;
    margin: 18mm;
  }
  .steckbrief-form {
    display: none;
  }
  .steckbrief-page {
    display: block;
  }
}
</style>

<style>
/* Print only the sheet, without the page header of the backoffice layout */
@media print {
  body:has(.sheet) .header-slot {
    display: none !important;
  }
}
</style>
