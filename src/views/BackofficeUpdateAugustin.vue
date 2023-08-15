<template>Hallelujah hier fehlt mir noch die api und die korrekten bezeichnungen etc</template>

<!--
<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div class="w-full max-w-md mx-auto mt-4" v-if="augustin">
          <form
            @submit.prevent="updateAugustin"
            class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4"
          >
            <div class="mb-4">
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="logo"
                >Logo:</label
              >
              <div class="flex flex-row">
                <span class="p-2">{{ augustin.logo }} </span>
                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="updatedAugustin.logo"
                  type="text"
                  id="logo"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="cover"
                >Cover:</label
              >
              <div class="flex flex-row">
                <span class="p-2">{{ augustin.cover }} </span>

                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="augustin.cover"
                  type="text"
                  id="cover"
                  required
                />
              </div>

              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="name"
                >Name:</label
              >
              <div class="flex flex-row">
                <span class="p-2">{{ augustin.name }} </span>

                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="updatedaugustin.name"
                  type="text"
                  id="name"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="price"
                >Preis:</label
              >
              <div class="flex flex-row">
                <span class="p-2">{{ augustin.preis }} </span>

                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="updatedAugustin.preis"
                  type="number"
                  id="price"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="description"
                >Beschreibungstext:</label
              >
              <div class="flex flex-row">
                <span class="p-2">{{ augustin.description }} </span>

                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="updatedAugustin.description"
                  type="text"
                  id="description"
                  required
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="transactioncosts"
                >Übernahme Transaktionskosten:</label
              >
              <div class="flex flex-row">
                <span class="p-2">{{ augustin.transactioncosts }} </span>

                <input
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  v-model="updatedAugustin.transactioncosts"
                  type="text"
                  id="transactioncosts"
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
-->
