<script setup lang="ts">
import { computed } from 'vue'
import { faTriangleExclamation } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import type { VendorComment } from '@/stores/vendor'
import { isOpenWarning } from '@/utils/vendorComments'

const props = defineProps<{
  comments: VendorComment[] | null | undefined
  // Links "show all" to the vendor's comments when set
  vendorId?: number
}>()

const openWarnings = computed(() => (props.comments ?? []).filter(isOpenWarning))

function formatDay(date: string | Date) {
  return new Date(date).toLocaleDateString()
}
</script>

<template>
  <div v-if="openWarnings.length" class="vendor-warnings" role="alert">
    <FontAwesomeIcon :icon="faTriangleExclamation" class="vendor-warnings-icon" />
    <div class="vendor-warnings-body">
      <div class="vendor-warnings-title">
        {{ $t('profileOpenWarnings') }} ({{ openWarnings.length }})
      </div>
      <div v-for="w in openWarnings" :key="w.id" class="vendor-warnings-text">
        <strong>{{ formatDay(w.created_at) }}:</strong> {{ w.comment }}
      </div>
      <router-link
        v-if="vendorId"
        :to="`/backoffice/userprofile/${vendorId}/comments`"
        class="vendor-warnings-link"
      >
        {{ $t('profileShowAll') }}
      </router-link>
    </div>
  </div>
</template>

<style scoped>
.vendor-warnings {
  display: flex;
  gap: 14px;
  align-items: flex-start;
  padding: 14px 18px;
  border: 2px solid var(--color-danger);
  border-left-width: 6px;
  border-radius: var(--radius);
  background: var(--color-danger-bg);
  color: var(--color-danger);
}
.vendor-warnings-icon {
  font-size: 22px;
  margin-top: 1px;
}
.vendor-warnings-body {
  min-width: 0;
}
.vendor-warnings-title {
  font-size: 15px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.03em;
}
.vendor-warnings-text {
  font-size: 14px;
  margin-top: 4px;
  white-space: pre-line;
  overflow-wrap: anywhere;
}
.vendor-warnings-link {
  display: inline-block;
  margin-top: 6px;
  font-size: 13px;
  color: inherit;
  text-decoration: underline;
}
</style>
