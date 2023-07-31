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
              <tr>
                <td className="border-t-2 p-3">{{ vendor.licenseID }}</td>
                <td className="border-t-2 p-3">{{ vendor.firstName }}</td>
                <td className="border-t-2 p-3">{{ vendor.lastName }}</td>

                <router-link to="/backoffice/pdf">
                  <div class="flex">
                    <button className="p-2 rounded-full bg-lime-600 text-white mr-2">
                      QR-Code erstellen
                    </button>
                    <button className="p-2 rounded-full bg-lime-600 text-white">
                      Din-A4 Download
                    </button>
                  </div>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">MU-5592</td>
                <td className="border-t-2 p-3">Max</td>
                <td className="border-t-2 p-3">Mustermann</td>
                <router-link to="/backoffice/pdf">
                  <div class="flex">
                    <button className="p-2 rounded-full bg-lime-600 text-white mr-2">
                      QR-Code erstellen
                    </button>
                    <button className="p-2 rounded-full bg-lime-600 text-white">
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
                    <button className="p-2 rounded-full bg-lime-600 text-white">
                      Din-A4 Download
                    </button>
                  </div>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">BK-902</td>
                <td className="border-t-2 p-3">Otto</td>
                <td className="border-t-2 p-3">Normalverbraucher</td>
                <router-link to="/backoffice/pdf">
                  <div class="flex">
                    <button className="p-2 rounded-full bg-lime-600 text-white mr-2">
                      QR-Code erstellen
                    </button>
                    <button className="p-2 rounded-full bg-lime-600 text-white">
                      Din-A4 Download
                    </button>
                  </div>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">AE-760</td>
                <td className="border-t-2 p-3">Sam</td>
                <td className="border-t-2 p-3">Sample</td>
                <router-link to="/backoffice/pdf">
                  <div class="flex">
                    <button className="p-2 rounded-full bg-lime-600 text-white mr-2">
                      QR-Code erstellen
                    </button>
                    <button className="p-2 rounded-full bg-lime-600 text-white">
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

<script lang="ts">
import { vendorsStore } from '../stores/vendor'
import { computed } from 'vue'
export default {
  setup() {
    const store = vendorsStore()

    // Fetch the vendors' data when the component is mounted
    store.fetchVendors()
    const vendors = computed(() => store.vendors)

    // Define the vendor object based on a specific condition or index
    // For example, if you want to access the first vendor in the list, you can do this:
    const vendor = computed(() => vendors.value[0]) // Change the index as per your requirement

    // Return the data and methods as part of the setup
    return {
      vendors,
      vendor
    }
  }
}
</script>
