import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import agent from '@/api/agent'
import { useOrdersStore } from '@/stores/orders'

vi.mock('@/api/agent', () => ({
  default: {
    VivaWallet: {
      resendWebhook: vi.fn()
    }
  }
}))

describe('useOrdersStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('resends the Odoo webhook for a single order', async () => {
    const store = useOrdersStore()

    vi.mocked(agent.VivaWallet.resendWebhook).mockResolvedValue({ sent_at: '2026-01-01T00:00:00Z' })

    await store.resendOdooWebhook(42)

    expect(agent.VivaWallet.resendWebhook).toHaveBeenCalledWith(42)
  })
})
