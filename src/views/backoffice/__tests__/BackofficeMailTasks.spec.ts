import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { createI18n } from 'vue-i18n'
import { createMemoryHistory, createRouter } from 'vue-router'
import { defineComponent, h } from 'vue'
import BackofficeMailTasks from '@/views/backoffice/BackofficeMailTasks.vue'
import { useKeycloakStore } from '@/stores/keycloak'
import { fetchMailTasks, retryFailedMailTasks, retryMailTask } from '@/api/api'

vi.mock('@/api/api', () => ({
  fetchMailTasks: vi.fn(),
  fetchMailTask: vi.fn(),
  retryMailTask: vi.fn(),
  retryFailedMailTasks: vi.fn()
}))

const task = (ID: number, Status: string, extra: Record<string, unknown> = {}) => ({
  ID,
  Kind: 'online_issue',
  Recipients: [`reader${ID}@example.com`],
  Subject: 'Neue Online-Ausgabe',
  HasAttachments: false,
  Status,
  Attempts: Status === 'failed' ? 6 : 1,
  LastError: Status === 'failed' ? '550 mailbox unavailable' : '',
  NextAttemptAt: '2026-11-20T10:00:00Z',
  CreatedAt: '2026-11-20T09:00:00Z',
  UpdatedAt: '2026-11-20T09:00:00Z',
  SentAt: Status === 'sent' ? '2026-11-20T09:00:05Z' : null,
  OrderID: null,
  ItemID: 5,
  ...extra
})

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
      { path: '/backoffice/mails', component: BackofficeMailTasks, meta: { layout: Layout } }
    ]
  })

  await router.push(path)

  const wrapper = mount(BackofficeMailTasks, {
    global: {
      plugins: [pinia, router, createI18n({ legacy: false, locale: 'de', missingWarn: false })],
      stubs: { FontAwesomeIcon: true, Modal: true }
    }
  })

  await flushPromises()
  return { wrapper, router }
}

describe('BackofficeMailTasks', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(fetchMailTasks).mockResolvedValue({
      data: {
        Tasks: [task(1, 'sent'), task(2, 'failed')],
        Total: 2,
        Counts: { pending: 0, sending: 0, sent: 1, failed: 1 }
      }
    } as never)

    vi.mocked(retryMailTask).mockResolvedValue({ data: { ID: 2 } } as never)
    vi.mocked(retryFailedMailTasks).mockResolvedValue({ data: { Queued: 1 } } as never)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
  })

  it('loads the mails with the filter from the URL', async () => {
    const { wrapper } = await mountPage('/backoffice/mails?item_id=5&kind=online_issue')

    expect(fetchMailTasks).toHaveBeenCalledWith(
      expect.objectContaining({ item_id: 5, kind: 'online_issue', offset: 0 })
    )

    expect(wrapper.findAll('[data-test="mail-task-row"]')).toHaveLength(2)
    expect(wrapper.text()).toContain('550 mailbox unavailable')
  })

  it('filters by status through the URL', async () => {
    const { wrapper, router } = await mountPage('/backoffice/mails')

    await wrapper.get('[data-test="status-failed"]').trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.query.status).toBe('failed')
    expect(fetchMailTasks).toHaveBeenLastCalledWith(expect.objectContaining({ status: 'failed' }))
  })

  it('sends a failed mail again', async () => {
    const { wrapper } = await mountPage('/backoffice/mails')

    await wrapper.get('[data-test="retry-2"]').trigger('click')
    await flushPromises()

    expect(retryMailTask).toHaveBeenCalledWith(2)
    expect(window.confirm).not.toHaveBeenCalled()
  })

  it('asks before sending a delivered mail again', async () => {
    vi.mocked(window.confirm).mockReturnValue(false)
    const { wrapper } = await mountPage('/backoffice/mails')

    await wrapper.get('[data-test="retry-1"]').trigger('click')
    await flushPromises()

    expect(window.confirm).toHaveBeenCalled()
    expect(retryMailTask).not.toHaveBeenCalled()
  })

  it('sends all failed mails of the filter again', async () => {
    const { wrapper } = await mountPage('/backoffice/mails?item_id=5&status=failed')

    await wrapper.get('[data-test="retry-all-failed"]').trigger('click')
    await flushPromises()

    expect(retryFailedMailTasks).toHaveBeenCalledWith(
      expect.not.objectContaining({ status: expect.anything() })
    )

    expect(vi.mocked(retryFailedMailTasks).mock.calls[0][0]).toMatchObject({ item_id: 5 })
  })

  it('marks Keycloak mails and names them by their action', async () => {
    vi.mocked(fetchMailTasks).mockResolvedValue({
      data: {
        Tasks: [
          task(3, 'sent', { Kind: 'keycloak_update_password', Subject: 'UPDATE_PASSWORD' }),
          task(1, 'sent')
        ],
        Total: 2,
        Counts: { pending: 0, sending: 0, sent: 2, failed: 0 }
      }
    } as never)

    const { wrapper } = await mountPage('/backoffice/mails')
    const rows = wrapper.findAll('[data-test="mail-task-row"]')

    expect(rows[0].find('[data-test="keycloak-badge"]').exists()).toBe(true)
    expect(rows[0].text()).toContain('keycloak_update_password')
    expect(rows[0].text()).not.toContain('UPDATE_PASSWORD')
    expect(rows[1].find('[data-test="keycloak-badge"]').exists()).toBe(false)

    await wrapper.get('[data-test="retry-3"]').trigger('click')
    await flushPromises()

    expect(retryMailTask).toHaveBeenCalledWith(3)
  })
})
