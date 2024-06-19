<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'

const settStore = useSettingsStore()
settStore.getSettingsFromApi()
const maintenanceUrl = import.meta.env.VITE_MAINTENANCE_HELP_URL
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full font-semibold grid text-xl">
        <div class="text-center mb-5">
          {{ $t('maintenance') }}
        </div>
        <a class="w-full" :href="maintenanceUrl">
          <button
            class="customcolor background-color rounded-full p-5 text-white text-3xl w-full font-semibold"
          >
            {{ $t('augustin') }}
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
