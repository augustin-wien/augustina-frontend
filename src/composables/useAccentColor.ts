import { watch } from 'vue'
import { useSettingsStore } from '@/stores/settings'

// Keeps --color-accent / --color-accent-fg (defined in assets/tokens.css) in sync with the
// admin-configurable settings.Color / settings.FontColor, so any component can style itself with
// the brand color via var(--color-accent) instead of redeclaring its own v-bind() binding.
export function useAccentColor() {
  const settingsStore = useSettingsStore()

  watch(
    () => [settingsStore.settings.Color, settingsStore.settings.FontColor],
    ([color, fontColor]) => {
      const root = document.documentElement.style
      if (color) root.setProperty('--color-accent', color)
      if (fontColor) root.setProperty('--color-accent-fg', fontColor)
    },
    { immediate: true }
  )
}
