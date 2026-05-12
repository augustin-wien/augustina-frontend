<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor, VendorComment, VendorLocation } from '@/stores/vendor'
import { useRoute } from 'vue-router'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import VendorMapView from '@/components/VendorMapView.vue'
import AddressModal from '@/components/AddressModal.vue'
import { useAuthLoad } from '@/composables/useAuthLoad'

const { t } = useI18n()

import { faArrowLeft, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import CommentsModal from '@/components/CommentsModal.vue'

const store = vendorsStore()

const updatedVendor = ref<Vendor | null>(store.vendor)

const route = useRoute()

const vendorLocations = computed(() => store.vendorLocations)
const vendorComments = computed(() => store.vendorComments)

useAuthLoad(() => {
  if (!route?.params?.ID) return
  const vendorId = parseInt(route.params.ID.toString())

  store.getVendor(vendorId).then(() => {
    updatedVendor.value = store.vendor
  })

  store.getVendorLocations(vendorId)
  store.getVendorComments(vendorId)
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

const formatWorkingTime = (workingTime: any) => {
  if (!workingTime) return t('noLocations')

  if (typeof workingTime === 'string') {
    switch (workingTime.toLowerCase()) {
      case 'v':
        return `${t('everyday')}: 08:00 - 12:00`
      case 'n':
        return `${t('everyday')}: 13:00 - 17:00`
      case 'g':
        return t('open 24/7')
      default:
        return workingTime
    }
  }

  const mode = workingTime.mode
  if (mode === 'whole_week') return t('open 24/7')

  if (mode === 'everyday' && workingTime.everyday) {
    const times = workingTime.everyday
    if (times.length === 0) return t('closed')
    if (times[0]?.full_day) return t('full day')
    return `${t('everyday')}: ${times
      .map((range: any) => (range.full_day ? t('full day') : `${range.from}-${range.to}`))
      .join(', ')}`
  }

  if (mode === 'by_day' && workingTime.week_days) {
    const days = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun']
    return days
      .filter((day) => workingTime.week_days[day])
      .map((day) => {
        const ranges = workingTime.week_days[day] || []

        if (ranges.length === 0) {
          return `${t(day)}: ${t('closed')}`
        }

        const formattedRanges = ranges
          .map((range: any) => (range.full_day ? t('full day') : `${range.from}-${range.to}`))
          .join(', ')

        return `${t(day)}: ${formattedRanges}`
      })
      .join(' · ')
  }

  return mode || t('workingTime')
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 v-if="updatedVendor" class="font-bold mt-3 pt-3 text-2xl">
        <button @click="router.push('/backoffice/vendorsummary')">
          <font-awesome-icon :icon="faArrowLeft" />
        </button>
        {{ $t('vendorSingular') }} {{ updatedVendor.LicenseID }} {{ $t('change') }}
      </h1>
    </template>
    <template v-if="updatedVendor !== null" #main>
      <div class="main">
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <form @submit.prevent="updateVendor">
            <!-- Top row: form fields (left) + map (right) -->
            <div class="grid grid-cols-2 gap-6 mb-6">
              <div class="grid grid-cols-2 gap-x-4 gap-y-3 content-start">
                <div>
                  <label class="field-label" for="firstName">{{ $t('firstName') }}:</label>
                  <input
                    id="firstName"
                    v-model="updatedVendor.FirstName"
                    class="field-input"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label class="field-label" for="lastName">{{ $t('lastName') }}:</label>
                  <input
                    id="lastName"
                    v-model="updatedVendor.LastName"
                    class="field-input"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label class="field-label" for="email">{{ $t('E-Mail') }}:</label>
                  <input
                    id="email"
                    v-model="updatedVendor.Email"
                    class="field-input"
                    type="email"
                    required
                  />
                </div>
                <div>
                  <label class="field-label" for="licenseID">{{ $t('licenseId') }}:</label>
                  <input
                    id="licenseID"
                    v-model="updatedVendor.LicenseID"
                    class="field-input"
                    type="text"
                    required
                  />
                </div>
                <div>
                  <label class="field-label" for="telephone">{{ $t('telephone') }}:</label>
                  <input
                    id="telephone"
                    v-model="updatedVendor.Telephone"
                    class="field-input"
                    type="text"
                  />
                </div>
                <div>
                  <label class="field-label" for="language">{{ $t('language') }}:</label>
                  <input
                    id="language"
                    v-model="updatedVendor.Language"
                    class="field-input"
                    type="text"
                  />
                </div>
                <div>
                  <label class="field-label" for="registrationDate"
                    >{{ $t('registrationDate') }}:</label
                  >
                  <input
                    id="registrationDate"
                    v-model="updatedVendor.RegistrationDate"
                    class="field-input"
                    type="text"
                  />
                </div>
                <div>
                  <label class="field-label" for="vendorSince">{{ $t('vendorSince') }}:</label>
                  <input
                    id="vendorSince"
                    v-model="updatedVendor.VendorSince"
                    class="field-input"
                    type="text"
                  />
                </div>
                <div>
                  <label class="field-label" for="isDisabled">{{ $t('deactivated') }}:</label>
                  <select id="isDisabled" v-model="updatedVendor.IsDisabled" class="field-select">
                    <option :value="true">{{ $t('yes') }}</option>
                    <option :value="false">{{ $t('no') }}</option>
                  </select>
                </div>
                <div>
                  <label class="field-label" for="hasSmartphone"
                    >{{ $t('Has a smartphone') }}:</label
                  >
                  <select
                    id="hasSmartphone"
                    v-model="updatedVendor.HasSmartphone"
                    class="field-select"
                  >
                    <option :value="true">{{ $t('yes') }}</option>
                    <option :value="false">{{ $t('no') }}</option>
                  </select>
                </div>
                <div>
                  <label class="field-label" for="bankAccount">{{ $t('bankAccount') }}:</label>
                  <select
                    id="bankAccount"
                    v-model="updatedVendor.HasBankAccount"
                    class="field-select"
                  >
                    <option :value="true">{{ $t('yes') }}</option>
                    <option :value="false">{{ $t('no') }}</option>
                  </select>
                </div>
                <div>
                  <label class="field-label" for="verification"
                    >{{ $t('verificationLink') }}:</label
                  >
                  <input
                    id="verification"
                    v-model="updatedVendor.AccountProofUrl"
                    class="field-input"
                    type="url"
                  />
                </div>
                <div class="col-span-2">
                  <label class="field-label" for="debt">{{ $t('debt') }}:</label>
                  <input id="debt" v-model="updatedVendor.Debt" class="field-input" type="text" />
                </div>
              </div>

              <div class="min-h-48 overflow-hidden">
                <VendorMapView
                  v-if="vendorLocations && vendorLocations.length > 0"
                  :locations="vendorLocations"
                />
              </div>
            </div>

            <!-- Bottom row: locations (left) + comments (right) -->
            <div class="grid grid-cols-2 gap-6 mb-6">
              <div>
                <div class="flex justify-between items-center mb-2">
                  <h2 class="text-gray-700 text-sm font-bold">{{ $t('vendor locations') }}</h2>
                  <button
                    type="button"
                    class="py-2 px-4 rounded-full customcolor"
                    @click="showAddressModal = true"
                  >
                    {{ $t('New Location') }}
                  </button>
                </div>
                <div
                  v-if="vendorLocations && vendorLocations.length > 0"
                  class="space-y-2 max-h-48 overflow-y-auto pr-1"
                >
                  <div
                    v-for="location in vendorLocations"
                    :key="'location_' + location.id"
                    class="border border-gray-200 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-800 flex justify-between"
                  >
                    <div>
                      <div class="font-bold text-gray-700 dark:text-gray-200">
                        {{ location.name }}
                      </div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">
                        {{ location.address }} {{ location.zip }}
                      </div>
                      <div
                        v-if="location.working_time"
                        class="text-xs mt-1 text-gray-500 dark:text-gray-400"
                      >
                        <span class="font-bold pr-1">{{ $t('workingTime') }}:</span>
                        <span>{{ formatWorkingTime(location.working_time) }}</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 ml-2">
                      <button
                        type="button"
                        class="customcolor p-2"
                        :title="$t('edit')"
                        @click.prevent="editLocation(location)"
                      >
                        <font-awesome-icon :icon="faPen" />
                      </button>
                      <button
                        type="button"
                        class="text-red-600 hover:text-red-800 p-2"
                        :title="$t('delete')"
                        @click.prevent="store.deleteVendorLocation(updatedVendor.ID, location.id)"
                      >
                        <font-awesome-icon :icon="faTrash" />
                      </button>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('Vendor has no locations yet') }}
                </p>
              </div>

              <div>
                <div class="flex justify-between items-center mb-2">
                  <router-link
                    :to="`/backoffice/userprofile/${updatedVendor.ID}/comments`"
                    class="text-gray-700 text-sm font-bold hover:underline"
                  >
                    {{ $t('comments') }} →
                  </router-link>
                  <button
                    type="button"
                    class="py-2 px-4 rounded-full customcolor"
                    @click="addNewComment()"
                  >
                    {{ $t('Add a comment') }}
                  </button>
                </div>
                <div
                  v-if="vendorComments && vendorComments.length > 0"
                  class="space-y-2 max-h-48 overflow-y-auto pr-1"
                >
                  <div
                    v-for="comment in vendorComments"
                    :key="'comment_' + comment.id"
                    class="border border-gray-200 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-800 flex justify-between"
                    :class="{ 'text-red-600 dark:text-red-400': comment.warning }"
                  >
                    <div class="w-full">
                      <div class="font-bold text-xs mb-1 text-gray-500 dark:text-gray-400">
                        {{ new Date(comment.created_at).toLocaleDateString() }}
                      </div>
                      <div class="text-sm break-words">
                        <span v-if="comment.warning" class="font-bold">{{ $t('warning') }}: </span>
                        {{ comment.comment }}
                      </div>
                      <div
                        v-if="
                          comment.resolved_at && new Date(comment.resolved_at).getFullYear() > 1
                        "
                        class="text-xs mt-1 text-gray-500 dark:text-gray-400"
                      >
                        <span class="font-bold pr-2">{{ $t('Resolved at') }}:</span>
                        <span>{{ new Date(comment.resolved_at).toLocaleDateString() }}</span>
                      </div>
                    </div>
                    <div class="flex items-center space-x-2 ml-2">
                      <button
                        type="button"
                        class="customcolor p-2"
                        :title="$t('edit')"
                        @click.prevent="editComment(comment)"
                      >
                        <font-awesome-icon :icon="faPen" />
                      </button>
                      <button
                        id="delete-vendor-comment"
                        type="button"
                        class="text-red-600 hover:text-red-800 p-2"
                        :title="$t('delete')"
                        @click.prevent="store.deleteVendorComment(updatedVendor.ID, comment.id)"
                      >
                        <font-awesome-icon :icon="faTrash" />
                      </button>
                    </div>
                  </div>
                </div>
                <p v-else class="text-sm text-gray-600 dark:text-gray-400">
                  {{ $t('noComments') }}
                </p>
              </div>
            </div>

            <div class="flex justify-between">
              <button
                id="delete-vendor"
                type="button"
                class="py-2 px-4 rounded-full text-white bg-red-500 hover:bg-red-800"
                @click="showDeleteModal = true"
              >
                {{ $t('delete') }}
              </button>
              <button type="submit" class="py-2 px-4 rounded-full customcolor">
                {{ $t('confirmation') }}
              </button>
            </div>
          </form>
        </div>
        <Toast v-if="toast" :toast="toast" @close="toast = null" />

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
                    id="delete-vendor-confirm"
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
@reference "tailwindcss";

.field-label {
  @apply block text-gray-700 text-sm font-bold mb-1;
}
.field-input {
  @apply w-full appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:outline-none;
}
.field-select {
  @apply appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:outline-none;
}
</style>
