<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">
        {{ $t('newGendered') }} {{ $t('vendorSingular') }} {{ $t('create') }}
      </h1>
    </template>

    <template #main>
      <div class="main">
        <div class="w-full mx-auto mt-4" v-if="!importing">
          <div class="flex place-content-center justify-between">
            <h1 class="text-2xl font-bold">{{ $t('newGendered') }} {{ $t('vendorSingular') }}</h1>
            <button
              @click="router.push('/backoffice/vendorsummary')"
              class="px-2 rounded-full bg-red-600 text-white font-bold"
            >
              X
            </button>
          </div>
          <Toast v-if="toast" :toast="toast" class="fixed top-20 right-5" />
          <form
            @submit.prevent="submitVendor"
            class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div class="mb-4 justify-between grid grid-cols-2 gap-5">
              <div class="row">
                <span class="col">
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="firstName"
                    >{{ $t('firstName') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.FirstName"
                    type="text"
                    id="firstName"
                    required
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="lastName"
                    >{{ $t('lastName') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.LastName"
                    type="text"
                    id="lastName"
                    required
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="email"
                    >Email:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Email"
                    type="email"
                    id="email"
                    required
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="licenseID"
                    >{{ $t('licenseId') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.LicenseID"
                    type="text"
                    id="licenseID"
                    required
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="language"
                    >{{ $t('language') }}:</label
                  >

                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Language"
                    type="text"
                    id="language"
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="telephone"
                    >{{ $t('telephone') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Telephone"
                    type="text"
                    id="telephone"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="address"
                    >{{ $t('address') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Address"
                    type="text"
                    id="address"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="plz"
                    >{{ $t('postCode') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.PLZ"
                    type="text"
                    id="plz"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location"
                    >{{ $t('location') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Location"
                    type="text"
                    id="location"
                  />
                  <label
                    class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                    for="accountDisabled"
                    >{{ $t('accountDeactivation') }}:</label
                  >
                  <div class="flex flex-row">
                    <span class="p-2">
                      <select
                        class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        v-model="newVendor.IsDisabled"
                        id="accountDisabled"
                        required
                      >
                        <option value="true">{{ $t('yes') }}</option>
                        <option value="false">{{ $t('no') }}</option>
                      </select>
                    </span>
                  </div>
                </span>
              </div>
              <div class="row">
                <span class="col">
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="longitude"
                    >{{ $t('longitude') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Longitude"
                    type="text"
                    id="longitude"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="latitude"
                    >{{ $t('latitude') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Latitude"
                    type="text"
                    id="latitude"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="workingTime"
                    >{{ $t('workingTime') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    v-model="newVendor.WorkingTime"
                    id="workingTime"
                  />
                  <label
                    class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                    for="registrationDate"
                    >{{ $t('registrationDate') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="date"
                    v-model="newVendor.RegistrationDate"
                    id="registrationDate"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="vendorSince"
                    >{{ $t('vendorSince') }}:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="date"
                    v-model="newVendor.VendorSince"
                    id="vendorSince"
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="onlineMap"
                    >{{ $t('onlineMap') }}:</label
                  >
                  <div class="flex flex-row">
                    <span class="p-2">
                      <select
                        class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        v-model="newVendor.OnlineMap"
                        id="onlineMap"
                        required
                      >
                        <option value="true">{{ $t('yes') }}</option>
                        <option value="false">{{ $t('no') }}</option>
                      </select>
                    </span>
                  </div>

                  <label
                    class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                    for="hasBankAccount"
                    >{{ $t('bankAccount') }}</label
                  >
                  <div class="flex flex-row">
                    <span class="p-2">
                      <select
                        class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        v-model="newVendor.HasBankAccount"
                        id="hasBankAccount"
                        required
                      >
                        <option value="true">{{ $t('yes') }}</option>
                        <option value="false">{{ $t('no') }}</option>
                      </select>
                    </span>
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="hasSmartphone"
                    >Smartphone:</label
                  >

                  <div class="flex flex-row">
                    <span class="p-2">
                      <select
                        class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        v-model="newVendor.HasBankAccount"
                        id="hasBankAccount"
                        required
                      >
                        <option value="true">{{ $t('yes') }}</option>
                        <option value="false">{{ $t('no') }}</option>
                      </select>
                    </span>
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="comment"
                    >{{ $t('comment') }}:</label
                  >
                  <textarea
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="text"
                    v-model="newVendor.Comment"
                    id="comment"
                  ></textarea>
                </span>
              </div>
            </div>

            <div class="flex place-content-center">
              <button type="submit" class="p-3 rounded-full bg-lime-600 text-white">
                {{ $t('create') }}
              </button>
            </div>
            <Toast v-if="toast" :toast="toast" />
          </form>
        </div>
        <div v-else>
          importiere {{ store.vendorsImportedCount }}/{{ importingVendorsCount }}
          {{ $t('menuVendors') }}
        </div>
      </div>
      <footer>
        <button
          @click="importCSV"
          className="p-3 rounded-full bg-lime-600 text-white fixed bottom-10 right-10 h-20 w-20"
        >
          CSV import
        </button>
      </footer>
    </template>
  </component>
</template>

<script lang="ts" setup>
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import type { Vendor } from '@/stores/vendor'
import { vendorsStore } from '@/stores/vendor'
import { ref } from 'vue'

const store = vendorsStore()

const newVendor = ref<Vendor>({
  Email: '@augustin.or.at',
  FirstName: '',
  ID: 0,
  KeycloakID: '',
  LastName: '',
  LastPayout: null,
  LicenseID: '',
  UrlID: '',
  Balance: 0,
  IsDisabled: false,
  Longitude: 0,
  Latitude: 0,
  Address: '',
  PLZ: '',
  Location: '',
  WorkingTime: '',
  Language: '',
  Comment: '',
  Telephone: '',
  RegistrationDate: '2023-10-05',
  VendorSince: '2023-10-05',
  OnlineMap: false,
  HasSmartphone: false,
  HasBankAccount: false,
  OpenPayments: [
    {
      Amount: 0,
      AuthorizedBy: '',
      Id: 0,
      IsPayoutFor: [],
      IsSale: false,
      Item: 0,
      Order: 0,
      OrderEntry: 0,
      Payout: 0,
      Price: 0,
      Quantity: 0,
      Receiver: 0,
      ReceiverName: '',
      Sender: 0,
      SenderName: '',
      Timestamp: ''
    }
  ]
})

const toast = ref<{ type: string; message: string } | null>(null)
const importing = ref(false)
const importingVendorsCount = ref(0)

const submitVendor = async () => {
  if (!newVendor.value) return
  if (!newVendor.value.Email || newVendor.value.Email === '@augustin.or.at') {
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
  if (
    newVendor.value.WorkingTime.length > 1 ||
    !['V', 'N', 'G'].includes(newVendor.value.WorkingTime.toUpperCase())
  ) {
    showToast('error', 'Die Arbeitszeit muss in der Form V,N oder G angegeben werden')
    return
  }
  try {
    await store.createVendorPromise(newVendor.value as Vendor).then((res: any) => {
      router.push(`/backoffice/vendorsummary/${res.ID}`)
    })
  } catch (err: any) {
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
        HasBankAccount
      ] = line.split(';')
      const Email = `${LicenseID}@augustin.or.at`
      return {
        Email,
        LicenseID,
        FirstName,
        LastName,
        LastPayout: null,
        UrlID: '',
        IsDisabled: false,
        Latitude: 0,
        Longitude: 0,
        PLZ,
        Location,
        Language,
        Telephone,
        RegistrationDate,
        VendorSince,
        Comment,
        OnlineMap: OnlineMap === 'Ja' || OnlineMap === 'ja' || OnlineMap === 'yes' ? true : false,
        HasSmartphone:
          HasSmartphone === 'Ja' || HasSmartphone === 'ja' || HasSmartphone === 'yes'
            ? true
            : false,
        HasBankAccount:
          HasBankAccount === 'Ja' || HasBankAccount === 'ja' || HasBankAccount === 'yes'
            ? true
            : false,
        Address,
        WorkingTime
      }
    })
    try {
      importing.value = true
      importingVendorsCount.value = vendors.length
      await store.createVendors(vendors)
      showToast('success', 'VerkäuferInnen erfolgreich angelegt')
      importing.value = false
    } catch (err) {
      console.error('Error creating vendors:', err)
      showToast('error', 'VerkäuferInnen konnten nicht angelegt werden')
      importing.value = false
    }
  }
  input.click()
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
