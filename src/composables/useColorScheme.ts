import { computed, onUnmounted, watchEffect } from 'vue'
import { usePreferredDark, useStorage } from '@vueuse/core'

export type ColorSchemeMode = 'auto' | 'light' | 'dark'

// Module-level so every component shares the same choice. 'auto' follows the OS/browser
// preference, 'light'/'dark' override it. Stored per browser, not per user account.
const mode = useStorage<ColorSchemeMode>('backoffice-color-scheme', 'auto')
const preferredDark = usePreferredDark()

const isDark = computed(() => (mode.value === 'auto' ? preferredDark.value : mode.value === 'dark'))

export function useColorScheme() {
  return { mode, isDark }
}

// Mirrors the chosen mode onto <html data-theme="...">, which assets/tokens.css reads to pick the
// light or dark palette. Only the backoffice layout calls this, so the attribute is removed again
// when leaving the backoffice and the public pages keep following the OS preference.
// Every backoffice view renders its own layout instance, so on a route change the new layout is
// set up before the old one unmounts. Counting the mounted instances keeps the old one from
// removing the attribute the new one just set.
let activeLayouts = 0

export function useApplyColorScheme() {
  const root = document.documentElement
  activeLayouts++

  watchEffect(() => {
    if (mode.value === 'auto') delete root.dataset.theme
    else root.dataset.theme = mode.value
  })

  onUnmounted(() => {
    activeLayouts--
    if (activeLayouts === 0) delete root.dataset.theme
  })
}
