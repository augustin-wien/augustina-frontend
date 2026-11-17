import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { defineComponent, h } from 'vue'
import FinalPurchaseConfirmation from '@/views/FinalPurchaseConfirmation.vue'
import { useShopStore } from '@/stores/ShopStore'
import { usePaymentStore } from '@/stores/payment'
import type { Item } from '@/stores/items'

vi.mock('vue-router', () => ({
  useRouter: () => ({ push: vi.fn() }),
  useRoute: () => ({ params: { id: 'vendor-1' } })
}))

vi.mock('@/router', () => ({ default: { push: vi.fn() } }))

const item = (ID: number, Type: string, LicenseItem: number | null = null) =>
  ({
    ID,
    Name: `Item ${ID}`,
    Description: '',
    Price: 3000,
    Type,
    LicenseItem,
    Disabled: false,
    IsLicenseItem: false,
    LicenseGroup: null,
    IsPDFItem: false,
    PDF: null,
    Image: null,
    ItemColor: null,
    ItemOrder: 0,
    ItemTextColor: null
  }) as unknown as Item

const Layout = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h('div', slots.main?.())
})

const mountPage = (cart: { item: number; quantity: number }[]) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  const shop = useShopStore()
  shop.items = [item(1, 'normal_item'), item(7, 'abonement_voucher', 8)]
  shop.amount = cart
  const payment = usePaymentStore()
  payment.setEmail('buyer@example.com')

  const wrapper = mount(FinalPurchaseConfirmation, {
    global: {
      plugins: [pinia, createI18n({ legacy: false, locale: 'de', missingWarn: false })],
      mocks: { $route: { meta: { layout: Layout } } },
      stubs: { EmailModal: true }
    }
  })

  return { wrapper, payment }
}

describe('FinalPurchaseConfirmation voucher fields', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('asks for recipient name and message when a voucher is in the cart', async () => {
    const { wrapper, payment } = mountPage([{ item: 7, quantity: 1 }])

    expect(wrapper.find('#voucher-gift-fields').exists()).toBe(true)

    await wrapper.get('#gift-recipient').setValue('Grete')
    await wrapper.get('#gift-message').setValue('Alles Gute!')

    expect(payment.giftRecipientName).toBe('Grete')
    expect(payment.giftMessage).toBe('Alles Gute!')
    expect(wrapper.get('#gift-recipient').attributes('maxlength')).toBe('80')
    expect(wrapper.get('#gift-message').attributes('maxlength')).toBe('300')
    expect(wrapper.text()).toContain('11/300')
  })

  it('shows no voucher fields without a voucher in the cart', () => {
    const { wrapper } = mountPage([{ item: 1, quantity: 1 }])

    expect(wrapper.find('#voucher-gift-fields').exists()).toBe(false)
  })

  it('shows no voucher fields when the voucher quantity is zero', () => {
    const { wrapper } = mountPage([
      { item: 1, quantity: 1 },
      { item: 7, quantity: 0 }
    ])

    expect(wrapper.find('#voucher-gift-fields').exists()).toBe(false)
  })
})
