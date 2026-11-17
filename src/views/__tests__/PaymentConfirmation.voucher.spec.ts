import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { defineComponent, h } from 'vue'
import PaymentConfirmation from '@/views/PaymentConfirmation.vue'
import { useItemsStore } from '@/stores/items'
import { usePaymentStore } from '@/stores/payment'
import type { Item } from '@/stores/items'

vi.mock('@/api/api', () => ({ fetchItems: vi.fn(() => new Promise(() => {})) }))

vi.mock('@/router', () => ({ default: { push: vi.fn() } }))

const item = (ID: number, Type: string, LicenseItem: number | null) =>
  ({ ID, Name: `Item ${ID}`, Type, LicenseItem, Price: 3000 }) as unknown as Item

const Layout = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h('div', slots.main?.())
})

const mountPage = (purchased: number[]) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  useItemsStore().items = [item(5, 'online_issue', 6), item(7, 'abonement_voucher', 8)]
  const payment = usePaymentStore()
  payment.timeStamp = '2026-11-17T08:00:00Z'

  payment.verification = {
    FirstName: 'Vendor',
    TimeStamp: '2026-11-17T08:00:00Z',
    TotalSum: 3000,
    PurchasedItems: purchased.map((id) => ({ Item: id, Quantity: 1 })),
    PDFDownloadLinks: [],
    InviteURL: ''
  } as never

  return mount(PaymentConfirmation, {
    global: {
      plugins: [pinia, createI18n({ legacy: false, locale: 'de', missingWarn: false })],
      mocks: { $route: { meta: { layout: Layout } } },
      stubs: { FeedbackForm: true }
    }
  })
}

describe('PaymentConfirmation with a voucher', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('says the voucher was mailed and offers no online reading link for it', () => {
    const wrapper = mountPage([7])

    expect(wrapper.find('.voucher-sent-hint').exists()).toBe(true)
    expect(wrapper.find('.digitial-item-link').exists()).toBe(false)
  })

  it('still links an online issue bought together with a voucher', () => {
    const wrapper = mountPage([5, 7])

    expect(wrapper.find('.voucher-sent-hint').exists()).toBe(true)
    expect(wrapper.find('.digitial-item-link').exists()).toBe(true)
  })

  it('shows no voucher hint without a voucher', () => {
    const wrapper = mountPage([5])

    expect(wrapper.find('.voucher-sent-hint').exists()).toBe(false)
  })
})
