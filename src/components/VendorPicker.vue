<script setup lang="ts">
import type { Vendor } from '@/stores/vendor'
import { computed, ref, watch } from 'vue'

// Type-ahead vendor picker. Some deployments have well over a thousand vendors, so this
// searches by license ID and name and only ever renders a handful of matches.
const props = defineProps<{
  modelValue: number | null | undefined
  vendors: Vendor[]
  id?: string
  placeholder?: string
}>()

const emit = defineEmits<{ 'update:modelValue': [value: number | null] }>()

const MAX_RESULTS = 10

const label = (vendor: Vendor) => `${vendor.LicenseID} – ${vendor.FirstName} ${vendor.LastName}`

const selected = computed(() => props.vendors.find((vendor) => vendor.ID === props.modelValue))

const query = ref('')
const open = ref(false)
const highlighted = ref(0)

// Show the chosen vendor in the input whenever the selection changes from outside
watch(
  selected,
  (vendor) => {
    query.value = vendor ? label(vendor) : ''
  },
  { immediate: true }
)

const matches = computed(() => {
  const term = query.value.trim().toLowerCase()

  if (!term) return props.vendors.slice(0, MAX_RESULTS)

  // License IDs that start with the term first, then anything containing it
  const scored: Array<[number, Vendor]> = []

  for (const vendor of props.vendors) {
    const license = (vendor.LicenseID ?? '').toLowerCase()
    const name = `${vendor.FirstName} ${vendor.LastName}`.toLowerCase()

    if (license.startsWith(term)) scored.push([0, vendor])
    else if (license.includes(term) || name.includes(term)) scored.push([1, vendor])
  }

  return scored
    .sort((a, b) => a[0] - b[0])
    .slice(0, MAX_RESULTS)
    .map(([, vendor]) => vendor)
})

const choose = (vendor: Vendor | null) => {
  emit('update:modelValue', vendor ? vendor.ID : null)
  query.value = vendor ? label(vendor) : ''
  open.value = false
}

const onInput = () => {
  open.value = true
  highlighted.value = 0
}

const onKeydown = (event: KeyboardEvent) => {
  if (event.key === 'ArrowDown') {
    event.preventDefault()
    open.value = true
    highlighted.value = Math.min(highlighted.value + 1, matches.value.length - 1)
  } else if (event.key === 'ArrowUp') {
    event.preventDefault()
    highlighted.value = Math.max(highlighted.value - 1, 0)
  } else if (event.key === 'Enter' && open.value) {
    event.preventDefault()
    const vendor = matches.value[highlighted.value]
    if (vendor) choose(vendor)
  } else if (event.key === 'Escape') {
    open.value = false
  }
}

// Leaving the field without picking restores the current selection
const onBlur = () => {
  // Delay so a click on a result still registers
  setTimeout(() => {
    open.value = false
    query.value = selected.value ? label(selected.value) : ''
  }, 150)
}
</script>

<template>
  <div class="vendor-picker">
    <div class="vendor-picker-field">
      <input
        :id="id"
        v-model="query"
        class="aug-input"
        type="text"
        role="combobox"
        autocomplete="off"
        :aria-expanded="open"
        :aria-controls="`${id ?? 'vendor-picker'}-list`"
        :placeholder="placeholder"
        @focus="open = true"
        @input="onInput"
        @keydown="onKeydown"
        @blur="onBlur"
      />
      <button
        v-if="modelValue"
        type="button"
        class="vendor-picker-clear"
        :aria-label="$t('noVendorAssigned')"
        :title="$t('noVendorAssigned')"
        @mousedown.prevent="choose(null)"
      >
        ×
      </button>
    </div>
    <ul
      v-if="open && matches.length"
      :id="`${id ?? 'vendor-picker'}-list`"
      role="listbox"
      class="vendor-picker-list"
    >
      <li
        v-for="(vendor, index) in matches"
        :key="vendor.ID"
        role="option"
        :aria-selected="vendor.ID === modelValue"
        class="vendor-picker-option"
        :class="{ highlighted: index === highlighted }"
        @mousedown.prevent="choose(vendor)"
        @mouseenter="highlighted = index"
      >
        <span class="vendor-picker-license">{{ vendor.LicenseID }}</span>
        {{ vendor.FirstName }} {{ vendor.LastName }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
.vendor-picker {
  position: relative;
}
.vendor-picker-field {
  position: relative;
}
.vendor-picker-field .aug-input {
  padding-right: 32px;
}
.vendor-picker-clear {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  border: none;
  background: none;
  font-size: 18px;
  line-height: 1;
  color: var(--color-text-muted);
  cursor: pointer;
}
.vendor-picker-list {
  position: absolute;
  z-index: 20;
  left: 0;
  right: 0;
  margin-top: 4px;
  max-height: 260px;
  overflow-y: auto;
  background: var(--color-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  box-shadow: 0 6px 16px rgb(0 0 0 / 0.12);
  list-style: none;
  padding: 4px 0;
}
.vendor-picker-option {
  padding: 6px 12px;
  font-size: 13px;
  cursor: pointer;
}
.vendor-picker-option.highlighted {
  background: var(--color-surface-alt);
}
.vendor-picker-license {
  font-weight: 600;
  margin-right: 6px;
}
</style>
