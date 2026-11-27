import { afterEach, describe, expect, it, vi } from 'vitest'
import QRCodeStyling from 'qr-code-styling'
import BackendUnavailable from '@/components/BackendUnavailable.vue'
import QrCodeGenerator from '@/components/QrCodeGenerator.vue'
import WaitingCountdown from '@/views/WaitingCountdown.vue'
import router from '@/router'
import { fail, on, requested } from '@/__tests__/support/backend'
import * as f from '@/__tests__/support/fixtures'
import { mountComponent, settle } from '@/__tests__/support/mount'
import { usePaymentStore } from '@/stores/payment'

const reload = vi.fn()

const stubLocation = (href: string) => {
  vi.stubGlobal('location', {
    ...window.location,
    href,
    reload,
    origin: 'http://localhost',
    pathname: '/',
    search: ''
  })
}

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
  reload.mockClear()
})

describe('BackendUnavailable', () => {
  it('counts down, retries and reloads once the backend answers', async () => {
    stubLocation('http://localhost/')
    fail('get', /api\/settings\/$/, 502)
    vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] })
    const { wrapper } = await mountComponent(BackendUnavailable)

    await vi.advanceTimersByTimeAsync(3000)
    await settle()
    expect(requested('get', /api\/settings\/$/)).toHaveLength(1)
    expect(reload).not.toHaveBeenCalled()

    on('get', /api\/settings\/$/, f.settingsResponse())
    await wrapper.findAll('button').slice(-1)[0]?.trigger('click')
    await settle()
    expect(reload).toHaveBeenCalled()
  })

  it('retries when the browser goes back online', async () => {
    stubLocation('http://localhost/')
    await mountComponent(BackendUnavailable)

    window.dispatchEvent(new Event('online'))
    await settle()

    expect(reload).toHaveBeenCalled()
  })
})

describe('QrCodeGenerator', () => {
  it('draws the vendor code and downloads it as png', async () => {
    const { wrapper } = await mountComponent(QrCodeGenerator, { props: { vendor: f.vendor() } })
    const qr = vi.mocked(QRCodeStyling).mock.results.slice(-1)[0]!.value

    await wrapper.findAll('button').slice(-1)[0]!.trigger('click')
    expect(qr.download).toHaveBeenCalledWith({ name: 'AUG-1', extension: 'png' })

    await wrapper.setProps({ vendor: f.vendor({ LicenseID: 'AUG-2' }) })
    await settle()

    expect(vi.mocked(QRCodeStyling).mock.lastCall![0]).toMatchObject({
      data: expect.stringMatching(/AUG-2$/)
    })

    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })
})

describe('WaitingCountdown', () => {
  it('sends a callback without parameters to the failure page', async () => {
    stubLocation('http://localhost/success')
    await mountComponent(WaitingCountdown)
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/failure'))
  })

  it('verifies the payment of the transaction in the callback', async () => {
    stubLocation('http://localhost/success?s=123&t=abc')
    on('get', /api\/orders\/verify\//, { TimeStamp: '2026-10-01T10:00:00Z', FirstName: 'Anna' })

    await mountComponent(WaitingCountdown)
    await vi.waitFor(() => expect(usePaymentStore().firstName).toBe('Anna'))

    expect(usePaymentStore().transactionID).toBe('t=abc&s=123')
    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/paymentconfirmation'))
  })
})
