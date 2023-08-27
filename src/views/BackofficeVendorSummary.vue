<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1 className="font-bold underline mt-3 pt-3">Übersicht aller VerkäuferInnen</h1>

          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th className="p-3">Ausweisnummer</th>
                <th className="p-3">Vorname</th>
                <th className="p-3">Name</th>
                <th className="p-3">Aktion</th>
              </tr>
            </thead>
            <tbody className="text-sm  p-3">
              <tr v-for="vendor in vendors" :key="vendor.ID">
                <td className="border-t-2 p-3">{{ vendor.LicenseID }}</td>
                <td className="border-t-2 p-3">{{ vendor.FirstName }}</td>
                <td className="border-t-2 p-3">{{ vendor.LastName }}</td>
                <router-link to="/backoffice/pdf">
                  <div class="flex">
                    <button className="p-2 rounded-full bg-lime-600 text-white mr-2">
                      QR-Code erstellen
                    </button>
                    <button className="p-2 rounded-full bg-lime-600 text-white mr-2">
                      Din-A4 Download
                    </button>
                  </div>
                </router-link>
              </tr>

              <tr>
                <td className="border-t-2 p-3">LK-373</td>
                <td className="border-t-2 p-3">Leonie</td>
                <td className="border-t-2 p-3">Löwenherz</td>
                <router-link to="/backoffice/pdf">
                  <div class="flex">
                    <button className="p-2 rounded-full bg-lime-600 text-white mr-2">
                      QR-Code erstellen
                    </button>
                    <button className="p-2 rounded-full bg-lime-600 text-white mr-2">
                      Din-A4 Download
                    </button>
                  </div>
                </router-link>
              </tr>
            </tbody>
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
