<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { useRoute } from 'vue-router'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import { useKeycloakStore } from '@/stores/keycloak'
import { storeToRefs } from 'pinia'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

import { transformToFloat } from '@/utils/utils'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const store = vendorsStore()
const keycloakStore = useKeycloakStore()

const updatedVendor = ref<Vendor | null>(null)

const route = useRoute()

onMounted(() => {
  if (keycloakStore.authenticated) {
    store.getVendor(route.params.ID)
  }
})

const { vendor } = storeToRefs(store)

watch(vendor, (newVal) => {
  if (newVal) {
    updatedVendor.value = newVal
  }
})

const toast = ref<{ type: string; message: string } | null>(null)

const updateVendor = async () => {
  const newVendor = updatedVendor.value

  if (!newVendor) {
    return
  }

  // fix for int bug
  newVendor.Longitude = transformToFloat(newVendor.Longitude)
  newVendor.Latitude = transformToFloat(newVendor.Latitude)

  try {
    const response = await store.updateVendor(newVendor as Vendor)

    if (response) {
      console.error('Error creating vendor:', response)
      showToast('error', 'VerkäuferIn konnte nicht aktualisiert werden')
    } else {
      showToast('success', 'VerkäuferIn erfolgreich aktualisiert')
    }
  } catch (error) {
    console.error('Error updating vendor:', error)
    showToast('error', 'VerkäuferIn konnte nicht aktualisiert werden')
  }
}

const showToast = (type: string, message: string) => {
  // Set the toast message
  toast.value = { type, message }

  // Clear the toast after a delay (e.g., 5 seconds)
  setTimeout(() => {
    toast.value = null
  }, 5000)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">
        <button @click="router.push('/backoffice/vendorsummary')">
          <font-awesome-icon :icon="faArrowLeft" />
        </button>
        {{ $t('vendorSingular') }} {{ vendor.LicenseID }} {{ $t('change') }}
      </h1>
    </template>
    <template v-if="updatedVendor" #main>
      <div class="main">
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div v-if="vendor" class="w-full">
            <div class="flex place-content-center justify-between">
              <span></span>
              <button
                class="px-2 rounded-full bg-red-600 text-white font-bold"
                @click="router.push('/backoffice/vendorsummary')"
              >
                X
              </button>
            </div>
          </div>

          <form @submit.prevent="updateVendor">
            <div class="mb-4 justify-between grid grid-cols-2 gap-5">
              <div class="row">
                <span class="col">
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="firstName"
                    >{{ $t('firstName') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="firstName"
                      v-model="updatedVendor.FirstName"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      required
                    />
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="lastName"
                    >{{ $t('lastName') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="lastName"
                      v-model="updatedVendor.LastName"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      required
                    />
                  </div>

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="email"
                    >Email:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="email"
                      v-model="updatedVendor.Email"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="email"
                      required
                    />
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="licenseID"
                    >{{ $t('licenseId') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="licenseID"
                      v-model="updatedVendor.LicenseID"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      required
                    />
                  </div>

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="workingTime"
                    >{{ $t('deactivated') }}:</label
                  >
                  <div class="flex flex-row">
                    <select
                      id="onlineMap"
                      v-model="updatedVendor.IsDisabled"
                      class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="true">{{ $t('yes') }}</option>
                      <option value="false">{{ $t('no') }}</option>
                    </select>
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="adress"
                    >{{ $t('address') }}<span class="text-red">*</span>:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="adress"
                      v-model="updatedVendor.Address"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      required
                    />
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="plz"
                    >{{ $t('postCode') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="plz"
                      v-model="updatedVendor.PLZ"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                    />
                  </div>

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location"
                    >{{ $t('location') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="location"
                      v-model.number="updatedVendor.Location"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                    />
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location"
                    >{{ $t('longitude') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="location"
                      v-model.number="updatedVendor.Longitude"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                    />
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location"
                    >{{ $t('latitude') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="location"
                      v-model.number="updatedVendor.Latitude"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                    />
                  </div>
                </span>
              </div>
              <div class="row">
                <span class="col">
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="telephone"
                    >{{ $t('telephone') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="telephone"
                      v-model="updatedVendor.Telephone"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                    />
                  </div>

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="hasSmartphone"
                    >Smartphone:</label
                  >
                  <div class="flex flex-row">
                    <select
                      id="hasSmartphone"
                      v-model="updatedVendor.HasSmartphone"
                      class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="true">{{ $t('yes') }}</option>
                      <option value="false">{{ $t('no') }}</option>
                    </select>
                  </div>

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="workingTime"
                    >{{ $t('workingTime') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="workingTime"
                      v-model="updatedVendor.WorkingTime"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                    />
                  </div>

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="language"
                    >{{ $t('language') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="language"
                      v-model="updatedVendor.Language"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                      required
                    />
                  </div>

                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="onlineMap"
                    >{{ $t('onlineMap') }}:</label
                  >
                  <div class="flex flex-row">
                    <select
                      id="onlineMap"
                      v-model="updatedVendor.OnlineMap"
                      class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="true">{{ $t('yes') }}</option>
                      <option value="false">{{ $t('no') }}</option>
                    </select>
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="onlineMap"
                    >{{ $t('bankAccount') }}:</label
                  >
                  <div class="flex flex-row">
                    <select
                      id="bankAccount"
                      v-model="updatedVendor.HasBankAccount"
                      class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      required
                    >
                      <option value="true">{{ $t('yes') }}</option>
                      <option value="false">{{ $t('no') }}</option>
                    </select>
                  </div>

                  <label
                    class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                    for="registrationDate"
                    >{{ $t('registrationDate') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="registrationDate"
                      v-model="updatedVendor.RegistrationDate"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                    />
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="vendorSince"
                    >{{ $t('vendorSince') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="vendorSince"
                      v-model="updatedVendor.VendorSince"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
                    />
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="comment"
                    >{{ $t('comment') }}:</label
                  >
                  <div class="flex flex-row">
                    <textarea
                      id="comment"
                      v-model="updatedVendor.Comment"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      rows="5"
                      type="text"
                    ></textarea>
                  </div>
                </span>
              </div>
            </div>
            <button
              type="submit"
              class="p-3 rounded-full bg-lime-600 text-white"
              @click="updateVendor"
            >
              {{ $t('save') }}
            </button>
          </form>
        </div>
        <Toast v-if="toast" :toast="toast" />
      </div>
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
