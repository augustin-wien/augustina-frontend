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
  <div class="styles_form">
    <label class="block text-gray-700 text-sm font-bold mb-2 pt-3" for="styles"
      >{{ $t('Custom styles') }}:</label
    >
    <textarea
      id="styles"
      v-model="stylesLocal"
      class="appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline h-[300px]"
      type="textarea"
    />
    <div class="flex place-content-center">
      <button
        id="saveSettings"
        type="submit"
        class="px-4 py-2 ps-2 mt-2 rounded-full customcolor h-[44px]"
        @click="saveStyles()"
      >
        {{ $t('saveCustomCss') }}
      </button>
    </div>
    <button
      id="saveStylesSticky"
      type="button"
      class="px-4 py-2 rounded-full customcolor h-[44px]"
      @click="saveStyles()"
    >
      {{ $t('saveCustomCss') }}
    </button>
  </div>
</template>
