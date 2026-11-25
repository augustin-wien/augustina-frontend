import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { defineComponent, h } from 'vue'
import BackofficeVouchers from '@/views/backoffice/BackofficeVouchers.vue'
import { useKeycloakStore } from '@/stores/keycloak'
import { fetchVouchers, fetchVoucherPDF, resendVoucher, setVoucherDisabled } from '@/api/api'
import type { AbonementVoucher } from '@/api/api'

vi.mock('@/api/api', () => ({
  fetchVouchers: vi.fn(),
  fetchVoucherPDF: vi.fn(),
  resendVoucher: vi.fn(),
  setVoucherDisabled: vi.fn()
}))

const voucher = (overrides: Partial<AbonementVoucher>): AbonementVoucher => ({
  ID: 1,
  Code: 'ABCD-EFGH-JKMN',
  ItemID: 10,
  ItemName: 'Online-Abo Gutschein',
  OrderID: 5,
  BuyerEmail: 'buyer@example.com',
  RecipientName: 'Grete',
  Message: '',
  DurationMonths: 12,
  Status: 'active',
  CreatedAt: '2026-11-17T08:00:00Z',
  RedeemedAt: null,
  RedeemedEmail: null,
  RedeemedCustomerID: null,
  AbonementID: null,
  ...overrides
})

const Layout = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h('div', [slots.header?.(), slots.main?.()])
})

const mountPage = async () => {
  const pinia = createPinia()
  setActivePinia(pinia)
  useKeycloakStore().authenticated = true

  const wrapper = mount(BackofficeVouchers, {
    global: {
      plugins: [pinia, createI18n({ legacy: false, locale: 'de', missingWarn: false })],
      mocks: { $route: { meta: { layout: Layout } } },
      stubs: {
        Toast: { props: ['toast'], template: '<div class="toast">{{ toast.message }}</div>' }
      }
    }
  })

  await flushPromises()

  return wrapper
}

const rows = (wrapper: Awaited<ReturnType<typeof mountPage>>) => wrapper.findAll('tbody tr')

const buttonByText = (wrapper: Awaited<ReturnType<typeof mountPage>>, text: string) => {
  const button = wrapper.findAll('button').find((b) => b.text() === text)
  if (!button) throw new Error(`button ${text} not found`)

  return button
}

describe('BackofficeVouchers', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(fetchVouchers).mockResolvedValue({
      data: [
        voucher({}),
        voucher({
          ID: 2,
          Code: 'MNPQ-RSTU-VWXY',
          Status: 'redeemed',
          RecipientName: '',
          RedeemedEmail: 'reader@example.com',
          RedeemedAt: '2026-11-20T08:00:00Z'
        }),
        voucher({ ID: 3, Code: 'ZZZZ-YYYY-XXXX', Status: 'disabled' })
      ]
    } as never)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('lists the vouchers and filters them by code, email or name', async () => {
    const wrapper = await mountPage()

    expect(rows(wrapper)).toHaveLength(3)
    expect(rows(wrapper)[1]!.text()).toContain('MNPQ-RSTU-VWXY')
    // Emails are masked in the list
    expect(wrapper.text()).not.toContain('buyer@example.com')

    await wrapper.get('input[type="text"]').setValue('mnpq')
    expect(rows(wrapper)).toHaveLength(1)

    await wrapper.get('input[type="text"]').setValue('grete')
    expect(rows(wrapper)).toHaveLength(2)

    await wrapper.get('input[type="text"]').setValue('nothing matches')
    expect(rows(wrapper)).toHaveLength(1)
    expect(rows(wrapper)[0]!.text()).toContain('noVouchers')
  })

  it('offers no block button for redeemed vouchers', async () => {
    const wrapper = await mountPage()

    expect(rows(wrapper)[0]!.text()).toContain('voucherDisable')
    expect(rows(wrapper)[1]!.text()).not.toContain('voucherDisable')
    expect(rows(wrapper)[1]!.text()).not.toContain('voucherEnable')
    expect(rows(wrapper)[2]!.text()).toContain('voucherEnable')
  })

  it('blocks a voucher only after confirmation', async () => {
    const confirm = vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValueOnce(true)

    vi.mocked(setVoucherDisabled).mockResolvedValue({
      data: voucher({ Status: 'disabled' })
    } as never)

    const wrapper = await mountPage()

    await buttonByText(wrapper, 'voucherDisable').trigger('click')
    expect(setVoucherDisabled).not.toHaveBeenCalled()

    await buttonByText(wrapper, 'voucherDisable').trigger('click')
    await flushPromises()
    expect(confirm).toHaveBeenCalledTimes(2)
    expect(setVoucherDisabled).toHaveBeenCalledWith(1, true)
    expect(rows(wrapper)[0]!.text()).toContain('voucherStatus_disabled')
  })

  it('unblocks a disabled voucher without asking', async () => {
    const confirm = vi.spyOn(window, 'confirm')

    vi.mocked(setVoucherDisabled).mockResolvedValue({
      data: voucher({ ID: 3, Code: 'ZZZZ-YYYY-XXXX', Status: 'active' })
    } as never)

    const wrapper = await mountPage()

    await buttonByText(wrapper, 'voucherEnable').trigger('click')
    await flushPromises()
    expect(confirm).not.toHaveBeenCalled()
    expect(setVoucherDisabled).toHaveBeenCalledWith(3, false)
  })

  it('resends to the buyer or to another address', async () => {
    const prompt = vi
      .spyOn(window, 'prompt')
      .mockReturnValueOnce('buyer@example.com')
      .mockReturnValueOnce(' gift@example.com ')
      .mockReturnValueOnce(null)

    vi.mocked(resendVoucher).mockResolvedValue({} as never)

    const wrapper = await mountPage()
    const resend = () => wrapper.findAll('button').filter((b) => b.text() === 'voucherResend')[0]!

    await resend().trigger('click')
    await flushPromises()
    expect(resendVoucher).toHaveBeenLastCalledWith(1, '')
    expect(wrapper.find('.toast').text()).toBe('voucherResent')

    await resend().trigger('click')
    await flushPromises()
    expect(resendVoucher).toHaveBeenLastCalledWith(1, 'gift@example.com')

    // Cancelled prompt sends nothing
    await resend().trigger('click')
    await flushPromises()
    expect(prompt).toHaveBeenCalledTimes(3)
    expect(resendVoucher).toHaveBeenCalledTimes(2)
  })

  it('opens the PDF in a new tab', async () => {
    const open = vi.spyOn(window, 'open').mockReturnValue(null)

    URL.createObjectURL = vi.fn(() => 'blob:voucher')
    URL.revokeObjectURL = vi.fn()
    vi.mocked(fetchVoucherPDF).mockResolvedValue({ data: new Blob(['%PDF']) } as never)

    const wrapper = await mountPage()

    await buttonByText(wrapper, 'PDF').trigger('click')
    await flushPromises()

    expect(fetchVoucherPDF).toHaveBeenCalledWith(1)
    expect(open).toHaveBeenCalledWith('blob:voucher', '_blank')
  })

  it('shows an error when the vouchers can not be loaded', async () => {
    vi.mocked(fetchVouchers).mockRejectedValue(new Error('offline'))

    const wrapper = await mountPage()

    expect(wrapper.find('.toast').text()).toBe('voucherLoadFailed')
  })
})
