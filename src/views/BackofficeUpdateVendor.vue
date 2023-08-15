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

            <div class="flex place-content-center">
              <button type="submit" class="p-3 rounded-full bg-lime-600 text-white">
                Bestätigen
              </button>
            </div>
          </form>
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts">
import { defineComponent, ref, computed } from 'vue'
import { vendorsStore } from '../stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { useRoute } from 'vue-router'

export default defineComponent({
  setup() {
    const store = vendorsStore()

    const updatedVendor = ref({
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

    store.fetchVendors()
    const vendors = computed(() => store.vendors)

    const route = useRoute()
    const idparams = route.params.ID

    const vendor = computed(() => {
      const numericIdParams = Number(idparams) // Convert the string to a number or NaN
      if (!isNaN(numericIdParams)) {
        return vendors.value.find((vendor) => vendor.ID === numericIdParams)
      } else {
        return null
      }
    })
    const updateVendor = async () => {
      try {
        await store.updateVendor(updatedVendor.value as Vendor)
      } catch (error) {
        console.error('Error updating vendor:', error)
      }
    }

    return {
      updatedVendor,
      updateVendor,
      vendor
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
