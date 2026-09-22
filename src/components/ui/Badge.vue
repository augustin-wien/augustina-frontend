<script setup lang="ts">
withDefaults(defineProps<{ variant?: 'success' | 'danger' | 'info' | 'neutral' }>(), {
  variant: 'neutral'
})
</script>

<template>
  <span class="aug-badge" :class="`aug-badge-${variant}`">
    <slot />
  </span>
</template>

<style scoped>
.aug-badge {
  display: inline-flex;
  align-items: center;
  font-size: 11.5px;
  font-weight: 600;
  padding: 3px 9px;
  border-radius: 999px;
  line-height: 1.4;
}
.aug-badge-success {
  background: var(--color-success-bg);
  color: var(--color-success);
}
.aug-badge-danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}
.aug-badge-info {
  background: var(--color-info-bg);
  color: var(--color-info);
}
.aug-badge-neutral {
  background: var(--color-surface-alt);
  color: var(--color-text-muted);
  border: 1px solid var(--color-border);
}
</style>
