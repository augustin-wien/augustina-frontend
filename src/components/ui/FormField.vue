<script setup lang="ts">
defineProps<{
  label?: string
  for?: string
  error?: string
  hint?: string
  required?: boolean
}>()
</script>

<template>
  <div class="aug-field">
    <label v-if="label" :for="$props.for" class="aug-field-label">
      {{ label }}<span v-if="required" class="aug-field-required">*</span>
    </label>
    <slot />
    <p v-if="error" class="aug-field-error">{{ error }}</p>
    <p v-else-if="hint" class="aug-field-hint">{{ hint }}</p>
  </div>
</template>

<style scoped>
.aug-field {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.aug-field-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-muted);
}
.aug-field-required {
  color: var(--color-danger);
  margin-left: 2px;
}
.aug-field-error {
  font-size: 12px;
  color: var(--color-danger);
  margin: 0;
}
.aug-field-hint {
  font-size: 12px;
  color: var(--color-text-muted);
  margin: 0;
}
</style>
