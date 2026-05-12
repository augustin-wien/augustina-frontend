<script lang="ts" setup>
import IconCross from '@/components/icons/IconCross.vue'
import VendorMapView from '@/components/VendorMapView.vue'
import { vendorsStore } from '@/stores/vendor'
import { formatCredit } from '@/utils/utils'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

const formatVendorDate = (date: string | null | undefined): string => {
  if (!date) return '–'
  const d = new Date(date)
  if (isNaN(d.getTime()) || d.getFullYear() <= 1) return '–'
  return d.toLocaleDateString()
}

const { t } = useI18n()
const vendorStore = vendorsStore()
const vendor = computed(() => vendorStore.vendor)
const vendorComments = computed(() => vendorStore.vendorComments)

type WorkingTimeRange = {
  from?: string
  to?: string
  full_day?: boolean
}

type WorkingTimeValue =
  | string
  | {
      mode?: string
      everyday?: WorkingTimeRange[]
      week_days?: Record<string, WorkingTimeRange[]>
      whole_week?: boolean
    }

const formatDayLabel = (day: string) =>
  t(day as 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')

const formatTimeRange = (range: WorkingTimeRange) => {
  if (range?.full_day) {
    return t('full day')
  }

  if (range?.from && range?.to) {
    return `${range.from} - ${range.to}`
  }

  return t('closed')
}

const formatWorkingTimeMode = (workingTime: WorkingTimeValue | null | undefined) => {
  if (!workingTime) return t('workingTime')

  if (typeof workingTime === 'string') {
    switch (workingTime.toLowerCase()) {
      case 'v':
        return t('everyday')
      case 'n':
        return t('everyday')
      case 'g':
        return t('whole week')
      default:
        return t('workingTime')
    }
  }

  const mode = workingTime.mode

  if (mode === 'whole_week') {
    return t('whole week')
  }

  if (mode === 'everyday' && Array.isArray(workingTime.everyday)) {
    if (workingTime.everyday.length === 0) {
      return t('closed')
    }

    return t('everyday')
  }

  if (mode === 'by_day' && workingTime.week_days) {
    return t('by day')
  }

  return mode || t('workingTime')
}

const formatWorkingTimeDetails = (workingTime: WorkingTimeValue | null | undefined) => {
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

  if (mode === 'whole_week') {
    return t('open 24/7')
  }

  if (mode === 'everyday' && Array.isArray(workingTime.everyday)) {
    if (workingTime.everyday.length === 0) {
      return t('closed')
    }

    return workingTime.everyday.map((range) => formatTimeRange(range)).join(', ')
  }

  if (mode === 'by_day' && workingTime.week_days) {
    return Object.entries(workingTime.week_days)
      .map(([day, ranges]) => {
        const label = formatDayLabel(day)
        let formattedRanges = t('closed')

        if (Array.isArray(ranges) && ranges.length > 0) {
          formattedRanges = ranges.map((range) => formatTimeRange(range)).join(', ')
        }

        return `${label}: ${formattedRanges}`
      })
      .join(' · ')
  }

  return mode || t('workingTime')
}

onMounted(() => {
  if (vendor.value !== null && vendor.value?.ID) {
    vendorStore.getVendorLocations(vendor.value?.ID)
    vendorStore.getVendorComments(vendor.value?.ID)
  }
})

const emit = defineEmits(['close'])
</script>

<template>
  <div
    id="vendorinfo-modal"
    tabindex="-1"
    class="fixed inset-0 z-50 flex items-center justify-center w-full h-full bg-gray-900 bg-opacity-50"
  >
    <div class="relative w-fit max-h-[90vh] overflow-y-auto">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 dark:text-white">
        <div class="flex justify-end pt-3 pr-3">
          <button class="rounded-full bg-red-600 text-white font-bold" @click="emit('close')">
            <IconCross />
          </button>
        </div>

        <div class="grid grid-cols-2 gap-4 mx-8 pb-4">
          <!-- Vendor details -->
          <div>
            <table class="w-full text-sm text-left">
              <tbody>
                <tr>
                  <th class="py-1 px-2">{{ $t('firstName') }}:</th>
                  <td class="py-1 px-2">{{ vendor?.FirstName }}</td>
                  <th class="py-1 px-2">{{ $t('lastName') }}:</th>
                  <td class="py-1 px-2">{{ vendor?.LastName }}</td>
                </tr>
                <tr>
                  <th class="py-1 px-2">{{ $t('LicenseId') }}:</th>
                  <td class="py-1 px-2">{{ vendor?.LicenseID }}</td>
                  <th class="py-1 px-2">{{ $t('accountDeactivation') }}:</th>
                  <td class="py-1 px-2">{{ $t(vendor?.IsDisabled ? 'yes' : 'no') }}</td>
                </tr>
                <tr>
                  <th class="py-1 px-2">{{ $t('lastPayout') }}:</th>
                  <td class="py-1 px-2">{{ formatVendorDate(vendor?.LastPayout) }}</td>
                  <th class="py-1 px-2">{{ $t('currentCredit') }}:</th>
                  <td class="py-1 px-2">{{ formatCredit(vendor?.Balance) }} €</td>
                </tr>
                <tr>
                  <th class="py-1 px-2">{{ $t('E-mail') }}:</th>
                  <td class="py-1 px-2">{{ vendor?.Email || '–' }}</td>
                  <th class="py-1 px-2">{{ $t('telephone') }}:</th>
                  <td class="py-1 px-2">{{ vendor?.Telephone || '–' }}</td>
                </tr>
                <tr>
                  <th class="py-1 px-2">{{ $t('vendorSince') }}:</th>
                  <td class="py-1 px-2">{{ formatVendorDate(vendor?.VendorSince) }}</td>
                  <th class="py-1 px-2">{{ $t('registrationDate') }}:</th>
                  <td class="py-1 px-2">{{ formatVendorDate(vendor?.RegistrationDate) }}</td>
                </tr>
                <tr>
                  <th class="py-1 px-2">{{ $t('Has a smartphone') }}:</th>
                  <td class="py-1 px-2">{{ $t(vendor?.HasSmartphone ? 'yes' : 'no') }}</td>
                  <th class="py-1 px-2">{{ $t('bankAccount') }}:</th>
                  <td class="py-1 px-2">{{ $t(vendor?.HasBankAccount ? 'yes' : 'no') }}</td>
                </tr>
                <tr v-if="vendor?.Debt">
                  <th class="py-1 px-2">{{ $t('debt') }}:</th>
                  <td class="py-1 px-2">{{ vendor?.Debt }}</td>
                </tr>
                <tr v-if="vendor?.AccountProofUrl">
                  <th class="py-1 px-2">{{ $t('verificationLink') }}:</th>
                  <td class="py-1 px-2">{{ vendor?.AccountProofUrl }}</td>
                </tr>
              </tbody>
            </table>
          </div>

          <!-- Map -->
          <div class="min-h-48 overflow-hidden">
            <VendorMapView
              v-if="vendorStore.vendorLocations && vendorStore.vendorLocations.length > 0"
              :locations="vendorStore.vendorLocations"
              :enable-search="false"
            />
          </div>

          <!-- Locations + comments: full width, split in two -->
          <div class="col-span-2 grid grid-cols-2 gap-4">
            <div>
              <h2 class="text-gray-700 text-sm font-bold mb-2">{{ $t('locations') }}</h2>
              <div
                v-if="vendorStore.vendorLocations && vendorStore.vendorLocations.length > 0"
                class="space-y-2 max-h-48 overflow-y-auto pr-1"
              >
                <div
                  v-for="location in vendorStore.vendorLocations"
                  :key="'location_' + location.id"
                  class="rounded-lg border border-gray-200 bg-gray-50 p-3 dark:border-gray-600 dark:bg-gray-800"
                >
                  <div class="flex items-start justify-between gap-2">
                    <div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white">
                        {{ location.name }}
                      </div>
                      <div class="text-xs text-gray-600 dark:text-gray-300">
                        {{ location.address }}, {{ location.zip }}
                      </div>
                    </div>
                    <span
                      class="shrink-0 rounded-full bg-slate-900 px-2 py-0.5 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900"
                    >
                      {{ formatWorkingTimeMode(location.working_time) }}
                    </span>
                  </div>
                  <div class="mt-1 text-xs text-gray-700 dark:text-gray-300">
                    <span class="font-semibold text-gray-900 dark:text-white">
                      {{ $t('workingTime') }}:
                    </span>
                    <span class="ml-1">{{ formatWorkingTimeDetails(location.working_time) }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-gray-600 dark:text-gray-400">{{ $t('noLocations') }}</p>
            </div>

            <div>
              <h2 class="text-gray-700 text-sm font-bold mb-2">{{ $t('comments') }}</h2>
              <div
                v-if="vendorComments && vendorComments.length > 0"
                class="space-y-2 max-h-48 overflow-y-auto pr-1"
              >
                <div
                  v-for="comment in vendorComments"
                  :key="'comment_' + comment.id"
                  class="border border-gray-200 dark:border-gray-600 rounded p-2 bg-gray-50 dark:bg-gray-800"
                  :class="{ 'text-red-600 dark:text-red-400': comment.warning }"
                >
                  <div class="font-bold text-xs mb-1 text-gray-500 dark:text-gray-400">
                    {{ new Date(comment.created_at).toLocaleDateString() }}
                  </div>
                  <div class="text-sm break-words">
                    <span v-if="comment.warning" class="font-bold">{{ $t('warning') }}: </span>
                    {{ comment.comment }}
                  </div>
                  <div
                    v-if="formatVendorDate(comment.resolved_at?.toString()) !== '–'"
                    class="text-xs mt-1 text-gray-500 dark:text-gray-400"
                  >
                    <span class="pr-2 font-bold">{{ $t('Resolved at') }}:</span>
                    <span>{{ formatVendorDate(comment.resolved_at?.toString()) }}</span>
                  </div>
                </div>
              </div>
              <p v-else class="text-sm text-gray-600 dark:text-gray-400">{{ $t('noComments') }}</p>
            </div>
          </div>
        </div>

        <div class="flex justify-center items-center py-3 space-x-3">
          <router-link :to="{ path: '/backoffice/payments', query: { vendor: vendor?.LicenseID } }">
            <button
              v-if="vendor?.LicenseID"
              class="px-4 py-2 text-[16px] rounded-full h-[44px] customcolor flex items-center"
            >
              {{ $t('bank statement') }}
            </button>
          </router-link>

          <router-link :to="`/backoffice/userprofile/${vendor?.ID}/comments`">
            <button class="px-4 py-2 text-[16px] rounded-full h-[44px] customcolor flex items-center">
              {{ $t('comments') }}
            </button>
          </router-link>

          <router-link :to="`/backoffice/userprofile/${vendor?.ID}/update`">
            <button class="px-4 py-2 text-[16px] rounded-full h-[44px] customcolor flex items-center">
              {{ $t('change') }}
            </button>
          </router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped></style>
