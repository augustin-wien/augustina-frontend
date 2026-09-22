<script setup lang="ts">
import { ref, watch, nextTick } from 'vue'

const props = defineProps<{ open: boolean; title?: string }>()
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
  <dialog ref="dialogEl" class="aug-modal" @cancel="emit('close')" @close="emit('close')">
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
  max-height: calc(100vh - 32px);
  border: none;
  border-radius: var(--radius);
  padding: 0;
  width: min(480px, calc(100vw - 32px));
  background: var(--color-surface);
  color: var(--color-text);
  box-shadow: 0 20px 40px -10px rgba(0, 0, 0, 0.25);
}
.aug-modal::backdrop {
  background: rgba(0, 0, 0, 0.4);
}
.aug-modal-header {
  display: flex;
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
  padding: 20px;
}
.aug-modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  padding: 16px 20px;
  border-top: 1px solid var(--color-border);
}
</style>
