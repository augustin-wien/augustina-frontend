<script lang="ts" setup>
import IconCross from '@/components/icons/IconCross.vue'
import VendorMapView from '@/components/VendorMapView.vue'
import { vendorsStore } from '@/stores/vendor'
import { formatCredit } from '@/utils/utils'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'

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
    <div class="relative p-13 w-fit modal-content max-h-full">
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700 dark:text-white">
        <div class="flex place-content-center justify-between pt-4 pr-4">
          <span />
          <button class="rounded-full bg-red-600 text-white font-bold" @click="emit('close')">
            <IconCross />
          </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4 mx-12 pb-4">
          <div class="md:col-span-2 overflow-x-auto">
            <table class="table-auto border-spacing-4 border-collapse profile-wrapper">
              <tbody class="text-sm text-left">
                <tr>
                  <td colspan="2">
                    <table class="w-full">
                      <tbody class="text-sm text-left">
                        <tr>
                          <th class="p-3">{{ $t('firstName') }}:</th>
                          <td class="p-3">{{ vendor?.FirstName }}</td>
                          <th class="p-3">{{ $t('lastName') }}:</th>
                          <td class="p-3">{{ vendor?.LastName }}</td>
                        </tr>
                        <tr>
                          <th class="p-3">{{ $t('LicenseId') }}:</th>
                          <td class="p-3">{{ vendor?.LicenseID }}</td>
                          <th class="p-3">{{ $t('accountDeactivation') }}:</th>
                          <td class="p-3">{{ $t(vendor?.IsDisabled ? 'yes' : 'no') }}</td>
                        </tr>
                        <tr>
                          <th class="p-3">{{ $t('lastPayout') }}:</th>
                          <td class="p-3">{{ vendor?.LastPayout }}</td>
                          <th class="p-3">{{ $t('currentCredit') }}:</th>
                          <td class="p-3">{{ formatCredit(vendor?.Balance) }} €</td>
                        </tr>
                        <tr>
                          <th class="p-3">{{ $t('E-mail') }}</th>
                          <td class="p-3">{{ vendor?.Email }}</td>
                          <th class="p-3">{{ $t('telephone') }}:</th>
                          <td class="p-3">{{ vendor?.Telephone }}</td>
                        </tr>
                        <tr>
                          <th class="p-3">{{ $t('vendorSince') }}:</th>
                          <td class="p-3">{{ vendor?.VendorSince }}</td>
                          <th class="p-3">{{ $t('registrationDate') }}:</th>
                          <td class="p-3">{{ vendor?.RegistrationDate }}</td>
                        </tr>
                        <tr>
                          <th class="p-3">{{ $t('Has a smartphone') }}</th>
                          <td class="p-3">{{ $t(vendor?.HasSmartphone ? 'yes' : 'no') }}</td>
                          <th class="p-3">{{ $t('bankAccount') }}:</th>
                          <td class="p-3">{{ $t(vendor?.HasBankAccount ? 'yes' : 'no') }}</td>
                        </tr>
                        <tr v-if="vendor?.Debt">
                          <th class="p-3">{{ $t('debt') }}</th>
                          <td class="p-3">{{ vendor?.Debt }}</td>
                        </tr>
                        <tr v-if="vendor?.AccountProofUrl">
                          <th class="p-3">{{ $t('verificationLink') }}</th>
                          <td class="p-3">{{ vendor?.AccountProofUrl }}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            <div class="flex flex-col mt-4">
              <div class="flex flex-row justify-between mb-4">
                <h2 class="block text-gray-700 text-sm font-bold mb-2 pt-3">
                  {{ $t('locations') }}
                </h2>
              </div>

              <div
                v-if="vendorStore?.vendorLocations && vendorStore.vendorLocations.length > 0"
                class="space-y-2 max-h-48 overflow-y-auto pr-1"
              >
                <div
                  v-for="location in vendorStore.vendorLocations"
                  :key="'location_' + location.id"
                  class="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 p-4 shadow-sm dark:border-gray-600 dark:from-gray-800 dark:to-gray-700"
                >
                  <div class="flex items-start justify-between gap-3">
                    <div>
                      <div class="text-sm font-semibold text-gray-900 dark:text-white">
                        {{ location.name }}
                      </div>
                      <div class="text-xs text-gray-600 dark:text-gray-300">
                        {{ location.address }}, {{ location.zip }}
                      </div>
                    </div>
                    <span
                      class="rounded-full bg-slate-900 px-2 py-1 text-[11px] font-semibold text-white dark:bg-white dark:text-slate-900"
                    >
                      {{ formatWorkingTimeMode(location.working_time) }}
                    </span>
                  </div>
                  <div class="mt-3 text-xs text-gray-700 dark:text-gray-300">
                    <span class="font-semibold text-gray-900 dark:text-white">
                      {{ $t('workingTime') }}:
                    </span>
                    <span class="ml-1">
                      {{ formatWorkingTimeDetails(location.working_time) }}
                    </span>
                  </div>
                </div>
              </div>
              <div v-else class="text-sm text-gray-600 dark:text-gray-400">
                {{ $t('noLocations') }}
              </div>
            </div>

            <div class="flex flex-col mt-4">
              <div class="flex flex-row justify-between mb-4">
                <h2 class="block text-gray-700 text-sm font-bold mb-2 pt-3">
                  {{ $t('comments') }}
                </h2>
              </div>

              <div
                v-if="vendorComments && vendorComments.length > 0"
                class="max-h-64 overflow-y-auto pr-1"
              >
                <div
                  v-for="comment in vendorComments"
                  :key="'comment_' + comment.id"
                  class="comment flex flex-row justify-between border border-gray-200 dark:border-gray-600 rounded p-2 mb-2 bg-gray-50 dark:bg-gray-800"
                >
                  <div
                    :class="
                      'comment-infos w-full' +
                      (comment.warning ? ' text-red-600 dark:text-red-400' : '')
                    "
                  >
                    <div
                      class="comment-title font-bold text-xs mb-1 text-gray-500 dark:text-gray-400"
                    >
                      {{ new Date(comment.created_at).toLocaleDateString() }}
                    </div>

                    <div class="comment-comment text-sm break-words">
                      <span v-if="comment.warning" class="comment-warning-label font-bold"
                        >{{ $t('warning') }}: </span
                      >{{ comment.comment }}
                    </div>
                    <div
                      v-if="
                        comment.resolved_at &&
                        new Date(comment.resolved_at).toLocaleDateString() !== '1.1.1'
                      "
                      class="text-xs mt-1 text-gray-500 dark:text-gray-400"
                    >
                      <label class="pr-2 font-bold">{{ $t('Resolved at') }}:</label>
                      <span>{{ new Date(comment.resolved_at).toLocaleDateString() }}</span>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <p>{{ $t('noComments') }}</p>
              </div>
            </div>
          </div>

          <div class="w-full h-full overflow-hidden">
            <div
              v-if="vendorStore?.vendorLocations && vendorStore?.vendorLocations?.length > 0"
              class="w-full h-full"
            >
              <VendorMapView
                v-if="vendorStore?.vendorLocations && vendorStore.vendorLocations.length > 0"
                :locations="vendorStore?.vendorLocations"
                :enable-search="false"
              />
            </div>
          </div>
        </div>

        <div class="flex justify-center items-center py-4 space-x-3">
          <router-link :to="{ path: '/backoffice/payments', query: { vendor: vendor?.LicenseID } }">
            <button
              v-if="vendor?.LicenseID"
              class="px-4 py-2 text-[16px] rounded-full h-[44px] customcolor mr-3 flex items-center"
            >
              {{ $t('bank statement') }}
            </button>
          </router-link>

          <router-link :to="`/backoffice/userprofile/${vendor?.ID}/update`">
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

<style lang="scss" scoped></style>
