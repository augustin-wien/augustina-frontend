<script setup lang="ts">
import { computed } from 'vue'
import { useSettingsStore } from '@/stores/settings'

const settingsStore = useSettingsStore()

const privacyPolicyUrl = computed(() => settingsStore.settings.PrivacyPolicyUrl)
</script>

<template>
  <div
    v-if="privacyPolicyUrl"
    class="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 px-4 py-3 text-xs text-gray-500"
  >
    <button type="button" class="underline" @click="settingsStore.toPrivacyPolicy()">
      {{ $t('privacyPolicy') }}
    </button>
  </div>
</template>
