<script setup lang="ts">
import type { VendorLocation } from '@/stores/vendor'
import { computed, onMounted, ref, type Ref } from 'vue'
import VendorMapView from '@/components/VendorMapView.vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()
const props = defineProps(['vendor', 'locations'])
const updatedVendor = ref(props.vendor)
const emit = defineEmits(['close', 'update'])

const createDefaultWorkingTime = () => ({
  mode: 'everyday',
  everyday: [{ from: '09:00', to: '17:00' }]
})

const normalizeWorkingTime = (workingTime: VendorLocation['working_time']) => {
  if (!workingTime || typeof workingTime === 'string') {
    switch (workingTime) {
      case 'G':
      case 'g':
        return { mode: 'whole_week', whole_week: true }
      case 'V':
      case 'v':
        return { mode: 'everyday', everyday: [{ from: '08:00', to: '12:00' }] }
      case 'N':
      case 'n':
        return { mode: 'everyday', everyday: [{ from: '13:00', to: '17:00' }] }
      default:
        return createDefaultWorkingTime()
    }
  }

  return workingTime
}

const newAddress: Ref<VendorLocation> = ref({
  id: 0,
  name: '',
  address: '',
  zip: '',
  longitude: settingsStore.settings?.MapCenterLong || 0.0,
  latitude: settingsStore.settings?.MapCenterLat || 0.0,
  working_time: createDefaultWorkingTime()
})

onMounted(() => {
  if (props.locations && props.locations.length > 0) {
    newAddress.value = {
      ...props.locations[0],
      working_time: normalizeWorkingTime(props.locations[0].working_time)
    }
  }
})

const updateAddress = () => {
  emit('update', newAddress.value)
}

const workingTimeMode = computed({
  get: () => {
    const workingTime = newAddress.value.working_time

    if (!workingTime || typeof workingTime === 'string') {
      return 'everyday'
    }

    return workingTime.mode || 'everyday'
  },
  set: (value: string) => {
    if (!newAddress.value.working_time || typeof newAddress.value.working_time === 'string') {
      newAddress.value.working_time = createDefaultWorkingTime()
    }

    switch (value) {
      case 'everyday':
        newAddress.value.working_time = {
          mode: 'everyday',
          everyday: [{ from: '09:00', to: '17:00' }]
        }

        break
      case 'by_day':
        newAddress.value.working_time = {
          mode: 'by_day',
          week_days: {
            mon: [{ from: '09:00', to: '17:00' }],
            tue: [{ from: '09:00', to: '17:00' }],
            wed: [{ from: '09:00', to: '17:00' }],
            thu: [{ from: '09:00', to: '17:00' }],
            fri: [{ from: '09:00', to: '17:00' }],
            sat: [{ full_day: true }],
            sun: [{ full_day: true }]
          }
        }

        break
      case 'whole_week':
        newAddress.value.working_time = {
          mode: 'whole_week',
          whole_week: true
        }

        break
    }
  }
})

const dayOptions = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const

const everydayRanges = computed(() => {
  const workingTime = newAddress.value.working_time

  if (!workingTime || typeof workingTime === 'string' || !workingTime.everyday) {
    return []
  }

  return workingTime.everyday
})

const everydayClosed = computed(() => everydayRanges.value.length === 0)

const getDayRanges = (day: (typeof dayOptions)[number]) => {
  const workingTime = newAddress.value.working_time

  if (!workingTime || typeof workingTime === 'string' || !workingTime.week_days) {
    return []
  }

  return Array.isArray(workingTime.week_days[day]) ? workingTime.week_days[day] : []
}

const setEverydayClosed = (closed: boolean) => {
  if (!newAddress.value.working_time || typeof newAddress.value.working_time === 'string') {
    newAddress.value.working_time = createDefaultWorkingTime()
  }

  newAddress.value.working_time.mode = 'everyday'
  newAddress.value.working_time.everyday = closed ? [] : [{ from: '09:00', to: '17:00' }]
  newAddress.value.working_time.week_days = undefined
  newAddress.value.working_time.whole_week = undefined
}

const isDayClosed = (day: (typeof dayOptions)[number]) => getDayRanges(day).length === 0

const setDayClosed = (day: (typeof dayOptions)[number], closed: boolean) => {
  if (!newAddress.value.working_time || typeof newAddress.value.working_time === 'string') {
    newAddress.value.working_time = createDefaultWorkingTime()
  }

  newAddress.value.working_time.mode = 'by_day'

  if (!newAddress.value.working_time.week_days) {
    newAddress.value.working_time.week_days = {}
  }

  newAddress.value.working_time.week_days[day] = closed ? [] : [{ from: '09:00', to: '17:00' }]
  newAddress.value.working_time.everyday = undefined
  newAddress.value.working_time.whole_week = undefined
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
  <div
    v-if="updatedVendor"
    id="addressModal"
    tabindex="-1"
    aria-hidden="false"
    class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden flex items-center justify-center overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-h-full">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
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

        <div class="modal-body">
          <form class="w-full" @submit.prevent="updateAddress">
            <div class="p-4">
              <div class="mb-2">
                <label for="name" class="block text-gray-700 text-sm font-bold mb-2">
                  {{ $t('location name') }}
                </label>
                <input
                  id="name"
                  v-model="newAddress.name"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                />
              </div>

              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="adress">
                {{ $t('address') }}:
              </label>
              <div class="flex flex-row">
                <input
                  id="adress"
                  v-model="newAddress.address"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                />
              </div>

              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="plz">
                {{ $t('postCode') }}:
              </label>
              <div class="flex flex-row">
                <input
                  id="plz"
                  v-model="newAddress.zip"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                />
              </div>

              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location-long">
                {{ $t('longitude') }}:
              </label>
              <div class="flex flex-row">
                <input
                  id="location-long"
                  v-model.number="newAddress.longitude"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                />
              </div>

              <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="location-lat">
                {{ $t('latitude') }}:
              </label>
              <div class="flex flex-row">
                <input
                  id="location-lat"
                  v-model.number="newAddress.latitude"
                  class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  type="text"
                />
              </div>

              <div class="mb-2">
                <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="workingTime">
                  {{ $t('workingTime') }}:
                </label>
                <div class="flex flex-row">
                  <select
                    id="workingTime"
                    v-model="workingTimeMode"
                    class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  >
                    <option value="everyday">{{ $t('everyday') }}</option>
                    <option value="by_day">{{ $t('by day') }}</option>
                    <option value="whole_week">{{ $t('whole week') }}</option>
                  </select>
                </div>
              </div>

              <div v-if="workingTimeMode === 'everyday'" class="mb-4 p-4 bg-gray-50 rounded">
                <h4 class="font-bold text-sm mb-2">{{ $t('everyday') }}</h4>
                <label class="mb-3 flex items-center gap-2 text-sm font-medium text-gray-700">
                  <input
                    type="checkbox"
                    class="rounded"
                    :checked="everydayClosed"
                    @change="setEverydayClosed(($event.target as HTMLInputElement).checked)"
                  />
                  <span>{{ $t('closed') }}</span>
                </label>
                <div class="space-y-2">
                  <template v-if="!everydayClosed">
                    <div
                      v-for="(range, idx) in everydayRanges"
                      :key="'everyday_' + idx"
                      class="flex gap-2 items-center"
                    >
                    <label class="flex items-center">
                      <input v-model="range.full_day" type="checkbox" class="rounded" />
                      <span class="ml-2 text-sm">{{ $t('full day') }}</span>
                    </label>
                    <input
                      v-if="!range.full_day"
                      v-model="range.from"
                      type="time"
                      class="border rounded px-2 py-1"
                      placeholder="09:00"
                    />
                    <span v-if="!range.full_day" class="text-sm">-</span>
                    <input
                      v-if="!range.full_day"
                      v-model="range.to"
                      type="time"
                      class="border rounded px-2 py-1"
                      placeholder="17:00"
                    />
                    </div>
                  </template>
                </div>
              </div>

              <div v-if="workingTimeMode === 'by_day'" class="mb-4 p-4 bg-gray-50 rounded">
                <h4 class="font-bold text-sm mb-2">{{ $t('by day') }}</h4>
                <div class="space-y-3">
                  <div v-for="day in dayOptions" :key="'day_' + day">
                    <div class="flex items-center justify-between gap-3">
                      <label class="font-semibold text-sm capitalize">{{ $t(day) }}</label>
                      <label class="flex items-center gap-2 text-sm">
                        <input
                          type="checkbox"
                          class="rounded"
                          :checked="isDayClosed(day)"
                          @change="setDayClosed(day, ($event.target as HTMLInputElement).checked)"
                        />
                        <span>{{ $t('closed') }}</span>
                      </label>
                    </div>
                    <div v-if="!isDayClosed(day)" class="flex gap-2 items-center mt-2">
                      <div v-for="(range, idx) in getDayRanges(day)" :key="'range_' + idx" class="flex gap-2 items-center">
                        <label class="flex items-center">
                          <input v-model="range.full_day" type="checkbox" class="rounded" />
                          <span class="ml-2 text-sm">{{ $t('full day') }}</span>
                        </label>
                        <input
                          v-if="!range.full_day"
                          v-model="range.from"
                          type="time"
                          class="border rounded px-2 py-1"
                        />
                        <span v-if="!range.full_day" class="text-sm">-</span>
                        <input
                          v-if="!range.full_day"
                          v-model="range.to"
                          type="time"
                          class="border rounded px-2 py-1"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="workingTimeMode === 'whole_week'" class="mb-4 p-4 bg-gray-50 rounded">
                <p class="text-sm text-gray-600">{{ $t('open 24/7') }}</p>
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
