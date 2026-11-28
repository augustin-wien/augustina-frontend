import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import Chart from 'chart.js/auto'
import QRCodeStyling from 'qr-code-styling'
import { RandomInput, exportAsCsv, formatCredit, formatDate, transformToFloat } from '@/utils/utils'
import { chartPngFilename, exportChartPng, slugify } from '@/utils/chartPng'
import { downloadAllQrCodes, qrLogo, vendorQrCode } from '@/utils/qrCode'
import * as f from '@/__tests__/support/fixtures'
import type { Settings } from '@/stores/settings'
import { createMemoryHistory, createRouter } from 'vue-router'

const settings = (overrides: Partial<Settings> = {}) =>
  ({ ...f.settings(), ...overrides }) as unknown as Settings

let clicked: HTMLAnchorElement[] = []

beforeEach(() => {
  clicked = []

  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
    this: HTMLAnchorElement
  ) {
    clicked.push(this)
  })
})

afterEach(() => vi.restoreAllMocks())

describe('utils', () => {
  it('formats credits and dates', () => {
    expect(formatCredit(undefined)).toBe(0)
    expect(formatCredit(1250)).toBe('12,50')
    expect(formatDate('')).toBe('')
    expect(formatDate('2026-10-01T10:00:00Z')).not.toBe('')
  })

  it('turns numbers and german decimal strings into floats', () => {
    expect(transformToFloat('3,5')).toBe(3.5)
    expect(transformToFloat(4)).toBe(4)
    expect(transformToFloat(4.25)).toBe(4.25)
  })

  it('exports rows as csv and quotes cells that would break the row', () => {
    exportAsCsv(
      [
        ['Name', 'Adresse'],
        ['Anna', 'Gasse 1; Stiege 2'],
        ['Bernd "B"', null]
      ],
      'liste'
    )

    expect(clicked).toHaveLength(1)
    expect(clicked[0].download).toBe('liste.csv')

    expect(decodeURIComponent(clicked[0].href.split(',')[1])).toBe(
      'Name;Adresse\nAnna;"Gasse 1; Stiege 2"\n"Bernd ""B""";\n'
    )
  })

  it('generates random test input in the expected ranges', () => {
    expect(RandomInput.getRandomNumber(3, 3)).toBe(3)
    expect(RandomInput.getRandomString(6)).toMatch(/^[A-Za-z0-9]{6}$/)
    expect(RandomInput.getRandomId()).toMatch(/^fl-\d{3}$/)
    expect(Number(RandomInput.getRandomLongitude())).toBeGreaterThanOrEqual(16.2)
    expect(Number(RandomInput.getRandomLatitude())).toBeLessThanOrEqual(48.1)
    expect(RandomInput.getRandomEmail()).toMatch(/^[A-Za-z0-9]{8}@/)
    expect(RandomInput.getRandomFirstName()).toBeTruthy()
    expect(RandomInput.getRandomLastName()).toBeTruthy()
    expect(typeof RandomInput.getRandomBoolean()).toBe('boolean')
    expect(RandomInput.getRandomPhoneNumber()).toMatch(/^\+1\d{10}$/)
  })
})

describe('chartPng', () => {
  it('builds ascii file names', () => {
    expect(slugify(' Größe & Übersicht ')).toBe('groesse_uebersicht')
    expect(chartPngFilename('Tage', '1.–2.')).toBe('statistik_tage_1_2.png')
  })

  it('draws title, period and chart into one png at print resolution', () => {
    const ctx = { fillRect: vi.fn(), fillText: vi.fn(), drawImage: vi.fn() }
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctx as never)
    vi.spyOn(HTMLCanvasElement.prototype, 'toDataURL').mockReturnValue('data:image/png;base64,x')

    const chart = {
      stop: vi.fn(),
      resize: vi.fn(),
      update: vi.fn(),
      options: { devicePixelRatio: 1 }
    }

    vi.mocked(Chart.getChart).mockReturnValue(chart as never)

    exportChartPng(document.createElement('canvas'), 'Einnahmen', 'Oktober')

    expect(ctx.fillText).toHaveBeenCalledWith('Einnahmen', expect.any(Number), expect.any(Number))
    expect(ctx.fillText).toHaveBeenCalledWith('Oktober', expect.any(Number), expect.any(Number))
    expect(clicked[0].download).toBe('statistik_einnahmen_oktober.png')
    expect(chart.options.devicePixelRatio).toBe(1)
    expect(chart.update).toHaveBeenCalledTimes(2)
  })

  it('draws nothing without a 2d context', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null)
    vi.mocked(Chart.getChart).mockReturnValue(undefined)

    exportChartPng(document.createElement('canvas'), 'Einnahmen', 'Oktober')

    expect(clicked).toHaveLength(0)
  })
})

describe('qrCode', () => {
  it('points the code at the vendor and uses the configured style', () => {
    const style = { dotsOptions: { color: '#f00', type: 'square' } }
    vendorQrCode(f.vendor(), settings({ QRCodeSettings: JSON.stringify(style) }))

    expect(vi.mocked(QRCodeStyling).mock.lastCall![0]).toMatchObject({
      data: 'https://example.org/v/AUG-1',
      dotsOptions: style.dotsOptions
    })
  })

  it('falls back to the default style for broken settings', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vendorQrCode(f.vendor(), settings({ QRCodeSettings: '{kaputt' }))

    expect(vi.mocked(QRCodeStyling).mock.lastCall![0]).toMatchObject({
      dotsOptions: { color: '#000', type: 'dots' }
    })
  })

  it('has no logo unless one is enabled and configured', async () => {
    expect(await qrLogo(settings({ QRCodeEnableLogo: false }))).toBeUndefined()
    expect(await qrLogo(settings({ QRCodeEnableLogo: true, QRCodeLogoImgUrl: '' }))).toBeUndefined()
  })

  it('downloads a zip with one png per vendor with a license id', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:zip')
    URL.revokeObjectURL = vi.fn()
    const progress = vi.fn()

    await downloadAllQrCodes(
      [f.vendor(), f.vendor({ LicenseID: '' }), f.vendor({ LicenseID: 'AUG-2' })],
      settings(),
      progress
    )

    expect(progress.mock.calls.map((c) => c[0])).toEqual([1, 3])
    expect(clicked[0].download).toMatch(/^qr-codes_\d{4}-\d{2}-\d{2}\.zip$/)
  })
})

/* eslint-disable no-console -- initSentry replaces console.error, which the test has to restore */
describe('initSentry', () => {
  it('starts sentry with urls stripped of tokens and forwards console errors', async () => {
    vi.resetModules()

    const sentry = {
      init: vi.fn(),
      setTag: vi.fn(),
      captureException: vi.fn(),
      browserTracingIntegration: vi.fn(),
      replayIntegration: vi.fn()
    }

    vi.doMock('@sentry/vue', () => sentry)

    vi.doMock('@/utils/sentry', () => ({
      sentryConfigured: () => true,
      sentryDsn: 'https://key@sentry.example.org/1',
      registerSentry: vi.fn()
    }))

    const originalError = console.error
    console.error = vi.fn()
    const { initSentry } = await import('@/utils/sentryInit')
    initSentry({} as never, {} as never)

    const options = sentry.init.mock.calls[0][0]

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [{ path: '/', component: {} }]
    })

    router.beforeEach(() => false)
    const navigationFailure = await router.push('/')
    expect(navigationFailure).toBeInstanceOf(Error)
    const url = 'https://shop.example.org/v/1?code=secret#access_token=x'

    expect(options.beforeSend({ request: { url } }).request.url).toBe(
      'https://shop.example.org/v/1'
    )

    expect(options.beforeSendTransaction({ request: { url: 'kaputt' } }).request.url).toBe('kaputt')
    expect(options.beforeSend({})).toEqual({})
    expect(options.beforeSend({}, { originalException: navigationFailure })).toBeNull()
    expect(options.beforeSendTransaction({})).toEqual({})

    expect(options.beforeBreadcrumb({ data: { url, to: url, from: url } }).data).toEqual({
      url: 'https://shop.example.org/v/1',
      to: 'https://shop.example.org/v/1',
      from: 'https://shop.example.org/v/1'
    })

    expect(sentry.setTag).toHaveBeenCalledWith('tenant', window.location.hostname)

    const error = new Error('kaputt')
    console.error('Fehler:', error)
    console.error('nur', 'text')
    expect(sentry.captureException).toHaveBeenNthCalledWith(1, error)
    expect(sentry.captureException.mock.calls[1][0].message).toBe('nur text')

    console.error(navigationFailure)
    expect(sentry.captureException).toHaveBeenCalledTimes(2)

    console.error = originalError
    vi.doUnmock('@sentry/vue')
    vi.doUnmock('@/utils/sentry')
  })
})
/* eslint-enable no-console */
