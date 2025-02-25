<script setup lang="ts">
import type { VendorLocation } from '@/stores/vendor'
import { onMounted, ref, type Ref } from 'vue'
import VendorMapView from '@/components/VendorMapView.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const props = defineProps(['vendor', 'locations'])
const updatedVendor = ref(props.vendor)
const emit = defineEmits(['close', 'update'])

const newAddress: Ref<VendorLocation> = ref({
  id: 0,
  name: '',
  address: '',
  zip: '',
  longitude: settingsStore.settings?.MapCenterLong || 0.0,
  latitude: settingsStore.settings?.MapCenterLat || 0.0,
  working_time: 'G'
})

onMounted(() => {
  if (props.locations && props.locations.length > 0) {
    newAddress.value = props.locations[0]
  }
})

const updateAddress = () => {
  emit('update', newAddress.value)
}

const updateLocation = (event: any) => {
  newAddress.value.latitude = event.location.y
  newAddress.value.longitude = event.location.x
  newAddress.value.address = event.location.label
}

const editMarker = (newLocation: any) => {
  newAddress.value.latitude = newLocation.lat
  newAddress.value.longitude = newLocation.lng
}
</script>

<template>
  <!-- Adress modal -->
  <div
    v-if="updatedVendor"
    id="addressModal"
    tabindex="-1"
    aria-hidden="false"
    class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden flex items-center justify-center overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-h-full">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <!-- Modal header -->
        <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ updatedVendor.LicenseID }} {{ updatedVendor.FirstName }} {{ $t('address') }}
            {{ $t('edit') }}
          </h3>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            data-modal-hide="addressModal"
            @click="emit('close')"
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
        <div class="modal-body">
          <form class="w-full" @submit.prevent="updateAddress">
            <div class="p-4">
              <div class="mb-2">
                <label for="name" class="block text-gray-700 text-sm font-bold mb-2">{{
                  $t('location name')
                }}</label>
                <input
                  id="name"
                  v-model="newAddress.name"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                />
              </div>
              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="adress"
                >{{ $t('address') }}:</label
              >
              <div class="flex flex-row">
                <input
                  id="adress"
                  v-model="newAddress.address"
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
                  v-model="newAddress.zip"
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
                  v-model.number="newAddress.longitude"
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
                  v-model.number="newAddress.latitude"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                />
              </div>
              <div class="mb-2">
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="workingTime"
                  >{{ $t('workingTime') }}:</label
                >
                <div class="flex flex-row">
                  <select
                    v-model="newAddress.working_time"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="G" selected>{{ $t('(G) all day') }}</option>
                    <option value="V">{{ $t('(v) mornings') }}</option>
                    <option value="N">{{ $t('(N) afternoons') }}</option>
                  </select>
                </div>
              </div>
            </div>
          </form>
          <VendorMapView
            v-if="newAddress && newAddress.latitude && newAddress.longitude"
            :enable-search="1"
            :locations="[newAddress]"
            :new-coords="1"
            @new-location="updateLocation"
            @edit-marker="editMarker"
          />
        </div>

        <!-- Modal footer -->
        <div
          class="flex justify-between w-full p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600"
        >
          <button
            data-modal-hide="defaultModal"
            type="button"
            class="text-white bg-red-500 hover:bg-red-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            @click="emit('close')"
          >
            {{ $t('cancel') }}
          </button>
          <button
            data-modal-hide="defaultModal"
            type="submit"
            class="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            @click="updateAddress"
          >
            {{ $t('save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#addressModal {
  background-color: #cacacab2;
  z-index: 1000;
}
.modal-body {
  display: flex;
  flex-direction: row;
}
</style>
