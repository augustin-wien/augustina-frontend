<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">VerkäuferInnen Profil</h1></template
    >
    <template #main>
      <div class="main" v-if="vendor">
        <div class="w-full mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-center text-2xl space-y-3 space-x-3">
            <div class="flex place-content-center justify-between">
              <h1 class="text-2xl font-bold">{{ vendor.LicenseID }}</h1>
              <button
                @click="router.push('/backoffice/vendorsummary')"
                class="px-2 rounded-full bg-red-600 text-white font-bold"
              >
                X
              </button>
            </div>
            <div className="table-auto border-spacing-4 border-collapse">
              <tbody className="text-sm text-left">
                <tr>
                  <th className="p-3">Vorname:</th>
                  <td className="p-3">{{ vendor.FirstName }}</td>
                  <th className="p-3">Nachname:</th>
                  <td className="p-3">{{ vendor.LastName }}</td>
                </tr>
                <tr>
                  <th className="p-3">Lizenznummer:</th>
                  <td className="p-3">{{ vendor.LicenseID }}</td>
                  <th className="p-3">Deaktiviert:</th>
                  <td className="p-3">{{ vendor.IsDisabled }}</td>
                </tr>
                <tr>
                  <th className="p-3">Letzte Auszahlung:</th>
                  <td className="p-3">{{ vendor.LastPayout }}</td>
                  <th className="p-3">Aktuelles Guthaben:</th>
                  <td className="p-3">{{ formatCredit(vendor.Balance) }} €</td>
                </tr>
                <tr>
                  <th className="p-3">E-Mail:</th>
                  <td className="p-3">{{ vendor.Email }}</td>
                  <th className="p-3">Telefonnummer:</th>
                  <td className="p-3">{{ vendor.Telephone }}</td>
                </tr>
                <tr>
                  <th className="p-3">Standplatz-Adresse:</th>
                  <td className="p-3">{{ vendor.Address }}</td>
                  <th className="p-3">Postleitzahl:</th>
                  <td className="p-3">{{ vendor.PLZ }}</td>
                </tr>
                <tr>
                  <th className="p-3">Breitengrad:</th>
                  <td className="p-3">{{ vendor.Longitude }}</td>

                  <th className="p-3">Längengrad:</th>
                  <td className="p-3">{{ vendor.Longitude }}</td>
                </tr>
                <tr>
                  <th className="p-3">Ort:</th>
                  <td className="p-3">{{ vendor.Location }}</td>
                  <th className="p-3">Sprache:</th>
                  <td className="p-3">{{ vendor.Language }}</td>
                </tr>
                <tr>
                  <th className="p-3">Verkauft seit:</th>
                  <td className="p-3">{{ vendor.VendorSince }}</td>

                  <th className="p-3">Registriert seit:</th>
                  <td className="p-3">{{ vendor.RegistrationDate }}</td>
                </tr>
                <tr>
                  <th className="p-3">Arbeitszeit:</th>
                  <td className="p-3">{{ vendor.WorkingTime }}</td>
                  <th className="p-3">Online Karte:</th>
                  <td className="p-3">{{ vendor.OnlineMap }}</td>
                </tr>
                <tr>
                  <th className="p-3">Smartphone:</th>
                  <td className="p-3">{{ vendor.HasSmartphone }}</td>
                  <th className="p-3">Bankkonto:</th>
                  <td className="p-3">{{ vendor.HasBankAccount }}</td>
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
      </div>
    </template>
  </component>
</template>

<style scoped>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>

<script lang="ts" setup>
import { vendorsStore, type Vendor } from '@/stores/vendor'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useKeycloakStore } from '@/stores/keycloak'
import router from '@/router'

const keycloakStore = useKeycloakStore()

const store = vendorsStore()

onMounted(() => {
  if (keycloakStore.authenticated) {
    store.getVendors()
  }
})
const vendors = computed(() => store.vendors)

const route = useRoute()
const idparams = route.params.ID

const vendor = computed(() => {
  const numericIdParams = Number(idparams) // Convert the string to a number or NaN
  if (!isNaN(numericIdParams)) {
    return vendors.value.find((vendor: Vendor) => vendor.ID === numericIdParams)
  } else {
    return null
  }
})

const formatCredit = (credit: number) => {
  return (credit / 100).toFixed(2)
}
</script>
