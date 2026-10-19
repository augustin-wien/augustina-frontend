import { watch } from 'vue'
import { createI18n } from 'vue-i18n'
import en from './en.json'
import de from './de.json'
import it from './it.json'

export const SUPPORTED_LOCALES = ['de', 'en', 'it'] as const
export const LOCALE_STORAGE_KEY = 'locale'

const DEFAULT_LOCALE = 'de'

function isSupported(locale: string | null | undefined): locale is string {
  return !!locale && (SUPPORTED_LOCALES as readonly string[]).includes(locale)
}

function storedLocale(): string | null {
  try {
    return window.localStorage.getItem(LOCALE_STORAGE_KEY)
  } catch {
    return null
  }
}

function browserLocale(): string | undefined {
  const languages = navigator.languages?.length ? navigator.languages : [navigator.language]
  return languages.map((l) => l?.toLowerCase().split('-')[0]).find(isSupported)
}

export function detectLocale(): string {
  const stored = storedLocale()
  if (isSupported(stored)) return stored
  return browserLocale() ?? DEFAULT_LOCALE
}

const initialLocale = detectLocale()

const i18n = createI18n({
  locale: initialLocale,
  messages: {
    de: de,
    en: en,
    it: it
  } as any,
  fallbackLocale: DEFAULT_LOCALE,
  formatFallbackMessages: true
})

document.documentElement.lang = initialLocale

watch(
  () => i18n.global.locale,
  (locale) => {
    document.documentElement.lang = locale

    try {
      window.localStorage.setItem(LOCALE_STORAGE_KEY, locale)
    } catch {
      // storage unavailable
    }
  }
)

export default i18n
