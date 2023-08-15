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
            </div>

            <div class="flex place-content-center">
              <button type="submit" class="p-3 rounded-full bg-lime-600 text-white">Anlegen</button>
            </div>
          </form>
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue'
import { vendorsStore } from '../stores/vendor'
import type { Vendor } from '@/stores/vendor'

export default defineComponent({
  setup() {
    const store = vendorsStore()

    const newVendor = ref({
      Account: 0,
      Email: 'new@example.com',
      FirstName: 'Leonie',
      ID: 0,
      KeycloakID: 'new-keycloak-id',
      LastName: 'Löwenherz',
      LastPayout: {
        infinityModifier: 0,
        time: '',
        valid: true
      },
      LicenseID: 'new-license-id',
      UrlID: 'new-url-id',
      Balance: 0
    })

    const submitVendor = async () => {
      try {
        await store.createVendor(newVendor.value as Vendor)
      } catch (error) {
        console.error('Error creating vendor:', error)
      }
    }

    return {
      newVendor,
      submitVendor
    }
  }
})
</script>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
