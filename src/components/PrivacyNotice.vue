<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import {
  isMatomoConfigured,
  isMatomoOptedOut,
  isPrivacyNoticeSeen,
  markPrivacyNoticeSeen,
  setMatomoOptOut
} from '@/utils/matomo'

const settingsStore = useSettingsStore()

const settings = computed(() => settingsStore.settings)

// Someone who already decided — either by acknowledging or by opting out — is not asked again.
const dismissed = ref(isPrivacyNoticeSeen() || isMatomoOptedOut())

// Nothing to inform about on a tenant without analytics. The settings arrive asynchronously, so
// this stays a computed rather than a one-off check.
const visible = computed(() => isMatomoConfigured(settings.value) && !dismissed.value)

const acknowledge = () => {
  markPrivacyNoticeSeen()
  dismissed.value = true
}

const optOut = () => {
  setMatomoOptOut(true)
  markPrivacyNoticeSeen()
  dismissed.value = true
}
</script>

<template>
  <div
    v-if="visible"
    role="region"
    :aria-label="$t('matomoNoticeTitle')"
    class="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white px-4 py-3 shadow-lg"
  >
    <div class="mx-auto flex max-w-md flex-col gap-2 text-xs text-gray-600">
      <p>{{ $t('matomoNoticeText') }}</p>

      <div class="flex flex-wrap items-center gap-x-3 gap-y-2">
        <button
          type="button"
          class="rounded-full customcolor px-4 py-2 font-semibold"
          @click="acknowledge"
        >
          {{ $t('matomoNoticeAccept') }}
        </button>

        <button type="button" class="underline" @click="optOut">
          {{ $t('matomoOptOut') }}
        </button>

        <button
          v-if="settings.PrivacyPolicyUrl"
          type="button"
          class="underline"
          @click="settingsStore.toPrivacyPolicy()"
        >
          {{ $t('privacyPolicy') }}
        </button>
      </div>
    </div>
  </div>
</template>
