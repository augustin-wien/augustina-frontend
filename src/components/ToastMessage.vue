<script setup lang="ts">
import { computed } from 'vue'
import IconCross from '@/components/icons/IconCross.vue'

const props = defineProps<{
  toast: {
    message: string
    type: string
  } | null
}>()

const emit = defineEmits(['close'])

const isError = computed(() => props.toast?.type === 'error')
</script>

<template>
  <div v-if="toast" class="toast" :class="isError ? 'toast-error' : 'toast-accent'">
    <div class="toast-message">{{ toast.message }}</div>
    <button class="toast-close" @click="emit('close')">
      <IconCross class="w-6 h-6" />
    </button>
  </div>
</template>

<style scoped>
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  min-width: 300px;
  max-width: 90%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 24px;
  border-radius: 999px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
}
.toast-message {
  font-size: 16px;
  font-weight: 600;
}
.toast-close {
  flex-shrink: 0;
}
.toast-accent {
  background: var(--color-accent);
  color: var(--color-accent-fg);
}
.toast-error {
  background: var(--color-danger);
  color: #fff;
}
</style>
