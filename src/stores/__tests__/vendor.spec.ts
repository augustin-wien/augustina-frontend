import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'
import agent from '@/api/agent'
import router from '@/router'
import { useVendorStore } from '../vendor'

vi.mock('@/api/agent', () => ({
  default: { Vendor: { checkID: vi.fn() } }
}))

vi.mock('vue-router', () => ({ useRoute: () => ({ name: 'Vendor' }) }))

const { currentRoute } = vi.hoisted(() => ({
  currentRoute: { value: { name: '' as string, matched: [] as { name: string }[] } }
}))

vi.mock('@/router', () => ({ default: { push: vi.fn(), currentRoute } }))

const flush = () => new Promise((resolve) => setTimeout(resolve))

describe('checkID', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.mocked(router.push).mockClear()
    vi.mocked(agent.Vendor.checkID).mockResolvedValue({ FirstName: 'Grete' } as never)
  })

  it('sends a vendor page other than shop and landing page to the landing page', async () => {
    currentRoute.value = { name: 'Check ID', matched: [{ name: 'Parent' }, { name: 'Check ID' }] }

    await useVendorStore().checkID('AUG-1')
    await flush()

    expect(router.push).toHaveBeenCalledWith('/v/AUG-1/landing-page')
  })

  it('leaves the error page alone when the check finishes there', async () => {
    let answer = (_: unknown) => {}

    vi.mocked(agent.Vendor.checkID).mockReturnValue(
      new Promise((resolve) => (answer = resolve)) as never
    )

    currentRoute.value = { name: 'Check ID', matched: [{ name: 'Parent' }, { name: 'Check ID' }] }

    await useVendorStore().checkID('AUG-1')
    currentRoute.value = { name: 'Error', matched: [{ name: 'Error' }] }
    answer({ FirstName: 'Grete' })
    await flush()

    expect(router.push).not.toHaveBeenCalled()
    expect(useVendorStore().vendorName).toBe('Grete')
  })
})
