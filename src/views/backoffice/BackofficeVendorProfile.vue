<script lang="ts" setup>
import { vendorsStore } from '@/stores/vendor'
import { computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useKeycloakStore } from '@/stores/keycloak'
import router from '@/router'
import IconCross from '@/components/icons/IconCross.vue'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import VendorMapView from '@/components/VendorMapView.vue'
import keycloak from '@/keycloak/keycloak'

const keycloakStore = useKeycloakStore()

const vendorStore = vendorsStore()
const route = useRoute()
const vendor = computed(() => vendorStore.vendor)

onMounted(() => {
  const vendorId = parseInt(route.params.ID.toString())

  if (keycloakStore.authenticated) {
    vendorStore.getVendor(vendorId)
  } else {
    if (keycloak.keycloak) {
      keycloak.keycloak.onAuthSuccess = () => {
        vendorStore.getVendor(vendorId)
      }
    }
  }
})

const formatCredit = (credit: number) => {
  return (credit / 100).toFixed(2)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">
        <button @click="router.push('/backoffice/vendorsummary')">
          <font-awesome-icon :icon="faArrowLeft" />
        </button>
        {{ $t('vendorSingular') }} Profil {{ vendor?.LicenseID }}
      </h1>
    </template>
    <template #main>
      <div v-if="vendor" class="main">
        <div class="w-full mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-center text-2xl space-y-3 space-x-3">
            <div class="flex place-content-center justify-between">
              <span />
              <button
                class="rounded-full bg-red-600 text-white font-bold"
                @click="router.push('/backoffice/vendorsummary')"
              >
                <IconCross />
              </button>
            </div>
            <div className="table-auto border-spacing-4 border-collapse profile-wrapper">
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
                  <td className="p-3">{{ $t(vendor.IsDisabled ? 'yes' : 'no') }}</td>
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
                  <th className="p-3">{{ $t('vendorSince') }}:</th>
                  <td className="p-3">{{ vendor.VendorSince }}</td>
                  <th className="p-3">{{ $t('registrationDate') }}:</th>
                  <td className="p-3">{{ vendor.RegistrationDate }}</td>
                </tr>
                <tr>
                  <th className="p-3">{{ $t('language') }}:</th>
                  <td className="p-3">{{ vendor.Language }}</td>
                  <th className="p-3">Online Karte:</th>
                  <td className="p-3">{{ $t(vendor.OnlineMap ? 'yes' : 'no') }}</td>
                </tr>
                <tr>
                  <th className="p-3">Smartphone:</th>
                  <td className="p-3">{{ $t(vendor.HasSmartphone ? 'yes' : 'no') }}</td>
                  <th className="p-3">{{ $t('bankAccount') }}:</th>
                  <td className="p-3">{{ $t(vendor.HasBankAccount ? 'yes' : 'no') }}</td>
                </tr>
                <tr>
                  <th className="p-3">{{ $t('verificationLink') }}</th>
                  <td className="p-3">{{ vendor.AccountProofUrl }}</td>
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
                  <th className="p-3">{{ $t('workingTime') }}:</th>
                  <td className="p-3">{{ vendor.WorkingTime }}</td>
                </tr>
                <tr>
                  <th className="p-3">{{ $t('comment') }}:</th>
                  <td class="p-3" colspan="4">
                    <div v-for="(comment, index) in vendor.Comment" :key="index">
                      {{ comment }}
                    </div>
                  </td>
                </tr>
              </tbody>
              <div class="map-wrapper">
                <div
                  v-if="
                    vendor.Latitude &&
                    vendor.Longitude &&
                    vendor.Latitude != 0.1 &&
                    vendor.Longitude != 0.1
                  "
                  class="map"
                >
                  <VendorMapView :vendors="[vendor]" :enable-search="false" />
                </div>
              </div>
            </div>
            <div v-if="vendor" class="flex place-content-center">
              <router-link :to="`/backoffice/userprofile/${vendor.ID}/update`">
                <button
                  class="px-4 py-2 text-[16px] rounded-full h-[44px] customcolor mr-3 flex items-center"
                >
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

.profile-wrapper {
  display: flex;
  justify-content: space-between;
}
.map-wrapper {
  width: 100%;
  max-width: 500px;
}
</style>
