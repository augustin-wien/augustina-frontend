import { computed, onUnmounted, watchEffect } from 'vue'
import { usePreferredDark, useStorage } from '@vueuse/core'

export type ColorSchemeMode = 'auto' | 'light' | 'dark'

const mode = useStorage<ColorSchemeMode>('backoffice-color-scheme', 'auto')
const preferredDark = usePreferredDark()

const isDark = computed(() => (mode.value === 'auto' ? preferredDark.value : mode.value === 'dark'))

export function useColorScheme() {
  return { mode, isDark }
}

// Sets <html data-theme> for assets/tokens.css while a backoffice layout is mounted.
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
