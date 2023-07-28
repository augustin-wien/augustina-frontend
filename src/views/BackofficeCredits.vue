<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1>Ausweisnummer eingeben</h1>
          <input
            id="searchInput"
            type="text"
            v-model="searchQuery"
            @input="performSearch"
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
              <tr>
                <td className="border-t-2 p-3">
                  <router-link to="/backoffice/userprofile">BE-202</router-link>
                </td>
                <td className="border-t-2 p-3">20 €</td>
                <td className="border-t-2 p-3">20.01.2023</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">
                  <router-link to="/backoffice/userprofile"> MU-5592</router-link>
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

<script>
export default {
  data() {
    return {
      searchQuery: '' // Initialize the search query
    }
  },
  methods: {
    performSearch() {
      // Function to handle the search
      // You can use this.searchQuery to access the search query and filter the data accordingly
      // For simplicity, let's assume that the first column (Ausweisnummer) is the search criteria
      const searchTerm = this.searchQuery.toLowerCase()
      const rows = document.querySelectorAll('tbody tr')
      rows.forEach((row) => {
        const ausweisnummer = row.querySelector('td:first-child').textContent.toLowerCase()
        if (ausweisnummer.includes(searchTerm)) {
          row.style.display = 'table-row'
        } else {
          row.style.display = 'none'
        }
      })
    },
    confirmSearch() {
      // Function to be called when the "Suchen" button is clicked
      this.performSearch() // Call the search function
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
