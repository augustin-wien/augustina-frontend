import { AxiosError, type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import RedeemVoucher from '@/views/RedeemVoucher.vue'

const { query, checkVoucher, redeemVoucher } = vi.hoisted(() => ({
  query: { value: {} as Record<string, string> },
  checkVoucher: vi.fn(),
  redeemVoucher: vi.fn()
}))

vi.mock('vue-router', () => ({ useRoute: () => ({ query: query.value }) }))

vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-i18n')>()),
  useI18n: () => ({ t: (key: string) => key })
}))

vi.mock('@/api/api', () => ({ checkVoucher, redeemVoucher }))

vi.mock('@/stores/settings', () => ({
  useSettingsStore: () => ({
    settings: { Color: '#000', FontColor: '#fff', OnlinePaperUrl: 'https://read.example.com' }
  })
}))

const Layout = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h('div', slots.main?.())
})

const mountPage = () =>
  mount(RedeemVoucher, {
    global: {
      mocks: { $t: (key: string) => key, $route: { meta: { layout: Layout } } }
    }
  })

const activeVoucher = {
  Code: 'ABCD-EFGH-JKMN',
  Status: 'active',
  ItemName: 'Online-Abo',
  DurationMonths: 12,
  RecipientName: 'Grete',
  Message: 'Alles Gute!'
}

describe('RedeemVoucher', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
    query.value = {}
  })

  it('checks the code from the QR code link and redeems it', async () => {
    query.value = { code: 'abcd efgh jkmn' }
    checkVoucher.mockResolvedValue({ data: activeVoucher })

    redeemVoucher.mockResolvedValue({
      data: {
        ItemName: 'Online-Abo',
        DurationMonths: 12,
        FromDate: '2026-11-17T00:00:00Z',
        ToDate: '2027-11-17T00:00:00Z',
        Email: 'grete@example.com'
      }
    })

    const wrapper = mountPage()
    await flushPromises()

    expect(checkVoucher).toHaveBeenCalledWith('abcd efgh jkmn')
    expect(wrapper.get('#voucher-details').text()).toContain('Grete')
    expect(wrapper.get('#voucher-details').text()).toContain('Alles Gute!')

    await wrapper.get('#redeem-email').setValue('grete@example.com')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(redeemVoucher).toHaveBeenCalledWith({
      Code: 'ABCD-EFGH-JKMN',
      Email: 'grete@example.com',
      FirstName: '',
      LastName: ''
    })

    expect(wrapper.find('#redeem-success').exists()).toBe(true)
  })

  it('tells the user when a voucher was already redeemed', async () => {
    query.value = { code: 'ABCD-EFGH-JKMN' }
    checkVoucher.mockResolvedValue({ data: { ...activeVoucher, Status: 'redeemed' } })

    const wrapper = mountPage()
    await flushPromises()

    expect(wrapper.get('#redeem-error').text()).toBe('voucherAlreadyRedeemed')
    expect(wrapper.find('#voucher-details').exists()).toBe(false)
  })

  it('shows an error for an unknown code', async () => {
    checkVoucher.mockRejectedValue(
      new AxiosError('Not Found', undefined, undefined, undefined, {
        status: 404
      } as AxiosResponse)
    )

    const wrapper = mountPage()
    await wrapper.get('#voucher-code').setValue('AAAA-BBBB-CCCC')
    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(wrapper.get('#redeem-error').text()).toBe('voucherNotFound')
  })
})
