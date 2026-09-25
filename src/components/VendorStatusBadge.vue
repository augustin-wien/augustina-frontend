<script setup lang="ts">
import Badge from '@/components/ui/Badge.vue'

// Marks a vendor as blocked (can't sell) or disabled (no longer active) in vendor tables
defineProps<{ blocked?: boolean; disabled?: boolean; note?: string }>()
</script>

<template>
  <span v-if="blocked || disabled" class="vendor-status">
    <Badge v-if="blocked" variant="danger" :title="note">{{ $t('blocked') }}</Badge>
    <Badge v-if="disabled" variant="neutral">{{ $t('deactivated') }}</Badge>
  </span>
</template>

<style scoped>
.vendor-status {
  display: inline-flex;
  gap: 4px;
  margin-left: 6px;
  vertical-align: middle;
}
</style>
