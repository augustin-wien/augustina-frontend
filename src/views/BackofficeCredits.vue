<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="text-center text-2xl space-y-3 space-x-3 page-content space-x-2 mt-5">
          <h1>Ausweisnummer eingeben</h1>
          <input
            id="searchInput"
            type="text"
            v-model="searchQuery"
            @input="confirmSearch"
            placeholder="Suche Ausweisnummer"
            class="border-2 border-gray-400 rounded-md p-2 ml-2"
          />
          <button @click="confirmSearch" class="p-3 rounded-full bg-lime-600 text-white">
            Suchen
          </button>
          <router-link to="/backoffice/vendorsummary">
            <button className="p-3 mt-2 rounded-full bg-lime-600 text-white">
              Übersicht aller VerkäuferInnen
            </button>
          </router-link>
          <h2 className="font-bold underline mt-3 pt-3">Offene Beträge</h2>
          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th className="p-3">Ausweisnummer</th>
                <th className="p-3">Betrag</th>
                <th className="p-3">Zuletzt beglichen</th>
                <th className="p-3">Aktion</th>
              </tr>
            </thead>
            <tbody className="text-sm  p-3">
              <tr v-for="vendor in filteredVendors" :key="vendor.id">
                <td className="border-t-2 p-3">
                  <router-link to="/backoffice/userprofile">{{ vendor.licenseID }}</router-link>
                </td>
                <td className="border-t-2 p-3">20 Euro</td>
                <td className="border-t-2 p-3">{{ vendor.lastPayout.time }}</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">
                  <router-link to="/backoffice/userprofile">abcd</router-link>
                </td>
                <td className="border-t-2 p-3">5 €</td>
                <td className="border-t-2 p-3">23.03.2023</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">
                  <router-link to="/backoffice/userprofile"> LK-373</router-link>
                </td>
                <td className="border-t-2 p-3">3 €</td>
                <td className="border-t-2 p-3">17.05.2022</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">
                  <router-link to="/backoffice/userprofile"> BK-902</router-link>
                </td>
                <td className="border-t-2 p-3">7 €</td>
                <td className="border-t-2 p-3">07.02.2023</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">
                  <router-link to="/backoffice/userprofile"> AE-760</router-link>
                </td>
                <td className="border-t-2 p-3">10 €</td>
                <td className="border-t-2 p-3">02.03.2023</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
              </tr>
            </tbody>
          </div>
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts">
import { vendorsStore } from '../stores/vendor'
import { ref, computed } from 'vue'

export default {
  setup() {
    const store = vendorsStore()

    // Fetch the vendors' data when the component is mounted
    store.fetchVendors()
    const vendors = computed(() => store.vendors)

    const searchQuery = ref('')

    // Filter users based on the search query
    const filteredVendors = computed(() => {
      const searchTerm = searchQuery.value.toLowerCase()
      return vendors.value.filter((vendor) => vendor.licenseID.toLowerCase().includes(searchTerm))
    })

    // Function to handle the search
    const performSearch = () => {
      // The filtering is handled through computed property "filteredUsers"
    }

    // Function to be called when the "Suchen" button is clicked
    const confirmSearch = () => {
      performSearch() // Call the search function
    }

    // Return the data and methods as part of the setup
    return {
      searchQuery,
      filteredVendors,
      confirmSearch
    }
  }
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
