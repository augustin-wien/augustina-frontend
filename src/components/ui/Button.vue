<script setup lang="ts">
withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'danger' | 'ghost'
    type?: 'button' | 'submit'
  }>(),
  { variant: 'primary', type: 'button' }
)
</script>

<template>
  <button :type="type" class="aug-btn" :class="`aug-btn-${variant}`">
    <slot />
  </button>
</template>

<style scoped>
.aug-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid transparent;
  border-radius: var(--radius-sm);
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: filter 0.1s ease;
}
.aug-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
.aug-btn:not(:disabled):hover {
  filter: brightness(0.96);
}
.aug-btn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}

.aug-btn-primary {
  background: var(--color-accent);
  color: var(--color-accent-fg);
}
.aug-btn-secondary {
  background: var(--color-bg);
  color: var(--color-text);
  border-color: var(--color-border);
}
.aug-btn-danger {
  background: var(--color-danger-bg);
  color: var(--color-danger);
}
.aug-btn-ghost {
  background: transparent;
  color: var(--color-text-muted);
}
</style>
