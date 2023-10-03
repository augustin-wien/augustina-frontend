<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">Neue/n VerkäuferIn anlegen</h1>
    </template>

    <template #main>
      <div class="main">
        <div class="w-full mx-auto mt-4" v-if="!importing">
          <div class="flex place-content-center justify-between">
            <h1 class="text-2xl font-bold">Neue/n VerkäuferIn</h1>
            <button
              @click="router.push('/backoffice/vendorsummary')"
              class="px-2 rounded-full bg-red-600 text-white font-bold"
            >
              X
            </button>
          </div>
          <form
            @submit.prevent="submitVendor"
            class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div class="mb-4 justify-between grid grid-cols-2 gap-5">
              <div class="row">
                <span class="col">
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="firstName"
                    >Vorname:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.FirstName"
                    type="text"
                    id="firstName"
                    required
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="lastName"
                    >Nachname:</label
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
                    >Lizenznummer:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.LicenseID"
                    type="text"
                    id="licenseID"
                    required
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="language"
                    >Sprache:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Language"
                    type="text"
                    id="language"
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="telephone"
                    >Telefonnummer:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Telephone"
                    type="text"
                    id="telephone"
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="address"
                    >Adresse:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Address"
                    type="text"
                    id="address"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="plz"
                    >Postleitzahl:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.PLZ"
                    type="text"
                    id="plz"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location"
                    >Ort:</label
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
                    >Account deaktiviert:</label
                  >
                  <div class="flex flex-row">
                    <span class="p-2">
                      <select
                        class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        v-model="newVendor.IsDisabled"
                        id="accountDisabled"
                        required
                      >
                        <option value="true">Ja</option>
                        <option value="false">Nein</option>
                      </select>
                    </span>
                  </div>
                </span>
              </div>
              <div class="row">
                <span class="col">
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="longitude"
                    >Längengrad:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Longitude"
                    type="text"
                    id="longitude"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="latitude"
                    >Breitengrad:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="newVendor.Latitude"
                    type="text"
                    id="latitude"
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="workingTime"
                    >Arbeitszeit:</label
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
                    >Registriert seit:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="date"
                    v-model="newVendor.RegistrationDate"
                    id="registrationDate"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="vendorSince"
                    >VerkäuferIn seit:</label
                  >
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="date"
                    v-model="newVendor.VendorSince"
                    id="vendorSince"
                  />

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="onlineMap"
                    >Online Map:</label
                  >
                  <div class="flex flex-row">
                    <span class="p-2">
                      <select
                        class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        v-model="newVendor.OnlineMap"
                        id="onlineMap"
                        required
                      >
                        <option value="true">Ja</option>
                        <option value="false">Nein</option>
                      </select>
                    </span>
                  </div>

                  <label
                    class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                    for="hasBankAccount"
                    >Bankkonto</label
                  >
                  <div class="flex flex-row">
                    <span class="p-2">
                      <select
                        class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                        v-model="newVendor.HasBankAccount"
                        id="hasBankAccount"
                        required
                      >
                        <option value="true">Ja</option>
                        <option value="false">Nein</option>
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
                        <option value="true">Ja</option>
                        <option value="false">Nein</option>
                      </select>
                    </span>
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="comment"
                    >Kommentar:</label
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
              <button type="submit" class="p-3 rounded-full bg-lime-600 text-white">Anlegen</button>
            </div>
          </form>
          <Toast v-if="toast" :toast="toast" />
        </div>
        <div v-else>
          importiere {{ store.vendorsImportedCount }}/{{ importingVendorsCount }} VerkäuferInnen
        </div>
      </div>
      <footer>
        <button
          @click="importCSV"
          className="p-3 rounded-full bg-lime-600 text-white absolute bottom-10 right-10 h-20 w-20"
        >
          CSV import
        </button>
      </footer>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'

const store = vendorsStore()

const newVendor = ref<Vendor>({
  Email: 'new@example.com',
  FirstName: 'Leonie',
  ID: 0,
  KeycloakID: 'new-keycloak-id',
  LastName: 'Löwenherz',
  LastPayout: null,
  LicenseID: 'new-license-id',
  UrlID: 'no-id',
  Balance: 0,
  IsDisabled: false,
  Longitude: 0,
  Latitude: 0,
  Address: 'new-address',
  PLZ: 'new-plz',
  Location: 'new-location',
  WorkingTime: 'new-working-time',
  Language: 'deutsch',
  Comment: 'Kommentare',
  Telephone: 'new-phone-number',
  RegistrationDate: '2023-10-05',
  VendorSince: '2023-10-05',
  OnlineMap: false,
  HasSmartphone: false,
  HasBankAccount: false
})

const toast = ref<{ type: string; message: string } | null>(null)
const importing = ref(false)
const importingVendorsCount = ref(0)

const submitVendor = async () => {
  try {
    await store.createVendor(newVendor.value as Vendor)
    showToast('success', 'VerkäuferIn erfolgreich angelegt')
  } catch (err) {
    console.error('Error creating vendor:', err)
    showToast('error', 'VerkäuferIn konnte nicht angelegt werden')
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
        PhoneNumber,
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
        PhoneNumber,
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
