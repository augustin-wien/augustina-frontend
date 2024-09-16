<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settStore = useSettingsStore()
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full font-semibold grid text-xl">
        <div class="text-center mb-5">
          {{ $t('maintenance') }}
        </div>
        <a class="w-full" :href="settStore.settings.MaintainanceModeHelpUrl">
          <button
            class="customcolor background-color rounded-full p-5 text-white text-3xl w-full font-semibold"
          >
            {{ settStore.settings.NewspaperName }}
          </button>
        </a>
      </div>
    </template>
  </component>
</template>

<style scoped>
.customcolor {
  background-color: v-bind(settStore.settings.Color);
  color: v-bind(settStore.settings.FontColor);
}
</style>
