<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { computed } from 'vue'
import IconCross from '@/components/icons/IconCross.vue'

const props = defineProps<{
  toast: {
    message: string
    type: string
  } | null
}>()

const emit = defineEmits(['close'])

const settingsStore = useSettingsStore()

const isError = computed(() => props.toast?.type === 'error')
</script>

<template>
  <div
    v-if="toast"
    class="toast shadow-lg rounded-full px-6 py-3 flex items-center justify-between gap-4"
    :class="isError ? 'bg-rose-700 text-white' : 'customcolor'"
  >
    <div class="text-lg font-semibold">{{ toast.message }}</div>
    <button class="flex-shrink-0" @click="emit('close')">
      <IconCross class="w-6 h-6" />
    </button>
  </div>
</template>

<style scoped>
.customcolor {
  background-color: v-bind(settingsStore.settings.Color);
  color: v-bind(settingsStore.settings.FontColor);
}
.toast {
  position: fixed;
  top: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  min-width: 300px;
  max-width: 90%;
}
</style>
