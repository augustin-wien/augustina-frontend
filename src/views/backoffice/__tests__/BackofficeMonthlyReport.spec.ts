import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import BackofficeMonthlyReport from '@/views/backoffice/BackofficeMonthlyReport.vue'
import { useKeycloakStore } from '@/stores/keycloak'
import { downloadReport, fetchLastReport, fetchReport, sendReport } from '@/api/api'

vi.mock('@/api/api', () => ({
  fetchReport: vi.fn(),
  fetchLastReport: vi.fn(),
  downloadReport: vi.fn(),
  sendReport: vi.fn()
}))

const report = {
  Month: '',
  Income: 2350,
  OnlineSales: 1150,
  OnlineOrders: 2,
  POSCash: 200,
  POSCredit: 100,
  ExternalPayments: 1000,
  LicenseIncome: 50,
  LicenseQuantity: 1,
  TransactionCosts: 42,
  TransactionCostsCoveredByOrga: 27,
  Payouts: 1500,
  PayoutCount: 2,
  Items: []
}

const Layout = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h('div', [slots.header?.(), slots.main?.()])
})

const mountPage = async (path: string) => {
  const pinia = createPinia()
  setActivePinia(pinia)
  useKeycloakStore().authenticated = true

  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: '/backoffice/monthly-report',
        component: BackofficeMonthlyReport,
        meta: { layout: Layout }
      }
    ]
  })

  await router.push(path)

  const wrapper = mount(BackofficeMonthlyReport, {
    global: {
      plugins: [pinia, router, createI18n({ legacy: false, locale: 'de', missingWarn: false })],
      stubs: { FontAwesomeIcon: true }
    }
  })

  await flushPromises()
  return { wrapper, router }
}

describe('BackofficeMonthlyReport', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.useFakeTimers({ toFake: ['Date'] })
    vi.setSystemTime(new Date(2026, 10, 26, 12, 0))
    vi.mocked(fetchReport).mockResolvedValue({ data: report } as never)
    vi.mocked(fetchLastReport).mockResolvedValue({ data: { To: '' } } as never)
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('preselects the day after the last report up to yesterday', async () => {
    vi.mocked(fetchLastReport).mockResolvedValue({ data: { To: '2026-11-10' } } as never)
    const { wrapper, router } = await mountPage('/backoffice/monthly-report')

    expect(router.currentRoute.value.query).toEqual({ from: '2026-11-11', to: '2026-11-25' })
    expect(fetchReport).toHaveBeenLastCalledWith({ from: '2026-11-11', to: '2026-11-25' })

    expect(wrapper.find<HTMLInputElement>('[data-test="period-from"]').element.value).toBe(
      '2026-11-11'
    )

    expect(wrapper.find<HTMLInputElement>('[data-test="period-to"]').element.value).toBe(
      '2026-11-25'
    )

    expect(wrapper.find('[data-test="last-report"]').exists()).toBe(true)
  })

  it('starts on the first of the month without a previous report', async () => {
    const { router } = await mountPage('/backoffice/monthly-report')
    expect(router.currentRoute.value.query).toEqual({ from: '2026-11-01', to: '2026-11-25' })
  })

  it('starts today when the last report already ended yesterday', async () => {
    vi.mocked(fetchLastReport).mockResolvedValue({ data: { To: '2026-11-25' } } as never)
    const { router } = await mountPage('/backoffice/monthly-report')
    expect(router.currentRoute.value.query).toEqual({ from: '2026-11-26', to: '2026-11-26' })
  })

  it('replaces the period from the URL with the day after the last report on reload', async () => {
    vi.mocked(fetchLastReport).mockResolvedValue({ data: { To: '2026-11-10' } } as never)
    const { router } = await mountPage('/backoffice/monthly-report?from=2026-10-01&to=2026-10-15')

    expect(router.currentRoute.value.query).toEqual({ from: '2026-11-11', to: '2026-11-25' })
    expect(fetchReport).toHaveBeenCalledTimes(1)
    expect(fetchReport).toHaveBeenLastCalledWith({ from: '2026-11-11', to: '2026-11-25' })
  })

  it('loads once when the URL already holds the preselected period', async () => {
    await mountPage('/backoffice/monthly-report?from=2026-11-01&to=2026-11-25')
    expect(fetchReport).toHaveBeenCalledTimes(1)
    expect(fetchReport).toHaveBeenLastCalledWith({ from: '2026-11-01', to: '2026-11-25' })
  })

  it('changes the period with the date inputs', async () => {
    const { wrapper, router } = await mountPage('/backoffice/monthly-report')

    const from = wrapper.find<HTMLInputElement>('[data-test="period-from"]')
    from.element.value = '2026-10-01'
    await from.trigger('change')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ from: '2026-10-01', to: '2026-11-25' })
    expect(fetchReport).toHaveBeenLastCalledWith({ from: '2026-10-01', to: '2026-11-25' })
  })

  it('does not load a period that ends before it starts', async () => {
    const { wrapper } = await mountPage('/backoffice/monthly-report')
    vi.mocked(fetchReport).mockClear()

    const to = wrapper.find<HTMLInputElement>('[data-test="period-to"]')
    to.element.value = '2026-10-15'
    await to.trigger('change')
    await flushPromises()

    expect(fetchReport).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('monthlyReportInvalidPeriod')
  })

  it('switches to the monthly report', async () => {
    const { wrapper, router } = await mountPage('/backoffice/monthly-report')

    await wrapper.find('[data-test="mode-month"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ mode: 'month' })
    expect(fetchReport).toHaveBeenLastCalledWith({ month: '2026-11' })
    expect(wrapper.find('[data-test="period-from"]').exists()).toBe(false)

    await wrapper.find('[data-test="mode-period"]').trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.query).toEqual({ from: '2026-11-01', to: '2026-11-25' })
  })

  it('downloads and sends the selected period', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.mocked(sendReport).mockResolvedValue({ data: { success: true } } as never)
    const { wrapper } = await mountPage('/backoffice/monthly-report')

    const buttons = wrapper.findAll('button')
    await buttons.find((b) => b.text().includes('PDF'))!.trigger('click')
    await flushPromises()
    expect(downloadReport).toHaveBeenCalledWith({ from: '2026-11-01', to: '2026-11-25' }, 'pdf')

    await buttons.find((b) => b.text().includes('monthlyReportSend'))!.trigger('click')
    await flushPromises()
    expect(sendReport).toHaveBeenCalledWith({ from: '2026-11-01', to: '2026-11-25' })
  })
})
