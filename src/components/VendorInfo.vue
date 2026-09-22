<script lang="ts" setup>
import VendorMapView from '@/components/VendorMapView.vue'
import { vendorsStore } from '@/stores/vendor'
import { formatCredit } from '@/utils/utils'
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'

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
  <Modal open size="lg" :title="`${vendor?.LicenseID} ${vendor?.FirstName}`" @close="emit('close')">
    <div class="vendorinfo-grid">
      <table class="aug-table">
        <tbody>
          <tr>
            <th>{{ $t('firstName') }}:</th>
            <td>{{ vendor?.FirstName }}</td>
            <th>{{ $t('lastName') }}:</th>
            <td>{{ vendor?.LastName }}</td>
          </tr>
          <tr>
            <th>{{ $t('LicenseId') }}:</th>
            <td>{{ vendor?.LicenseID }}</td>
            <th>{{ $t('accountDeactivation') }}:</th>
            <td>{{ $t(vendor?.IsDisabled ? 'yes' : 'no') }}</td>
          </tr>
          <tr>
            <th>{{ $t('lastPayout') }}:</th>
            <td>{{ formatVendorDate(vendor?.LastPayout) }}</td>
            <th>{{ $t('currentCredit') }}:</th>
            <td>{{ formatCredit(vendor?.Balance) }} €</td>
          </tr>
          <tr>
            <th>{{ $t('E-mail') }}:</th>
            <td>{{ vendor?.Email || '–' }}</td>
            <th>{{ $t('telephone') }}:</th>
            <td>{{ vendor?.Telephone || '–' }}</td>
          </tr>
          <tr>
            <th>{{ $t('vendorSince') }}:</th>
            <td>{{ formatVendorDate(vendor?.VendorSince) }}</td>
            <th>{{ $t('registrationDate') }}:</th>
            <td>{{ formatVendorDate(vendor?.RegistrationDate) }}</td>
          </tr>
          <tr>
            <th>{{ $t('Has a smartphone') }}:</th>
            <td>{{ $t(vendor?.HasSmartphone ? 'yes' : 'no') }}</td>
            <th>{{ $t('bankAccount') }}:</th>
            <td>{{ $t(vendor?.HasBankAccount ? 'yes' : 'no') }}</td>
          </tr>
          <tr v-if="vendor?.Debt">
            <th>{{ $t('debt') }}:</th>
            <td>{{ vendor?.Debt }}</td>
          </tr>
          <tr v-if="vendor?.AccountProofUrl">
            <th>{{ $t('verificationLink') }}:</th>
            <td>{{ vendor?.AccountProofUrl }}</td>
          </tr>
        </tbody>
      </table>

      <div class="vendorinfo-map">
        <VendorMapView
          v-if="vendorStore.vendorLocations && vendorStore.vendorLocations.length > 0"
          :locations="vendorStore.vendorLocations"
          :enable-search="false"
        />
      </div>

      <div class="vendorinfo-lists">
        <div>
          <h2 class="vendorinfo-list-title">{{ $t('locations') }}</h2>
          <div
            v-if="vendorStore.vendorLocations && vendorStore.vendorLocations.length > 0"
            class="vendorinfo-list"
          >
            <div v-for="location in vendorStore.vendorLocations" :key="'location_' + location.id">
              <div class="vendorinfo-row">
                <div>
                  <div class="vendorinfo-row-title">{{ location.name }}</div>
                  <div class="vendorinfo-row-sub">{{ location.address }}, {{ location.zip }}</div>
                </div>
                <Badge variant="neutral">{{ formatWorkingTimeMode(location.working_time) }}</Badge>
              </div>
              <div class="vendorinfo-row-detail">
                <span class="vendorinfo-row-title">{{ $t('workingTime') }}:</span>
                {{ formatWorkingTimeDetails(location.working_time) }}
              </div>
            </div>
          </div>
          <p v-else class="vendorinfo-empty">{{ $t('noLocations') }}</p>
        </div>

        <div>
          <h2 class="vendorinfo-list-title">{{ $t('comments') }}</h2>
          <div v-if="vendorComments && vendorComments.length > 0" class="vendorinfo-list">
            <div
              v-for="comment in vendorComments"
              :key="'comment_' + comment.id"
              :class="{ 'vendorinfo-warning': comment.warning }"
            >
              <div class="vendorinfo-row-date">
                {{ new Date(comment.created_at).toLocaleDateString() }}
              </div>
              <div class="vendorinfo-row-detail">
                <span v-if="comment.warning" class="vendorinfo-row-title"
                  >{{ $t('warning') }}:
                </span>
                {{ comment.comment }}
              </div>
              <div
                v-if="formatVendorDate(comment.resolved_at?.toString()) !== '–'"
                class="vendorinfo-row-date"
              >
                <span class="vendorinfo-row-title">{{ $t('Resolved at') }}:</span>
                {{ formatVendorDate(comment.resolved_at?.toString()) }}
              </div>
            </div>
          </div>
          <p v-else class="vendorinfo-empty">{{ $t('noComments') }}</p>
        </div>
      </div>
    </div>

    <template #footer>
      <router-link
        v-if="vendor?.LicenseID"
        :to="{ path: '/backoffice/payments', query: { vendor: vendor?.LicenseID } }"
      >
        <Button variant="secondary">{{ $t('bank statement') }}</Button>
      </router-link>
      <router-link :to="`/backoffice/userprofile/${vendor?.ID}/comments`">
        <Button variant="secondary">{{ $t('comments') }}</Button>
      </router-link>
      <router-link :to="`/backoffice/userprofile/${vendor?.ID}/update`">
        <Button variant="primary">{{ $t('change') }}</Button>
      </router-link>
    </template>
  </Modal>
</template>

<style scoped>
.vendorinfo-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.vendorinfo-map {
  min-height: 190px;
  overflow: hidden;
  border-radius: var(--radius-sm);
}
.vendorinfo-lists {
  grid-column: span 2;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
}
.vendorinfo-list-title {
  font-size: 12px;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: 8px;
}
.vendorinfo-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 190px;
  overflow-y: auto;
  padding-right: 4px;
}
.vendorinfo-list > div {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  padding: 10px 12px;
}
.vendorinfo-row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 8px;
}
.vendorinfo-row-title {
  font-size: 13px;
  font-weight: 600;
}
.vendorinfo-row-sub {
  font-size: 12px;
  color: var(--color-text-muted);
}
.vendorinfo-row-detail {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
}
.vendorinfo-row-date {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}
.vendorinfo-warning {
  color: var(--color-danger);
}
.vendorinfo-empty {
  font-size: 13px;
  color: var(--color-text-muted);
}

@media (max-width: 640px) {
  .vendorinfo-grid,
  .vendorinfo-lists {
    grid-template-columns: 1fr;
  }
  .vendorinfo-lists {
    grid-column: span 1;
  }
}
</style>
