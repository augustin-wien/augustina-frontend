<script setup lang="ts">
import type { VendorLocation } from '@/stores/vendor'
import { computed, onMounted, ref, type Ref } from 'vue'
import VendorMapView from '@/components/VendorMapView.vue'
import { useSettingsStore } from '@/stores/settings'
import { createDefaultWorkingTime, normalizeWorkingTime } from '@/utils/workingTime'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import FormField from '@/components/ui/FormField.vue'

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
  <Modal
    v-if="updatedVendor"
    open
    :title="`${updatedVendor.LicenseID} ${updatedVendor.FirstName} ${$t('address')} ${$t('edit')}`"
    @close="emit('close')"
  >
    <div class="address-modal-body">
      <form class="address-form" @submit.prevent="updateAddress">
        <FormField :label="$t('location name')" for="name">
          <input id="name" v-model="newAddress.name" class="aug-input" type="text" />
        </FormField>

        <FormField :label="`${$t('address')}:`" for="adress" class="mt-3">
          <input id="adress" v-model="newAddress.address" class="aug-input" type="text" />
        </FormField>

        <FormField :label="`${$t('postCode')}:`" for="plz" class="mt-3">
          <input id="plz" v-model="newAddress.zip" class="aug-input" type="text" />
        </FormField>

        <FormField :label="`${$t('longitude')}:`" for="location-long" class="mt-3">
          <input
            id="location-long"
            v-model.number="newAddress.longitude"
            class="aug-input"
            type="text"
          />
        </FormField>

        <FormField :label="`${$t('latitude')}:`" for="location-lat" class="mt-3">
          <input
            id="location-lat"
            v-model.number="newAddress.latitude"
            class="aug-input"
            type="text"
          />
        </FormField>

        <FormField :label="`${$t('workingTime')}:`" for="workingTime" class="mt-3">
          <select id="workingTime" v-model="workingTimeMode" class="aug-input">
            <option value="everyday">{{ $t('everyday') }}</option>
            <option value="by_day">{{ $t('by day') }}</option>
            <option value="whole_week">{{ $t('whole week') }}</option>
          </select>
        </FormField>

        <div v-if="workingTimeMode === 'everyday'" class="working-time-panel">
          <h4 class="working-time-panel-title">{{ $t('everyday') }}</h4>
          <label class="working-time-checkbox">
            <input
              type="checkbox"
              :checked="everydayClosed"
              @change="setEverydayClosed(($event.target as HTMLInputElement).checked)"
            />
            <span>{{ $t('closed') }}</span>
          </label>
          <template v-if="!everydayClosed">
            <div
              v-for="(range, idx) in everydayRanges"
              :key="'everyday_' + idx"
              class="working-time-range"
            >
              <label class="working-time-checkbox">
                <input v-model="range.full_day" type="checkbox" />
                <span>{{ $t('full day') }}</span>
              </label>
              <input
                v-if="!range.full_day"
                v-model="range.from"
                type="time"
                class="aug-input"
                placeholder="09:00"
              />
              <span v-if="!range.full_day">-</span>
              <input
                v-if="!range.full_day"
                v-model="range.to"
                type="time"
                class="aug-input"
                placeholder="17:00"
              />
            </div>
          </template>
        </div>

        <div v-if="workingTimeMode === 'by_day'" class="working-time-panel">
          <h4 class="working-time-panel-title">{{ $t('by day') }}</h4>
          <div v-for="day in dayOptions" :key="'day_' + day" class="working-time-day">
            <div class="working-time-day-header">
              <label class="working-time-day-label">{{ $t(day) }}</label>
              <label class="working-time-checkbox">
                <input
                  type="checkbox"
                  :checked="isDayClosed(day)"
                  @change="setDayClosed(day, ($event.target as HTMLInputElement).checked)"
                />
                <span>{{ $t('closed') }}</span>
              </label>
            </div>
            <div v-if="!isDayClosed(day)" class="working-time-day-ranges">
              <div
                v-for="(range, idx) in getDayRanges(day)"
                :key="'range_' + idx"
                class="working-time-range"
              >
                <label class="working-time-checkbox">
                  <input v-model="range.full_day" type="checkbox" />
                  <span>{{ $t('full day') }}</span>
                </label>
                <input v-if="!range.full_day" v-model="range.from" type="time" class="aug-input" />
                <span v-if="!range.full_day">-</span>
                <input v-if="!range.full_day" v-model="range.to" type="time" class="aug-input" />
              </div>
            </div>
          </div>
        </div>

        <div v-if="workingTimeMode === 'whole_week'" class="working-time-panel">
          <p class="working-time-whole-week">{{ $t('open 24/7') }}</p>
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

    <template #footer>
      <Button variant="ghost" @click="emit('close')">{{ $t('cancel') }}</Button>
      <Button variant="primary" @click="updateAddress">{{ $t('save') }}</Button>
    </template>
  </Modal>
</template>

<style scoped>
.address-modal-body {
  display: flex;
  flex-direction: row;
  gap: 20px;
}
.address-form {
  width: 100%;
  max-width: 320px;
  flex-shrink: 0;
}
.working-time-panel {
  margin-top: 14px;
  padding: 12px;
  background: var(--color-surface-alt);
  border-radius: var(--radius-sm);
}
.working-time-panel-title {
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 8px;
}
.working-time-whole-week {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 0;
}
.working-time-checkbox {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  margin-bottom: 8px;
}
.working-time-range {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 6px;
  font-size: 13px;
}
.working-time-range .aug-input {
  width: auto;
}
.working-time-day {
  margin-bottom: 10px;
}
.working-time-day-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}
.working-time-day-label {
  font-size: 13px;
  font-weight: 600;
  text-transform: capitalize;
}
.working-time-day-ranges {
  margin-top: 6px;
}
</style>
