<script lang="ts" setup>
import { ref, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor } from '@/stores/vendor'
import { useRoute } from 'vue-router'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import { useKeycloakStore } from '@/stores/keycloak'
import IconCross from '@/components/icons/IconCross.vue'
import VendorMapView from '@/components/VendorMapView.vue'
import keycloak from '@/keycloak/keycloak'

const { t } = useI18n()

import { transformToFloat } from '@/utils/utils'
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const store = vendorsStore()
const keycloakStore = useKeycloakStore()

const updatedVendor = ref<Vendor | null>(store.vendor)

const route = useRoute()

onMounted(() => {
  const vendorId = parseInt(route.params.ID.toString())

  if (keycloakStore.authenticated) {
    store.getVendor(vendorId).then(() => {
      updatedVendor.value = store.vendor
    })
  } else {
    if (keycloak.keycloak) {
      keycloak.keycloak.onAuthSuccess = () => {
        store.getVendor(vendorId).then(() => {
          updatedVendor.value = store.vendor
        })
      }
    }
  }
})

watch(
  () => store.vendor,
  (newVal: Vendor | null) => {
    if (newVal && newVal !== null) {
      updatedVendor.value = newVal
    }
  }
)

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
      // eslint-disable-next-line no-console
      console.error('Error creating vendor:', response)
      showToast('error', t('The vendor could not be updated'))
    } else {
      showToast('success', t('The vendor has been updated'))
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating vendor:', error)
    showToast('error', t('The vendor could not be updated'))
  }
}

const deleteVendor = async () => {
  if (!updatedVendor.value) {
    return
  }

  // check if vendor has still a balance
  if (updatedVendor.value.Balance > 0) {
    showToast('error', t('The vendor still has a balance and cannot be deleted'))
    return
  }

  try {
    store
      .deleteVendor(updatedVendor.value.ID)
      .catch((error: any) => {
        // eslint-disable-next-line no-console
        console.error('Error deleting vendor:', error)
        showToast('error', t('The vendor could not be deleted'))
      })
      .then(() => {
        router.push('/backoffice/vendorsummary')
      })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting vendor:', error)
    showToast('error', 'VerkäuferIn konnte nicht gelöscht werden')
  }
}

const showDeleteModal = ref(false)
const showAddressModal = ref(false)

const showToast = (type: string, message: string) => {
  // Set the toast message
  toast.value = { type, message }

  // Clear the toast after a delay (e.g., 5 seconds)
  setTimeout(() => {
    toast.value = null
  }, 5000)
}

const updateLocation = (newLocation: any) => {
  if (updatedVendor.value) {
    updatedVendor.value.Longitude = newLocation.location.x
    updatedVendor.value.Latitude = newLocation.location.y
  }
}

const updateAddress = (newAdress: any) => {
  if (updatedVendor.value) {
    updatedVendor.value.Name = newAdress.Name
    updatedVendor.value.Address = newAdress.Address
    updatedVendor.value.Longitude = newAdress.Longitude
    updatedVendor.value.Latitude = newAdress.Latitude
    updatedVendor.value.PLZ = newAdress.PLZ
    updatedVendor.value.WorkingTime = newAdress.WorkingTime
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 v-if="updatedVendor" className="font-bold mt-3 pt-3 text-2xl">
        <button @click="router.push('/backoffice/vendorsummary')">
          <font-awesome-icon :icon="faArrowLeft" />
        </button>
        {{ $t('vendorSingular') }} {{ updatedVendor.LicenseID }} {{ $t('change') }}
      </h1>
    </template>
    <template v-if="updatedVendor !== null" #main>
      <div class="main">
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div v-if="store.vendor" class="w-full">
            <div class="flex place-content-center justify-between">
              <span></span>
              <button
                class="rounded-full bg-red-600 text-white"
                @click="router.push('/backoffice/vendorsummary')"
              >
                <IconCross />
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
                      <option :value="true">{{ $t('yes') }}</option>
                      <option :value="false">{{ $t('no') }}</option>
                    </select>
                  </div>
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="adress"
                    >{{ $t('address') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="adress"
                      v-model="updatedVendor.Address"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
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
                      <option :value="true">{{ $t('yes') }}</option>
                      <option :value="false">{{ $t('no') }}</option>
                    </select>
                  </div>
                  <!--
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="workingTime"
                    >{{ $t('workingTime') }}:</label
                  >
                  <div class="flex flex-row">
                    <select
                      v-model="updatedVendor.WorkingTime"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    >
                      <option value="G" selected>{{ $t('(G) all day') }}</option>
                      <option value="V">{{ $t('(v) mornings') }}</option>
                      <option value="N">{{ $t('(N) afternoons') }}</option>
                    </select>
                  </div>
                 -->
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="language"
                    >{{ $t('language') }}:</label
                  >
                  <div class="flex flex-row">
                    <input
                      id="language"
                      v-model="updatedVendor.Language"
                      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                      type="text"
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
                      <option :value="true">{{ $t('yes') }}</option>
                      <option :value="false">{{ $t('no') }}</option>
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
                      <option :value="true">{{ $t('yes') }}</option>
                      <option :value="false">{{ $t('no') }}</option>
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
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="email"
                    >{{ $t('verificationLink') }}:</label
                  >
                  <input
                    id="verification"
                    v-model="updatedVendor.AccountProofUrl"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="verification"
                  />
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
              class="py-2 px-4 rounded-full customcolor"
              @click="showAddressModal = true"
            >
              {{ $t('address') }}
            </button>

            <div v-if="updatedVendor.Latitude != 0.1 && updatedVendor.Longitude != 0.1">
              <VendorMapView
                :vendors="[updatedVendor]"
                :enable-search="1"
                @new-location="updateLocation"
              />
            </div>

            <div class="flex justify-between">
              <button
                type="submit"
                class="py-2 px-4 rounded-full text-white bg-red-500 hover:bg-red-800"
                @click="showDeleteModal = true"
              >
                {{ $t('delete') }}
              </button>
              <button
                type="submit"
                class="py-2 px-4 rounded-full customcolor"
                @click="updateVendor"
              >
                {{ $t('confirmation') }}
              </button>
            </div>
          </form>
        </div>
        <Toast v-if="toast" :toast="toast" />
        <!-- delete modal -->
        <div v-if="showDeleteModal">
          <div
            id="defaultModal"
            tabindex="-1"
            aria-hidden="false"
            class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden flex items-center justify-center overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
          >
            <div class="relative w-full max-w-2xl max-h-full">
              <!-- Modal content -->
              <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <!-- Modal header -->
                <div
                  class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600"
                >
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ updatedVendor.LicenseID }} {{ updatedVendor.FirstName }} {{ $t('delete') }}
                  </h3>
                  <button
                    type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="defaultModal"
                    @click="showDeleteModal = false"
                  >
                    <svg
                      class="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span class="sr-only">Close modal</span>
                  </button>
                </div>
                <!-- Modal body -->
                <div class="p-6 space-y-6">
                  <p class="text-base leading-relaxed text-gray-500 dark:text-gray-400">
                    {{ $t('vendordeletionConfirmation') }}
                  </p>
                </div>
                <!-- Modal footer -->
                <div
                  class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600"
                >
                  <button
                    data-modal-hide="defaultModal"
                    type="button"
                    class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    @click="deleteVendor"
                  >
                    {{ $t('delete') }}
                  </button>
                  <button
                    data-modal-hide="defaultModal"
                    type="button"
                    class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                    @click="showDeleteModal = false"
                  >
                    {{ $t('cancel') }}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- Adress modal -->
        <div v-if="showAddressModal">
          <div
            id="addressModal"
            tabindex="-1"
            aria-hidden="false"
            class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden flex items-center justify-center overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
          >
            <div class="relative w-full max-w-2xl max-h-full">
              <!-- Modal content -->
              <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
                <!-- Modal header -->
                <div
                  class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600"
                >
                  <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
                    {{ updatedVendor.LicenseID }} {{ updatedVendor.FirstName }} {{ $t('address') }}
                    {{ $t('edit') }}
                  </h3>
                  <button
                    type="button"
                    class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
                    data-modal-hide="addressModal"
                    @click="showAddressModal = false"
                  >
                    <svg
                      class="w-3 h-3"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 14"
                    >
                      <path
                        stroke="currentColor"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
                      />
                    </svg>
                    <span class="sr-only">Close modal</span>
                  </button>
                </div>
                <!-- Modal body -->
                <toast v-if="showAddressModal">
                  <form @submit.prevent="updateAddress">
                    <div class="p-4">
                      <h3 class="font-bold mb-2">Edit Address</h3>
                      <div class="mb-2">
                        <label for="name" class="block text-gray-700 text-sm font-bold mb-2"
                          >Name</label
                        >
                        <input
                          id="name"
                          v-model="updatedVendor.Name"
                          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="text"
                        />
                      </div>
                      <div class="mb-2">
                        <label for="address" class="block text-gray-700 text-sm font-bold mb-2"
                          >Address</label
                        >
                        <input
                          id="address"
                          v-model="updatedVendor.Address"
                          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="text"
                        />
                      </div>
                      <div class="mb-2">
                        <label for="longitude" class="block text-gray-700 text-sm font-bold mb-2"
                          >Longitude</label
                        >
                        <input
                          id="longitude"
                          v-model="updatedVendor.Longitude"
                          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="number"
                          step="0.0001"
                        />
                      </div>
                      <div class="mb-2">
                        <label for="latitude" class="block text-gray-700 text-sm font-bold mb-2"
                          >Latitude</label
                        >
                        <input
                          id="latitude"
                          v-model="updatedVendor.Latitude"
                          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="number"
                          step="0.0001"
                        />
                      </div>
                      <div class="mb-2">
                        <label for="plz" class="block text-gray-700 text-sm font-bold mb-2"
                          >ZIP</label
                        >
                        <input
                          id="plz"
                          v-model="updatedVendor.PLZ"
                          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="text"
                        />
                      </div>
                      <div class="mb-2">
                        <label for="workingTime" class="block text-gray-700 text-sm font-bold mb-2"
                          >Working Time</label
                        >
                        <input
                          id="workingTime"
                          v-model="updatedVendor.WorkingTime"
                          class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                          type="text"
                        />
                      </div>
                    </div>
                  </form>
                </toast>

                <!-- Modal footer -->
                <div
                  class="flex items-center p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600"
                >
                  <button
                    data-modal-hide="defaultModal"
                    type="submit"
                    class="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                    @click="updateAddress"
                  >
                    {{ $t('edit') }}
                  </button>
                  <button
                    data-modal-hide="defaultModal"
                    type="button"
                    class="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
                    @click="showAddressModal = false"
                  >
                    {{ $t('cancel') }}
                  </button>
                </div>
              </div>
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
