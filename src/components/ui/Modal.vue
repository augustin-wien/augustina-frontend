<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = withDefaults(
  defineProps<{ open: boolean; title?: string; size?: 'sm' | 'md' | 'lg' }>(),
  { size: 'md' }
)

const emit = defineEmits<{ close: [] }>()

const dialogEl = ref<HTMLDialogElement | null>(null)

watch(
  () => props.open,
  async (isOpen) => {
    await nextTick()

    if (isOpen) {
      dialogEl.value?.showModal()
    } else {
      dialogEl.value?.close()
    }
  },
  { immediate: true }
)
</script>

<template>
  <dialog
    ref="dialogEl"
    class="aug-modal"
    :class="`aug-modal-${size}`"
    @cancel="emit('close')"
    @close="emit('close')"
  >
    <div v-if="title || $slots.header" class="aug-modal-header">
      <slot name="header">
        <h3 class="aug-modal-title">{{ title }}</h3>
      </slot>
      <button type="button" class="aug-icon-btn" aria-label="Close" @click="emit('close')">
        ✕
      </button>
    </div>
    <div class="aug-modal-body">
      <slot />
    </div>
    <div v-if="$slots.footer" class="aug-modal-footer">
      <slot name="footer" />
    </div>
  </dialog>
</template>

<style scoped>
.aug-modal {
  /* Tailwind's preflight zeroes margin on every element (including dialog), which breaks the
     native dialog:modal centering trick (fixed + inset:0 + margin:auto) - restore it explicitly. */
  margin: auto;
  border: none;
  border-radius: var(--radius);
  padding: 0;
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25);
}
/* The UA stylesheet is what actually hides a dialog without the open attribute (`dialog {
   display: none } dialog[open] { display: block }`) - author rules always beat UA rules
   regardless of specificity, so an unconditional `display: flex` here would force every Modal
   instance permanently visible, open or not. Scope it to [open] so closed dialogs stay hidden. */
.aug-modal[open] {
  display: flex;
  flex-direction: column;
  /* Content can be taller than the viewport (AddressModal's working-time editor, VendorInfo's
     detail grid) - cap the dialog and let the body scroll instead of the dialog overflowing. */
  max-height: calc(100vh - 64px);
}
/* sm/lg exist for content that's narrower or wider than a typical confirm/short-form dialog -
   AddressModal (a form beside a map) and VendorInfo (a two-column detail grid) both need lg. */
.aug-modal-sm {
  width: min(360px, calc(100vw - 32px));
}
.aug-modal-md {
  width: min(480px, calc(100vw - 32px));
}
.aug-modal-lg {
  width: min(880px, calc(100vw - 32px));
}
.aug-modal::backdrop {
  background: rgba(0, 0, 0, 0.4);
}
.aug-modal-header {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid var(--color-border);
}
.aug-modal-title {
  font-size: 16px;
  font-weight: 600;
  margin: 0;
}
.aug-modal-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 20px;
}
.aug-modal-footer {
  display: flex;
  flex: none;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}
</style>
