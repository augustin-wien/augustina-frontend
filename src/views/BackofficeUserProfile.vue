<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="container page-content space-x-2 mt-5">
          <div className="text-center text-2xl space-y-3 space-x-3">
            <h1 className="font-bold underline mt-3 pt-3">VerkäuferInnen Profil</h1>

            <div className="table-auto border-spacing-4 border-collapse">
              <tbody className="text-sm" v-if="vendor">
                <tr>
                  <th className="p-3">Vorname</th>
                  <td className="p-3">{{ vendor.FirstName }}</td>
                </tr>
                <tr>
                  <th className="p-3">Nachname</th>
                  <td className="p-3">{{ vendor.LastName }}</td>
                </tr>
                <tr>
                  <th className="p-3">Lizenznummer</th>
                  <td className="p-3">{{ vendor.LicenseID }}</td>
                </tr>
                <tr>
                  <th className="p-3">Letzte Auszahlung</th>
                  <td className="p-3">{{ vendor.LastPayout }}</td>
                </tr>
                <tr>
                  <th className="p-3">Aktuelles Guthaben</th>
                  <td className="p-3">{{ vendor.Balance }} €</td>
                </tr>
              </tbody>
            </div>
            <div v-if="vendor">
              <router-link :to="`/backoffice/userprofile/${vendor.ID}/update`">
                <button class="p-2 rounded-full bg-lime-600 text-white mr-2">Ändern</button>
              </router-link>
            </div>
          </div>
        </div>
      </main>
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

<script lang="ts">
import { vendorsStore } from '../stores/vendor'
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'

export default {
  setup() {
    const store = vendorsStore()
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
    console.log(idparams)
    const searchQuery = ref('')
    const amount = ref('')

    // Filter users based on the search query
    const filteredVendors = computed(() => {
      const searchTerm = searchQuery.value.toLowerCase()
      return vendors.value.filter((vendor) => vendor.LicenseID?.includes(searchTerm))
    })

    return {
      searchQuery,
      filteredVendors,
      vendor,
      amount
    }
  }
}
</script>
