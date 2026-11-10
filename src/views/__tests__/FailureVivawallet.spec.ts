import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import FailureVivawallet from '@/views/FailureVivawallet.vue'
import { usePaymentStore } from '@/stores/payment'

const { query, reportVivaFailure, reportFailure } = vi.hoisted(() => ({
  query: { value: {} as Record<string, string> },
  reportVivaFailure: vi.fn(),
  reportFailure: vi.fn(() => Promise.resolve())
}))

vi.mock('vue-router', () => ({ useRoute: () => ({ query: query.value }) }))

vi.mock('vue-i18n', async (importOriginal) => ({
  ...(await importOriginal<typeof import('vue-i18n')>()),
  useI18n: () => ({ t: (key: string) => key })
}))

vi.mock('@/router', () => ({ default: { push: vi.fn() } }))

vi.mock('@/api/agent', () => ({
  default: { VivaWallet: { verifyPayment: vi.fn(), reportFailure } }
}))

vi.mock('@/utils/vivaFailure', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/utils/vivaFailure')>()),
  reportVivaFailure
}))

const Layout = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h('div', slots.main?.())
})

const mountPage = () =>
  mount(FailureVivawallet, {
    global: {
      mocks: { $t: (key: string) => key, $route: { meta: { layout: Layout } } },
      stubs: { Toast: true, FeedbackForm: true }
    }
  })

describe('FailureVivawallet', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('shows the order code and reason from the VivaWallet redirect', () => {
    query.value = { s: '1234567890123456', lang: 'en-GB', eventId: '12005' }

    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Order Code: 1234567890123456')
    expect(wrapper.get('#failure-reason').text()).toBe('paymentFailure_unknown')
    expect(wrapper.text()).toContain('paymentFailure_code 12005')
    expect(wrapper.find('#retry-button').exists()).toBe(false)

    expect(reportVivaFailure).toHaveBeenCalledWith({
      orderCode: '1234567890123456',
      eventId: '12005',
      eci: ''
    })

    expect(reportFailure).toHaveBeenCalledWith('1234567890123456', '12005')
  })

  it('does not store a failure without an EventId', () => {
    query.value = { s: '1234567890123456' }

    mountPage()

    expect(reportFailure).not.toHaveBeenCalled()
  })

  it('shows the order code from the verification query and offers a retry', () => {
    query.value = {}
    usePaymentStore().transactionID = 's=1234567890123456&t=882d641c-01cc-442f-b894-2b51250340b5'

    const wrapper = mountPage()

    expect(wrapper.text()).toContain('Order Code: 1234567890123456')
    expect(wrapper.find('#failure-reason').exists()).toBe(false)
    expect(wrapper.find('#retry-button').exists()).toBe(true)
    expect(reportVivaFailure).not.toHaveBeenCalled()
    expect(reportFailure).not.toHaveBeenCalled()
  })
})
