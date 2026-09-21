import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import agent from '@/api/agent'
import { usePaymentStore } from '@/stores/payment'
import type { VivaWalletVerification } from '@/models/verificationVivaWallet'

const verification = (overrides: Partial<VivaWalletVerification>): VivaWalletVerification => ({
  FirstName: '',
  TimeStamp: '',
  TotalSum: 0,
  PurchasedItems: [],
  PDFDownloadLinks: [],
  InviteURL: '',
  ...overrides
})

interface MockScope {
  setTag: ReturnType<typeof vi.fn>
  setContext: ReturnType<typeof vi.fn>
}

const { scope, captureException, captureMessage, withScope } = vi.hoisted(() => {
  const scope: MockScope = { setTag: vi.fn(), setContext: vi.fn() }

  return {
    scope,
    captureException: vi.fn(),
    captureMessage: vi.fn(),
    withScope: vi.fn((callback: (scope: MockScope) => void) => callback(scope))
  }
})

vi.mock('@sentry/vue', () => ({ captureException, captureMessage, withScope }))

vi.mock('@/api/agent', () => ({
  default: { VivaWallet: { verifyPayment: vi.fn() } }
}))

vi.mock('@/router', () => ({ default: { push: vi.fn() } }))

describe('usePaymentStore.verifyPayment', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  // The store's initial `verification` is {} rather than null, and a non-null
  // verification short-circuits to "already verified" - resetVerification()
  // (which every real call site calls first, see WaitingCountdown.vue) is what
  // actually allows retries to happen at all.
  it('does not alert while retries remain, after a rejected verification', async () => {
    const store = usePaymentStore()

    store.transactionID = 'order-1'
    store.resetVerification()
    vi.mocked(agent.VivaWallet.verifyPayment).mockRejectedValue(new Error('not yet settled'))

    for (let i = 0; i < 5; i++) {
      await store.verifyPayment()
    }

    expect(store.failedCount).toBe(5)
    expect(captureException).not.toHaveBeenCalled()
  })

  it('reports to Sentry once retries are exhausted after a rejected verification', async () => {
    const store = usePaymentStore()
    const error = new Error('not yet settled')

    store.transactionID = 'order-1'
    store.resetVerification()
    vi.mocked(agent.VivaWallet.verifyPayment).mockRejectedValue(error)

    for (let i = 0; i < 6; i++) {
      await store.verifyPayment()
    }

    expect(store.failedCount).toBe(6)
    expect(scope.setTag).toHaveBeenCalledWith('error_type', 'payment_verification_failed')

    expect(scope.setContext).toHaveBeenCalledWith('payment', {
      transactionID: 'order-1',
      failedCount: 6
    })

    expect(captureException).toHaveBeenCalledWith(error)
  })

  // A resolved-but-empty-timestamp response makes `verification` non-null, so unlike the
  // rejection case above this can't realistically be looped to failedCount 6 through
  // repeated calls (the 2nd call would already short-circuit as "already verified"). This
  // targets the give-up branch directly instead, as if it were the 6th attempt.
  it('reports to Sentry when the final retry resolves with no timestamp', async () => {
    const store = usePaymentStore()

    store.transactionID = 'order-1'
    store.resetVerification()
    store.failedCount = 5
    vi.mocked(agent.VivaWallet.verifyPayment).mockResolvedValue(verification({}))

    await store.verifyPayment()

    expect(store.failedCount).toBe(6)
    expect(scope.setTag).toHaveBeenCalledWith('error_type', 'payment_verification_failed')

    expect(captureMessage).toHaveBeenCalledWith(
      'Payment verification exhausted retries with no timestamp',
      'error'
    )
  })

  it('does not alert once verification succeeds', async () => {
    const store = usePaymentStore()

    store.transactionID = 'order-1'
    store.resetVerification()

    vi.mocked(agent.VivaWallet.verifyPayment).mockResolvedValue(
      verification({ TimeStamp: '2024-01-01T00:00:00Z', FirstName: 'Jane' })
    )

    await store.verifyPayment()

    expect(captureException).not.toHaveBeenCalled()
    expect(captureMessage).not.toHaveBeenCalled()
  })
})
