<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div class="w-full max-w-md mx-auto mt-4">
          <form
            @submit.prevent="submitVendor"
            class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div class="mb-4">
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
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="qrcode"
                >qrcode:</label
              >
              <input
                class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                v-model="newVendor.UrlID"
                type="text"
                id="qrcode"
                required
              />
            </div>

            <div class="flex place-content-center">
              <button type="submit" class="p-3 rounded-full bg-lime-600 text-white">Anlegen</button>
            </div>
          </form>
          <Toast v-if="toast" :toast="toast" />
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { vendorsStore } from '../stores/vendor'
import type { Vendor } from '@/stores/vendor'
import Toast from '@/components/ToastMessage.vue'

const store = vendorsStore()

const newVendor = ref({
  Email: 'new@example.com',
  FirstName: 'Leonie',
  ID: 0,
  KeycloakID: 'new-keycloak-id',
  LastName: 'Löwenherz',
  LastPayout: null,
  LicenseID: 'new-license-id',
  UrlID: 'new-url-id',
  Balance: 0
})

const toast = ref<{ type: string; message: string } | null>(null)

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
</script>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
