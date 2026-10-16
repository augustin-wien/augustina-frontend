import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { defineComponent, h } from 'vue'
import BackofficeDonations from '@/views/backoffice/BackofficeDonations.vue'
import { useKeycloakStore } from '@/stores/keycloak'
import { useSettingsStore } from '@/stores/settings'
import { fetchExternalPayments } from '@/api/api'

vi.mock('@/api/api', () => ({ fetchExternalPayments: vi.fn() }))

const payment = (id: number, amount: number, fee: number, source_name: string) => ({
  id,
  transaction_id: `txn-${id}`,
  order_code: '',
  amount,
  fee,
  status_id: 'F',
  source_code: '',
  source_name,
  terminal_id: source_name === 'Spendenterminal' ? 16000001 : 0,
  merchant_trns: '',
  paid_at: '2026-10-15T17:42:41Z'
})

const Layout = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h('div', [slots.header?.(), slots.main?.()])
})

const mountPage = async (trackingEnabled: boolean) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  useKeycloakStore().authenticated = true
  const settingsStore = useSettingsStore()
  settingsStore.settings.DonationTrackingEnabled = trackingEnabled
  settingsStore.settingsLoaded = true

  const wrapper = mount(BackofficeDonations, {
    global: {
      plugins: [pinia, createI18n({ legacy: false, locale: 'de', missingWarn: false })],
      mocks: { $route: { meta: { layout: Layout } } },
      stubs: { VueDatePicker: true, FontAwesomeIcon: true }
    }
  })

  await flushPromises()
  return wrapper
}

const statValues = (wrapper: Awaited<ReturnType<typeof mountPage>>) =>
  wrapper.findAll('.stat-value').map((s) => s.text())

describe('BackofficeDonations', () => {
  beforeEach(() => {
    vi.mocked(fetchExternalPayments).mockResolvedValue({
      data: [
        payment(1, 1000, 29, 'Spendenterminal'),
        payment(2, 500, 15, 'Spendenterminal'),
        payment(3, 2000, 0, 'Event')
      ]
    } as never)
  })

  it('sums amount, fees and net of all payments', async () => {
    const wrapper = await mountPage(true)

    expect(statValues(wrapper)).toEqual(['3', '35,00 €', '0,44 €', '34,56 €'])
    expect(wrapper.findAll('tbody tr')).toHaveLength(4)
    expect(wrapper.find('.notice').exists()).toBe(false)
  })

  it('filters by source', async () => {
    const wrapper = await mountPage(true)

    await wrapper.get('select').setValue('Spendenterminal')

    expect(statValues(wrapper)).toEqual(['2', '15,00 €', '0,44 €', '14,56 €'])
    expect(wrapper.text()).toContain('16000001')
  })

  it('says that tracking is off', async () => {
    const wrapper = await mountPage(false)

    expect(wrapper.find('.notice').exists()).toBe(true)
  })
})
