<script lang="ts" setup>
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import { useSettingsStore } from '@/stores/settings'
import type { Vendor } from '@/stores/vendor'
import { vendorsStore } from '@/stores/vendor'
import { ref } from 'vue'
import IconCross from '@/components/icons/IconCross.vue'
import { transformToFloat } from '@/utils/utils'

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
    const lines = text.split('\n')

    const vendors: Array<Vendor> = lines.map((line: any, i: number) => {
      if (i === 0) return null

      //@ts-ignore
      const [
        PLZ,
        Location,
        Address,
        Longitude,
        Latitude,
        WorkingTime,
        LicenseID,
        FirstName,
        LastName,
        Telephone,
        Language,
        RegistrationDate,
        VendorSince,
        Comment,
        OnlineMap,
        HasSmartphone,
        HasBankAccount,
        Debt
      ] = line.split(';')

      const Email = `${LicenseID}${settingsStore.settings.VendorEmailPostfix}`
      return {
        PLZ,
        Location,
        Address,
        Longitude: Longitude === '' ? 0.1 : transformToFloat(Longitude),
        Latitude: Latitude === '' ? 0.1 : transformToFloat(Latitude),
        WorkingTime: WorkingTime === '' ? 'G' : WorkingTime,
        LicenseID,
        FirstName,
        LastName,
        Telephone,
        Language,
        RegistrationDate,
        VendorSince,
        Comment,
        LastPayout: null,
        UrlID: '',
        OnlineMap: OnlineMap === 'Ja' || OnlineMap === 'ja' || OnlineMap === 'yes' ? true : false,
        HasSmartphone:
          HasSmartphone === 'Ja' || HasSmartphone === 'ja' || HasSmartphone === 'yes'
            ? true
            : false,
        HasBankAccount:
          HasBankAccount === 'Ja' || HasBankAccount === 'ja' || HasBankAccount === 'yes'
            ? true
            : false,
        IsDisabled: false,
        Email,
        Debt
      }
    })

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
      <h1 className="font-bold mt-3 pt-3 text-2xl">
        {{ $t('newGendered') }} {{ $t('vendorSingular') }} {{ $t('create') }}
      </h1>
    </template>

    <template #main>
      <div class="main">
        <div v-if="!importing" class="w-full mx-auto mt-4">
          <div class="flex place-content-center justify-between">
            <h1 class="text-2xl font-bold">{{ $t('newGendered') }} {{ $t('vendorSingular') }}</h1>
            <button
              class="rounded-full font-bold bg-red-600"
              @click="router.push('/backoffice/vendorsummary')"
            >
              <IconCross />
            </button>
          </div>
          <Toast v-if="toast" :toast="toast" @close="toast=null"/>
          <form
            class="bg-white shadow-md rounded px-8 pt-6 pb-8 mt-4"
            @submit.prevent="submitVendor"
          >
            <div class="mb-4 justify-between grid grid-cols-2 gap-5">
              <div class="row">
                <span class="col">
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="firstName"
                    >{{ $t('firstName') }}:</label
                  >
                  <input
                    id="firstName"
                    v-model="newVendor.FirstName"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="lastName"
                    >{{ $t('lastName') }}:</label
                  >
                  <input
                    id="lastName"
                    v-model="newVendor.LastName"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="email"
                    >Email:</label
                  >
                  <input
                    id="email"
                    v-model="newVendor.Email"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="email"
                    required
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="licenseID"
                    >{{ $t('licenseId') }}:</label
                  >
                  <input
                    id="licenseID"
                    v-model="newVendor.LicenseID"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    required
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="language"
                    >{{ $t('language') }}:</label
                  >

                  <input
                    id="language"
                    v-model="newVendor.Language"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="telephone"
                    >{{ $t('telephone') }}:</label
                  >
                  <input
                    id="telephone"
                    v-model="newVendor.Telephone"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="address"
                    >{{ $t('address') }}:</label
                  >
                  <div class="hint font-bold">
                    <p>
                      {{
                        $t(
                          'You will only be able to add comments and locations for the vendor once the vendor has been created.'
                        )
                      }}
                    </p>
                  </div>
                </span>
              </div>
              <div class="row">
                <span class="col">
                  <label
                    class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                    for="registrationDate"
                    >{{ $t('registrationDate') }}:</label
                  >
                  <input
                    id="registrationDate"
                    v-model="newVendor.RegistrationDate"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="date"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="vendorSince"
                    >{{ $t('vendorSince') }}:</label
                  >
                  <input
                    id="vendorSince"
                    v-model="newVendor.VendorSince"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="date"
                  />

                  <label
                    class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                    for="hasBankAccount"
                    >{{ $t('bankAccount') }}</label
                  >
                  <div class="flex flex-row">
                    <span class="p-2">
                      <select
                        id="hasBankAccount"
                        v-model="newVendor.HasBankAccount"
                        class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option :value="true">{{ $t('yes') }}</option>
                        <option :value="false">{{ $t('no') }}</option>
                      </select>
                    </span>
                  </div>
                  <label
                    class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                    for="hasSmartphone"
                    >{{ $t('Has a smartphone') }}</label
                  >

                  <div class="flex flex-row">
                    <span class="p-2">
                      <select
                        id="hasSmartphone"
                        v-model="newVendor.HasSmartphone"
                        class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option :value="true">{{ $t('yes') }}</option>
                        <option :value="false">{{ $t('no') }}</option>
                      </select>
                    </span>
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="email"
                    >{{ $t('verificationLink') }}:</label
                  >
                  <input
                    id="verification"
                    v-model="newVendor.AccountProofUrl"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                  />
                  <label
                    class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                    for="accountDisabled"
                    >{{ $t('accountDeactivation') }}:</label
                  >
                  <div class="flex flex-row">
                    <span class="p-2">
                      <select
                        id="accountDisabled"
                        v-model="newVendor.IsDisabled"
                        class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        required
                      >
                        <option :value="true">{{ $t('yes') }}</option>
                        <option :value="false">{{ $t('no') }}</option>
                      </select>
                    </span>
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="debt"
                    >{{ $t('debt') }}:</label
                  >
                  <input
                    id="debt"
                    v-model="newVendor.Debt"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                  />
                </span>
              </div>
            </div>

            <div class="flex place-content-center">
              <button type="submit" class="p-3 rounded-full customcolor">
                {{ $t('create') }}
              </button>
            </div>
            <Toast v-if="toast" :toast="toast" @close="toast=null"/>
          </form>
        </div>
        <div v-else>
          importiere {{ store.vendorsImportedCount }}/{{ importingVendorsCount }}
          {{ $t('menuVendors') }}
        </div>
      </div>
      <footer>
        <button
          className="p-3 rounded-full customcolor fixed bottom-10 right-10 h-20 w-20"
          @click="importCSV"
        >
          {{ $t('CSV import') }}
        </button>
      </footer>
    </template>
  </component>
</template>

<style>
tr {
  padding: 10px;
}

td {
  padding: 10px;
}
</style>
