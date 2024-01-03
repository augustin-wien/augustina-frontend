<script lang="ts" setup>
import { vendorsStore } from '@/stores/vendor'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useKeycloakStore } from '@/stores/keycloak'
import router from '@/router'
import { storeToRefs } from 'pinia'

const keycloakStore = useKeycloakStore()

const vendorStore = vendorsStore()
const route = useRoute()
const { vendor } = storeToRefs(vendorStore)

onMounted(() => {
  if (keycloakStore.authenticated) {
    vendorStore.getVendor(route.params.ID)
  }
})

const formatCredit = (credit: number) => {
  return (credit / 100).toFixed(2)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t('vendorSingular') }} Profil</h1>
    </template>
    <template #main>
      <div v-if="vendor" class="main">
        <div class="w-full mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-center text-2xl space-y-3 space-x-3">
            <div class="flex place-content-center justify-between">
              <h1 class="text-2xl font-bold">{{ vendor.LicenseID }}</h1>
              <button
                class="px-2 rounded-full bg-red-600 text-white font-bold"
                @click="router.push('/backoffice/vendorsummary')"
              >
                X
              </button>
            </div>
            <div className="table-auto border-spacing-4 border-collapse">
              <tbody className="text-sm text-left">
                <tr>
                  <th className="p-3">{{ $t('firstName') }}:</th>
                  <td className="p-3">{{ vendor.FirstName }}</td>
                  <th className="p-3">{{ $t('lastName') }}:</th>
                  <td className="p-3">{{ vendor.LastName }}</td>
                </tr>
                <tr>
                  <th className="p-3">{{ $t('LicenseId') }}:</th>
                  <td className="p-3">{{ vendor.LicenseID }}</td>
                  <th className="p-3">{{ $t('accountDeactivation') }}:</th>
                  <td className="p-3">{{ vendor.IsDisabled }}</td>
                </tr>
                <tr>
                  <th className="p-3">{{ $t('lastPayout') }}:</th>
                  <td className="p-3">{{ vendor.LastPayout }}</td>
                  <th className="p-3">{{ $t('currentCredit') }}:</th>
                  <td className="p-3">{{ formatCredit(vendor.Balance) }} €</td>
                </tr>
                <tr>
                  <th className="p-3">E-Mail:</th>
                  <td className="p-3">{{ vendor.Email }}</td>
                  <th className="p-3">{{ $t('telephone') }}:</th>
                  <td className="p-3">{{ vendor.Telephone }}</td>
                </tr>
                <tr>
                  <th className="p-3">{{ $t('address') }}:</th>
                  <td className="p-3">{{ vendor.Address }}</td>
                  <th className="p-3">{{ $t('postCode') }}:</th>
                  <td className="p-3">{{ vendor.PLZ }}</td>
                </tr>
                <tr>
                  <th className="p-3">{{ $t('longitude') }}:</th>
                  <td className="p-3">{{ vendor.Longitude }}</td>

                  <th className="p-3">{{ $t('latitude') }}:</th>
                  <td className="p-3">{{ vendor.Latitude }}</td>
                </tr>
                <tr>
                  <th className="p-3">{{ $t('location') }}:</th>
                  <td className="p-3">{{ vendor.Location }}</td>
                  <th className="p-3">{{ $t('language') }}:</th>
                  <td className="p-3">{{ vendor.Language }}</td>
                </tr>
                <tr>
                  <th className="p-3">{{ $t('vendorSince') }}:</th>
                  <td className="p-3">{{ vendor.VendorSince }}</td>

                  <th className="p-3">{{ $t('registrationDate') }}:</th>
                  <td className="p-3">{{ vendor.RegistrationDate }}</td>
                </tr>
                <tr>
                  <th className="p-3">{{ $t('workingTime') }}:</th>
                  <td className="p-3">{{ vendor.WorkingTime }}</td>
                  <th className="p-3">Online Karte:</th>
                  <td className="p-3">{{ vendor.OnlineMap }}</td>
                </tr>
                <tr>
                  <th className="p-3">Smartphone:</th>
                  <td className="p-3">{{ vendor.HasSmartphone }}</td>
                  <th className="p-3">{{ $t('bankAccount') }}:</th>
                  <td className="p-3">{{ vendor.HasBankAccount }}</td>
                </tr>
              </tbody>
            </div>
            <div v-if="vendor">
              <router-link :to="`/backoffice/userprofile/${vendor.ID}/update`">
                <button class="p-2 rounded-full bg-lime-600 text-white mr-2">
                  {{ $t('change') }}
                </button>
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
