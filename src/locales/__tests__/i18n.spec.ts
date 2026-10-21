import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick } from 'vue'

function setBrowserLanguages(languages: string[]) {
  vi.spyOn(navigator, 'languages', 'get').mockReturnValue(languages)
  vi.spyOn(navigator, 'language', 'get').mockReturnValue(languages[0] ?? '')
}

async function loadI18n() {
  vi.resetModules()
  return import('../i18n')
}

describe('locale detection', () => {
  beforeEach(() => {
    window.localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('uses the first supported browser language', async () => {
    setBrowserLanguages(['fr-FR', 'it-IT', 'en-US'])
    const { default: i18n } = await loadI18n()
    expect(i18n.global.locale).toBe('it')
    expect(document.documentElement.lang).toBe('it')
  })

  it('falls back to German when no browser language is supported', async () => {
    setBrowserLanguages(['fr-FR', 'es'])
    const { default: i18n } = await loadI18n()
    expect(i18n.global.locale).toBe('de')
  })

  it('prefers a stored manual choice over the browser language', async () => {
    window.localStorage.setItem('locale', 'en')
    setBrowserLanguages(['it-IT'])
    const { default: i18n } = await loadI18n()
    expect(i18n.global.locale).toBe('en')
  })

  it('ignores an unsupported stored value', async () => {
    window.localStorage.setItem('locale', 'xx')
    setBrowserLanguages(['en-GB'])
    const { default: i18n } = await loadI18n()
    expect(i18n.global.locale).toBe('en')
  })

  it('does not store the detected language', async () => {
    setBrowserLanguages(['it-IT'])
    await loadI18n()
    await nextTick()
    expect(window.localStorage.getItem('locale')).toBeNull()
  })

  it('stores a manual change so it survives a reload', async () => {
    setBrowserLanguages(['de-AT'])
    const { default: i18n } = await loadI18n()
    i18n.global.locale = 'it'
    await nextTick()
    expect(window.localStorage.getItem('locale')).toBe('it')

    const { default: reloaded } = await loadI18n()
    expect(reloaded.global.locale).toBe('it')
  })
})
