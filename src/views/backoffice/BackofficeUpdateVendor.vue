<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div class="w-full max-w-md mx-auto mt-4" v-if="vendor">
          <form
            @submit.prevent="updateVendor"
            class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
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
      </main>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref, computed, onMounted, watch } from 'vue'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { useRoute } from 'vue-router'
import Toast from '@/components/ToastMessage.vue'

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
