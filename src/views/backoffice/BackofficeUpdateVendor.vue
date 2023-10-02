<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">VerkäuferIn bearbeiten</h1></template
    >
    <template #main>
      <div class="main">
        <div class="w-full max-w-md mx-auto mt-4" v-if="vendor">
          <div class="flex place-content-center justify-between">
            <h1 class="text-2xl font-bold">{{ vendor.LicenseID }} ändern</h1>
            <button
              @click="router.push('/backoffice/vendorsummary')"
              class="px-2 rounded-full bg-red-600 text-white font-bold"
            >
              X
            </button>
          </div>
        </div>

        <form @submit.prevent="updateVendor" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div class="mb-4">
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="firstName"
              >Vorname:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.FirstName }} </span>
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.FirstName"
                type="text"
                id="firstName"
                required
              />
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="lastName"
              >Nachname:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.LastName }} </span>

              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.LastName"
                type="text"
                id="lastName"
                required
              />
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="email"
              >Email:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.Email }} </span>

              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.Email"
                type="email"
                id="email"
                required
              />
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="licenseID"
              >Lizenznummer:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.LicenseID }} </span>

              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.LicenseID"
                type="text"
                id="licenseID"
                required
              />
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="workingTime"
              >Deaktiviert:</label
            >
            <div class="flex flex-row">
              <span class="p-2"> {{ vendor.IsDisabled }} </span>
              <select
                class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.IsDisabled"
                id="onlineMap"
                required
              >
                <option value="true">Ja</option>
                <option value="false">Nein</option>
              </select>
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="adress"
              >Standplatz-Adresse:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.Address }} </span>

              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.Address"
                type="text"
                id="adress"
                required
              />
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="plz"
              >Postleitzahl:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.PLZ }} </span>

              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.PLZ"
                type="text"
                id="plz"
              />
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location"
              >Ort:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.Location }} </span>

              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.Location"
                type="text"
                id="location"
              />
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="telephone"
              >Telefonnummer:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.Telephone }} </span>
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.Telephone"
                type="text"
                id="telephone"
              />
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="hasSmartphone"
              >Smartphone:</label
            >
            <div class="flex flex-row">
              <span class="p-2"> {{ vendor.HasSmartphone }} </span>
              <select
                class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.HasSmartphone"
                id="hasSmartphone"
                required
              >
                <option value="true">Ja</option>
                <option value="false">Nein</option>
              </select>
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="workingTime"
              >Arbeitszeit:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.WorkingTime }} </span>
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.WorkingTime"
                type="text"
                id="workingTime"
              />
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="language"
              >Sprache:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.Language }} </span>
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.Language"
                type="text"
                id="language"
                required
              />
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="onlineMap"
              >Online Karte:</label
            >
            <div class="flex flex-row">
              <span class="p-2"> {{ vendor.OnlineMap }} </span>
              <select
                class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.OnlineMap"
                id="onlineMap"
                required
              >
                <option value="true">Ja</option>
                <option value="false">Nein</option>
              </select>
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="hasBankAccount"
              >Bankkonto:</label
            >
            <div class="flex flex-row">
              <span class="p-2"> {{ vendor.HasBankAccount }} </span>
              <select
                class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.HasBankAccount"
                id="hasbankAccount"
                required
              >
                <option value="true">Ja</option>
                <option value="false">Nein</option>
              </select>
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="registrationDate"
              >Registriert am:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.RegistrationDate }} </span>
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.RegistrationDate"
                type="text"
                id="registrationDate"
              />
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="vendorSince"
              >Verkauft seit:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.VendorSince }} </span>
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="updatedVendor.VendorSince"
                type="text"
                id="vendorSince"
              />
            </div>
            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="longitude"
              >Längengrad:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.Longitude }} </span>
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="5"
                v-model="updatedVendor.Longitude"
                type="text"
                id="longitude"
              />
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="latitude"
              >Breitengrad:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.Latitude }} </span>
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="5"
                v-model="updatedVendor.Latitude"
                type="text"
                id="latitude"
              />
            </div>

            <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="comment"
              >Kommentar:</label
            >
            <div class="flex flex-row">
              <span class="p-2">{{ vendor.Comment }} </span>
              <textarea
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                rows="5"
                v-model="updatedVendor.Comment"
                type="text"
                id="comment"
              ></textarea>
            </div>
          </div>

          <div class="flex place-content-center justify-between">
            <button
              type="submit"
              class="p-3 rounded-full bg-lime-600 text-white"
              @click="updateVendor"
            >
              Bestätigen
            </button>
            <button
              type="submit"
              class="p-3 rounded-full bg-red-600 text-white"
              @click="deleteVendor"
            >
              Löschen
            </button>
          </div>
        </form>
        <Toast v-if="toast" :toast="toast" />
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { useRoute } from 'vue-router'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'

const store = vendorsStore()

const updatedVendor = ref({
  Account: 0,
  Email: 'new@example.com',
  FirstName: 'Leonie',
  ID: 0,
  KeycloakID: 'new-keycloak-id',
  LastName: 'Löwenherz',
  LastPayout: null,
  LicenseID: 'new-license-id',
  UrlID: 'new-url-id',
  Balance: 0,
  IsDisabled: false,
  Longitude: 0,
  Latitude: 0,
  Address: '',
  PLZ: 'new-plz',
  Location: 'new-location',
  WorkingTime: 'new-working-time',
  Language: 'deutsch',
  Comment: 'Kommentare',
  Telephone: 'new-phone-number',
  RegistrationDate: '2023-10-05',
  VendorSince: '2023-10-05',
  OnlineMap: false,
  HasSmartphone: false
})

store.getVendors()
const vendors = computed(() => store.vendors)

const route = useRoute()
const idparams = route.params.ID

const vendor = computed(() => {
  const numericIdParams = Number(idparams) // Convert the string to a number or NaN
  if (!isNaN(numericIdParams)) {
    let v = vendors.value.find((vendor: Vendor) => vendor.ID === numericIdParams)
    //@ts-ignore
    return v
  } else {
    return null
  }
})

watch(vendor, (newVal) => {
  if (newVal) {
    updatedVendor.value = newVal
  }
})
onMounted(() => {})
const toast = ref<{ type: string; message: string } | null>(null)

const updateVendor = async () => {
  try {
    await store.updateVendor(updatedVendor.value as Vendor)
    showToast('success', 'VerkäuferIn erfolgreich aktualisiert')
  } catch (error) {
    console.error('Error creating vendor:', error)
    showToast('error', 'VerkäuferIn konnte nicht angelegt werden')
  }
}
const deleteVendor = async () => {
  try {
    if (vendor.value) {
      await store.deleteVendor(vendor.value.ID)
      showToast('success', 'VerkäuferIn erfolgreich gelöscht')
    }
  } catch (error) {
    console.error('Error deleting vendor:', error)
    showToast('error', 'VerkäuferIn konnte nicht gelöscht werden')
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
</script>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
