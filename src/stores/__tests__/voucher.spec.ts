import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import agent from '@/api/agent'
import { usePaymentStore } from '@/stores/payment'
import { vouchersEnabled } from '@/stores/settings'

vi.mock('@/api/agent', () => ({
  default: { VivaWallet: { postOrder: vi.fn(), verifyPayment: vi.fn() } }
}))

vi.mock('@/router', () => ({ default: { push: vi.fn() } }))

describe('vouchersEnabled', () => {
  it('needs both the abonement and the voucher module', () => {
    expect(vouchersEnabled({ AbonementEnabled: true, VoucherEnabled: true })).toBe(true)
    expect(vouchersEnabled({ AbonementEnabled: false, VoucherEnabled: true })).toBe(false)
    expect(vouchersEnabled({ AbonementEnabled: true, VoucherEnabled: false })).toBe(false)
    // Older backends don't send the setting
    expect(vouchersEnabled({ AbonementEnabled: true })).toBe(false)
  })
})

describe('usePaymentStore.postOrder', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('sends the voucher recipient name and message with the order', async () => {
    vi.mocked(agent.VivaWallet.postOrder).mockResolvedValue({
      SmartCheckoutURL: 'about:blank'
    } as never)

    const store = usePaymentStore()

    store.giftRecipientName = 'Grete'
    store.giftMessage = 'Alles Gute!'
    store.newsletter = true

    await store.postOrder([{ item: 7, quantity: 1 }], 1, 'vendor-1', 'buyer@example.com')

    expect(agent.VivaWallet.postOrder).toHaveBeenCalledWith(
      [{ item: 7, quantity: 1 }],
      'vendor-1',
      'buyer@example.com',
      true,
      'Grete',
      'Alles Gute!'
    )
  })
})
