<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">
        {{ $t('vendorSingular') }} {{ $t('change') }}
      </h1></template
    >
    <template #main v-if="updatedVendor">
      <div class="main">
        <div class="w-full max-w-md mx-auto mt-4" v-if="vendor">
          <div class="flex place-content-center justify-between">
            <h1 class="text-2xl font-bold">{{ vendor.LicenseID }} {{ $t('change') }}</h1>
            <button
              @click="router.push('/backoffice/vendorsummary')"
              class="px-2 rounded-full bg-red-600 text-white font-bold"
            >
              X
            </button>
          </div>
        </div>

        <form @submit.prevent="updateVendor" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div class="mb-4 justify-between grid grid-cols-2 gap-5">
            <div class="row">
              <span class="col">
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="firstName"
                  >{{ $t('firstName') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.FirstName }} </span>
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.FirstName"
                    type="text"
                    id="firstName"
                    required
                  />
                </div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="lastName"
                  >{{ $t('lastName') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.LastName }} </span>

                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.LastName"
                    type="text"
                    id="lastName"
                    required
                  />
                </div>

                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="email"
                  >Email:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.Email }} </span>

                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.Email"
                    type="email"
                    id="email"
                    required
                  />
                </div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="licenseID"
                  >{{ $t('licenseId') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.LicenseID }} </span>

                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.LicenseID"
                    type="text"
                    id="licenseID"
                    required
                  />
                </div>

                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="workingTime"
                  >{{ $t('deactivated') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2"> {{ vendor.IsDisabled }} </span>
                  <select
                    class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.IsDisabled"
                    id="onlineMap"
                    required
                  >
                    <option value="true">{{ $t('yes') }}</option>
                    <option value="false">{{ $t('no') }}</option>
                  </select>
                </div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="adress"
                  >{{ $t('address') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.Address }} </span>

                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.Address"
                    type="text"
                    id="adress"
                    required
                  />
                </div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="plz"
                  >{{ $t('postCode') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.PLZ }} </span>

                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.PLZ"
                    type="text"
                    id="plz"
                  />
                </div>

                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location"
                  >{{ $t('location') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.Location }} </span>

                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.Location"
                    type="text"
                    id="location"
                  />
                </div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location"
                  >Longitude:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.Longitude }} </span>

                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.Longitude"
                    type="text"
                    id="location"
                  />
                </div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location"
                  >Latitude:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.Latitude }} </span>

                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.Latitude"
                    type="text"
                    id="location"
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
                  <span class="p-2">{{ vendor.Telephone }} </span>
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.Telephone"
                    type="text"
                    id="telephone"
                  />
                </div>

                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="hasSmartphone"
                  >Smartphone:</label
                >
                <div class="flex flex-row">
                  <span class="p-2"> {{ vendor.HasSmartphone }} </span>
                  <select
                    class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.HasSmartphone"
                    id="hasSmartphone"
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
                  <span class="p-2">{{ vendor.WorkingTime }} </span>
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.WorkingTime"
                    type="text"
                    id="workingTime"
                  />
                </div>

                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="language"
                  >{{ $t('language') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.Language }} </span>
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.Language"
                    type="text"
                    id="language"
                    required
                  />
                </div>

                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="onlineMap"
                  >{{ $t('onlineMap') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2"> {{ vendor.OnlineMap }} </span>
                  <select
                    class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.OnlineMap"
                    id="onlineMap"
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
                  <span class="p-2"> {{ vendor.HasBankAccount }} </span>
                  <select
                    class="appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.HasBankAccount"
                    id="bankAccount"
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
                  <span class="p-2">{{ vendor.RegistrationDate }} </span>
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.RegistrationDate"
                    type="text"
                    id="registrationDate"
                  />
                </div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="vendorSince"
                  >{{ $t('vendorSince') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.VendorSince }} </span>
                  <input
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    v-model="updatedVendor.VendorSince"
                    type="text"
                    id="vendorSince"
                  />
                </div>
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="comment"
                  >{{ $t('comment') }}:</label
                >
                <div class="flex flex-row">
                  <span class="p-2">{{ vendor.Comment }} </span>
                  <textarea
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    rows="5"
                    v-model="updatedVendor.Comment"
                    type="text"
                    id="comment"
                  ></textarea>
                </div>
              </span>
            </div>
          </div>
          <div class="flex place-content-center justify-between">
            <button
              type="submit"
              class="p-3 rounded-full bg-red-600 text-white"
              @click="deleteVendor"
            >
              {{ $t('delete') }}
            </button>
            <button
              type="submit"
              class="p-3 rounded-full bg-lime-600 text-white"
              @click="updateVendor"
            >
              {{ $t('confirmation') }}
            </button>
          </div>
        </form>
        <Toast v-if="toast" :toast="toast" />
      </div>
    </template>
  </component>
</template>

<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { useRoute } from 'vue-router'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import { useKeycloakStore } from '@/stores/keycloak'
import { storeToRefs } from 'pinia'

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
onMounted(() => {})
const toast = ref<{ type: string; message: string } | null>(null)

const updateVendor = async () => {
  try {
    await store.updateVendor(updatedVendor.value as Vendor)
    showToast('success', 'VerkäuferIn erfolgreich aktualisiert')
  } catch (error) {
    console.error('Error creating vendor:', error)
    showToast('error', 'VerkäuferIn konnte nicht angelegt werden')
  }
}
const deleteVendor = async () => {
  try {
    if (vendor.value) {
      await store.deleteVendor(vendor.value.ID)
      showToast('success', 'VerkäuferIn erfolgreich gelöscht')
    }
  } catch (error) {
    console.error('Error deleting vendor:', error)
    showToast('error', 'VerkäuferIn konnte nicht gelöscht werden')
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

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
