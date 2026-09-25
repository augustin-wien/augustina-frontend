<script lang="ts" setup>
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import { useSettingsStore } from '@/stores/settings'
import type { Vendor } from '@/stores/vendor'
import { vendorsStore } from '@/stores/vendor'
import { ref } from 'vue'
import { downloadVendorCsvTemplate, parseVendorsCsv } from '@/utils/vendorCsv'
import { faFileCsv, faFileImport } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import FormField from '@/components/ui/FormField.vue'

const store = vendorsStore()
const settingsStore = useSettingsStore()

const newVendor = ref<Vendor>({
  Email: settingsStore.settings.VendorEmailPostfix,
  FirstName: '',
  ID: 0,
  KeycloakID: '',
  LastName: '',
  LastPayout: null,
  LicenseID: '',
  UrlID: '',
  Balance: 0,
  IsDisabled: false,
  Language: '',
  Telephone: '',
  Locations: [],
  Comments: [],
  RegistrationDate: new Date().toISOString().split('T')[0] || '',
  VendorSince: new Date().toISOString().split('T')[0] || '',
  OnlineMap: false,
  HasSmartphone: false,
  HasBankAccount: false,
  OpenPayments: null,
  AccountProofUrl: null,
  IsDeleted: false,
  IsBlocked: false,
  BlockedNote: '',
  Debt: ''
})

const toast = ref<{ type: string; message: string } | null>(null)
const importing = ref(false)
const importingVendorsCount = ref(0)

const submitVendor = async () => {
  if (!newVendor.value) return

  if (
    !newVendor.value.Email ||
    newVendor.value.Email === '@' + import.meta.env.VITE_VENDOR_EMAIL_POSTFIX
  ) {
    showToast('error', 'Email muss angegeben werden')
    return
  }

  if (!newVendor.value.FirstName) {
    showToast('error', 'Vorname muss angegeben werden')
    return
  }

  if (!newVendor.value.LastName) {
    showToast('error', 'Nachname muss angegeben werden')
    return
  }

  if (!newVendor.value.LicenseID) {
    showToast('error', 'Lizenznummer muss angegeben werden')
    return
  }

  try {
    await store.createVendorPromise(newVendor.value as Vendor).then(() => {
      router.push(`/backoffice/vendorsummary/`)
    })
  } catch (err: any) {
    // eslint-disable-next-line no-console
    console.error('Error creating vendor:', err)

    showToast(
      'error',
      'VerkäuferIn konnte nicht angelegt werden ' + err.response.data.error.message
    )
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

const importCSV = async () => {
  //  create file dialog
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = '.csv'

  input.onchange = async (event: any) => {
    const file = event.target.files[0]
    const text = await file.text()

    const vendors = parseVendorsCsv(text, settingsStore.settings.VendorEmailPostfix)

    try {
      importing.value = true
      importingVendorsCount.value = vendors.length
      await store.createVendors(vendors)
      showToast('success', 'VerkäuferInnen erfolgreich angelegt')
      importing.value = false
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('Error creating vendors:', err)
      showToast('error', 'VerkäuferInnen konnten nicht angelegt werden')
      importing.value = false
    }
  }

  input.click()
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader
        :title="`${$t('newGendered')} ${$t('vendorSingular')} ${$t('create')}`"
        show-back
        @back="router.push('/backoffice/vendorsummary')"
      />
    </template>

    <template #main>
      <Toast v-if="toast" :toast="toast" @close="toast = null" />

      <template v-if="!importing">
        <Card class="section">
          <form @submit.prevent="submitVendor">
            <div class="field-grid">
              <FormField :label="$t('firstName')" for="firstName" required>
                <input
                  id="firstName"
                  v-model="newVendor.FirstName"
                  type="text"
                  class="aug-input"
                  required
                />
              </FormField>

              <FormField :label="$t('lastName')" for="lastName" required>
                <input
                  id="lastName"
                  v-model="newVendor.LastName"
                  type="text"
                  class="aug-input"
                  required
                />
              </FormField>

              <FormField label="Email" for="email" required>
                <input
                  id="email"
                  v-model="newVendor.Email"
                  type="email"
                  class="aug-input"
                  required
                />
              </FormField>

              <FormField :label="$t('licenseId')" for="licenseID" required>
                <input
                  id="licenseID"
                  v-model="newVendor.LicenseID"
                  type="text"
                  class="aug-input"
                  required
                />
              </FormField>

              <FormField :label="$t('language')" for="language">
                <input id="language" v-model="newVendor.Language" type="text" class="aug-input" />
              </FormField>

              <FormField :label="$t('telephone')" for="telephone">
                <input id="telephone" v-model="newVendor.Telephone" type="text" class="aug-input" />
              </FormField>

              <FormField :label="$t('registrationDate')" for="registrationDate">
                <input
                  id="registrationDate"
                  v-model="newVendor.RegistrationDate"
                  type="date"
                  class="aug-input"
                />
              </FormField>

              <FormField :label="$t('vendorSince')" for="vendorSince">
                <input
                  id="vendorSince"
                  v-model="newVendor.VendorSince"
                  type="date"
                  class="aug-input"
                />
              </FormField>

              <FormField :label="$t('verificationLink')" for="verification">
                <input
                  id="verification"
                  v-model="newVendor.AccountProofUrl"
                  type="text"
                  class="aug-input"
                />
              </FormField>

              <FormField :label="$t('debt')" for="debt">
                <input id="debt" v-model="newVendor.Debt" type="text" class="aug-input" />
              </FormField>

              <FormField :label="$t('address')" class="field-span-2">
                <p class="hint-text">
                  {{
                    $t(
                      'You will only be able to add comments and locations for the vendor once the vendor has been created.'
                    )
                  }}
                </p>
              </FormField>
            </div>

            <div class="field-stack toggle-stack">
              <label class="aug-toggle">
                <input id="hasBankAccount" v-model="newVendor.HasBankAccount" type="checkbox" />
                <span class="aug-toggle-track"></span>
                <span>{{ $t('bankAccount') }}</span>
              </label>
              <label class="aug-toggle">
                <input id="hasSmartphone" v-model="newVendor.HasSmartphone" type="checkbox" />
                <span class="aug-toggle-track"></span>
                <span>{{ $t('Has a smartphone') }}</span>
              </label>
              <label class="aug-toggle">
                <input id="accountDisabled" v-model="newVendor.IsDisabled" type="checkbox" />
                <span class="aug-toggle-track"></span>
                <span>{{ $t('accountDeactivation') }}</span>
              </label>
            </div>

            <div class="form-actions">
              <Button type="submit" variant="primary">{{ $t('create') }}</Button>
            </div>
          </form>
        </Card>
      </template>
      <div v-else class="importing-status">
        importiere {{ store.vendorsImportedCount }}/{{ importingVendorsCount }}
        {{ $t('menuVendors') }}
      </div>

      <footer class="csv-footer">
        <Button variant="secondary" @click="downloadVendorCsvTemplate">
          <font-awesome-icon :icon="faFileCsv" /> {{ $t('downloadDemoCSV') }}
        </Button>
        <Button variant="secondary" @click="importCSV">
          <font-awesome-icon :icon="faFileImport" /> {{ $t('CSV import') }}
        </Button>
      </footer>
    </template>
  </component>
</template>

<style scoped>
.section {
  max-width: 720px;
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
.hint-text {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}
.field-stack {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.toggle-stack {
  margin-top: 20px;
}
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
.importing-status {
  text-align: center;
  color: var(--color-text-muted);
  padding: 40px 0;
}
.csv-footer {
  position: fixed;
  bottom: 40px;
  right: 40px;
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 12px;
}

@media (max-width: 640px) {
  .field-grid {
    grid-template-columns: 1fr;
  }
  .field-span-2 {
    grid-column: span 1;
  }
  .csv-footer {
    position: static;
    align-items: stretch;
    margin: 20px auto 0;
    max-width: 720px;
  }
}
</style>
