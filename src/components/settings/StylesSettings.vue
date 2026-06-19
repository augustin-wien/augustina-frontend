<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { set } from '@vueuse/core'

const emits = defineEmits(['saved', 'error'])

const settingsStore = useSettingsStore()
const stylesLocal = ref(settingsStore.styles || '')

watch(settingsStore.styles, (newVal: any) => {
  if (newVal) {
    set(stylesLocal, newVal)
  }
})

const saveStyles = async () => {
  try {
    await settingsStore.updateStyleCss(stylesLocal.value)
    emits('saved', 'Einstellungen erfolgreich aktualisiert')
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Error saving styles:', err)
    emits('error', 'Einstellungen konnten nicht aktualisiert werden')
  }
}

defineExpose({ saveStyles })
</script>

<template>
  <div class="space-y-6">
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
      <h2 class="text-base font-semibold text-gray-800 mb-4">{{ $t('Custom styles') }}</h2>
      <textarea
        id="styles"
        v-model="stylesLocal"
        class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-[300px]"
      />
    </div>
  </div>
</template>
