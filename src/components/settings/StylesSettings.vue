<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { set } from '@vueuse/core'
import Card from '@/components/ui/Card.vue'

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
  <Card>
    <h2 class="section-title">{{ $t('Custom styles') }}</h2>
    <textarea id="styles" v-model="stylesLocal" class="aug-input styles-textarea" />
  </Card>
</template>

<style scoped>
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
}
.styles-textarea {
  min-height: 300px;
  font-family: ui-monospace, monospace;
  resize: vertical;
}
</style>
