<script lang="ts" setup>
import { ref, onMounted, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor, VendorComment, VendorLocation } from '@/stores/vendor'
import { useRoute } from 'vue-router'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import { useKeycloakStore } from '@/stores/keycloak'
import VendorMapView from '@/components/VendorMapView.vue'
import AddressModal from '@/components/AddressModal.vue'
import keycloak from '@/keycloak/keycloak'

const { t } = useI18n()

import { faArrowLeft } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import CommentsModal from '@/components/CommentsModal.vue'

const store = vendorsStore()
const keycloakStore = useKeycloakStore()

const updatedVendor = ref<Vendor | null>(store.vendor)

const route = useRoute()

const vendorLocations = computed(() => store.vendorLocations)
const vendorComments = computed(() => store.vendorComments)

onMounted(() => {
  const vendorId = parseInt(route.params.ID.toString())

  if (keycloakStore.authenticated) {
    store.getVendor(vendorId).then(() => {
      updatedVendor.value = store.vendor
    })

    store.getVendorLocations(vendorId)
    store.getVendorComments(vendorId)
  } else {
    if (keycloak.keycloak) {
      keycloak.keycloak.onAuthSuccess = () => {
        store.getVendor(vendorId).then(() => {
          updatedVendor.value = store.vendor
          store.getVendorLocations(vendorId)
          store.getVendorComments(vendorId)
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

const isEditLocation = ref(false)

const updateLocation = (newLocation: VendorLocation) => {
  if (updatedVendor.value && updatedVendor.value !== null && updatedVendor.value.ID) {
    if (!updatedVendor.value.Locations) {
      updatedVendor.value.Locations = []
      store.updateVendorLocation(newLocation, updatedVendor.value.ID)
    }

    // check if we are editing a location
    if (isEditLocation.value) {
      updatedVendor.value.Locations = updatedVendor.value.Locations.map((location) => {
        if (location.id === newLocation.id && updatedVendor.value !== null) {
          store.updateVendorLocation(newLocation, updatedVendor.value.ID)
          return newLocation
        }

        if (updatedVendor.value !== null) {
          store.createVendorLocation(newLocation, updatedVendor.value.ID)
        }

        return location
      })
    } else {
      store.createVendorLocation(newLocation, updatedVendor.value.ID)

      updatedVendor.value.Locations.push(newLocation)
    }
  }

  isEditLocation.value = false
  showAddressModal.value = false
}

const editLocation = (location: VendorLocation) => {
  selectedLocation.value = [location]
  showAddressModal.value = true
  isEditLocation.value = true
}

const selectedLocation = ref<Array<VendorLocation> | null>(null)

const editComment = (comment: any) => {
  selectedComment.value = comment
  isNewComment.value = false
  showCommentsDialog.value = true
}

const showCommentsDialog = ref(false)
const selectedComment = ref<VendorComment | null>(null)
const isNewComment = ref(false)

const addNewComment = () => {
  selectedComment.value = {
    id: 0,
    comment: '',
    created_at: new Date(),
    warning: false,
    resolved_at: null,
    vendorid: updatedVendor.value?.ID || 0
  }

  isNewComment.value = true

  showCommentsDialog.value = true
}

const saveComment = (comment: VendorComment) => {
  if (updatedVendor.value && updatedVendor.value !== null) {
    if (isNewComment.value) {
      store.createVendorComment(comment, updatedVendor.value.ID).then(() => {
        //@ts-expect-error this is already checked
        store.getVendorComments(updatedVendor.value.ID)
      })
    } else {
      store.updateVendorComment(comment, updatedVendor.value.ID).then(() => {
        //@ts-expect-error this is already checked
        store.getVendorComments(updatedVendor.value.ID)
      })
    }
  }

  isNewComment.value = false
  showCommentsDialog.value = false
}

const cancelEditComment = () => {
  isNewComment.value = false
  showCommentsDialog.value = false
  selectedComment.value = null
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
                    >{{ $t('E-Mail') }}:</label
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
                  <label
                    class="block text-gray-700 text-sm font-bold mb-2 pt-3"
                    for="hasSmartphone"
                    >{{ $t('Has a smartphone') }}</label
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
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="verification"
                    >{{ $t('verificationLink') }}:</label
                  >
                  <input
                    id="verification"
                    v-model="updatedVendor.AccountProofUrl"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="verification"
                  />
                  <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="debt"
                    >{{ $t('debt') }}:</label
                  >
                  <input
                    id="debt"
                    v-model="updatedVendor.Debt"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    type="verification"
                  />
                </span>
              </div>
              <div class="row">
                <span class="col">
                  <div class="flex flex-col">
                    <div class="flex flex-row justify-between mb-4">
                      <h2 class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="comment">
                        {{ $t('comments') }}
                      </h2>
                      <button class="py-2 px-4 rounded-full customcolor" @click="addNewComment()">
                        {{ $t('Add a comment') }}
                      </button>
                    </div>

                    <div v-if="vendorComments && vendorComments.length > 0">
                      <div
                        v-for="comment in vendorComments"
                        :key="'comment_' + comment.id"
                        v-key="comment.id"
                        class="comment flex flex-row justify-between"
                      >
                        <div :class="'comment-infos' + (comment.warning ? ' text-red-500' : '')">
                          <div class="comment-title font-bold font-small">
                            {{ new Date(comment.created_at).toLocaleDateString() }}
                          </div>

                          <div class="comment-comment">
                            <span v-if="comment.warning" class="comment-warning-label font-bold"
                              >{{ $t('warning') }}: </span
                            >{{ comment.comment }}
                          </div>
                          <div
                            v-if="
                              comment.resolved_at &&
                              new Date(comment.resolved_at).toLocaleDateString() !== '1.1.1'
                            "
                          >
                            <label class="pr-2 font-bold">{{ $t('Resolved at') }}:</label>
                            <span>{{ new Date(comment.resolved_at).toLocaleDateString() }}</span>
                          </div>
                        </div>
                        <div class="comment-actions flex flex-col">
                          <button
                            class="py-2 px-4 rounded-full customcolor"
                            @click="editComment(comment)"
                          >
                            {{ $t('edit') }}
                          </button>
                          <button
                            class="py-2 px-4 rounded-full text-white bg-red-500 hover:bg-red-800"
                            @click="store.deleteVendorComment(updatedVendor.ID, comment.id)"
                          >
                            {{ $t('delete') }}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else>
                      <p>{{ $t('noComments') }}</p>
                    </div>
                  </div>
                  <div class="locations mt-5">
                    <div class="flex flex-row justify-between mb-4">
                      <h2>
                        <b>{{ $t('vendor locations') }}</b>
                      </h2>
                      <button
                        type="submit"
                        class="py-2 px-4 rounded-full customcolor"
                        @click="showAddressModal = true"
                      >
                        {{ $t('New Location') }}
                      </button>
                    </div>
                    <div v-if="vendorLocations && vendorLocations.length > 0">
                      <div
                        v-for="location in vendorLocations"
                        :key="'location_' + location.id"
                        v-key="'loc_' + location.id"
                        class="location flex justify-between"
                      >
                        <div class="location-infos">
                          <div class="location-title font-bold">{{ location.name }}</div>
                          <div class="location-address">
                            {{ location.address }} {{ location.zip }}
                          </div>
                          <div v-if="location.working_time">
                            <label class="pr-2 font-bold">{{ $t('workingTime') }}:</label>
                            <span>{{ location.working_time }}</span>
                          </div>
                        </div>
                        <div class="location-actions flex flex-col">
                          <button
                            class="py-2 px-4 rounded-full customcolor"
                            @click="editLocation(location)"
                          >
                            {{ $t('edit') }}
                          </button>
                          <button
                            class="py-2 px-4 rounded-full text-white bg-red-500 hover:bg-red-800"
                            @click="store.deleteVendorLocation(updatedVendor.ID, location.id)"
                          >
                            {{ $t('delete') }}
                          </button>
                        </div>
                      </div>
                    </div>
                    <div v-else>
                      <p>{{ $t('Vendor has no locations yet') }}</p>
                    </div>
                  </div>
                  <VendorMapView
                    v-if="vendorLocations && vendorLocations.length > 0"
                    :locations="vendorLocations"
                  />
                </span>
              </div>
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
        <AddressModal
          v-if="showAddressModal"
          :vendor="updatedVendor"
          :locations="selectedLocation"
          @close="showAddressModal = false"
          @update="updateLocation"
        ></AddressModal>
        <CommentsModal
          v-if="showCommentsDialog"
          :comment="selectedComment"
          :vendor="updatedVendor"
          @close="cancelEditComment"
          @update="saveComment"
        ></CommentsModal>
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
.locations {
  display: flex;
  flex-direction: column;
}
.location {
  padding: 10px;
  display: fle;
}
/* even odd styling for locations */
.location:nth-child(even) {
  background-color: #f2f2f2;
}
</style>
