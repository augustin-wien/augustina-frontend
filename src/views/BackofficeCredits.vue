<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main v-if="vendors">
        <div className="text-center text-2xl space-y-3 space-x-3 page-content space-x-2 mt-5">
          <h1 className="font-bold text-3xl mt-3 pt-3">Offene Beträge</h1>
          <input
            id="searchInput"
            type="text"
            placeholder="Suche Ausweisnummer"
            class="border-2 border-gray-400 rounded-md p-2 ml-2"
          />
          <button class="p-3 rounded-full bg-lime-600 text-white">Suchen</button>

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
              <tr v-for="(vendor, id) in vendors" :key="id">
                <td className="border-t-2 p-3">
                  {{ vendor?.LicenseID }}
                </td>
                <td className="border-t-2 p-3">{{ vendor.Balance }} €</td>
                <td className="border-t-2 p-3">{{ vendor.LastPayout }}</td>
                <router-link :to="`/backoffice/credits/payout/${vendor.ID}`" v-if="vendor?.ID">
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

<script lang="ts" setup>
import { vendorsStore } from '../stores/vendor'
import { computed, onMounted } from 'vue'

const store = vendorsStore()

// Fetch the vendors' data when the component is mounted
onMounted(() => {
  store.getVendors()
})
const vendors = computed(() => store.vendors)
</script>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
