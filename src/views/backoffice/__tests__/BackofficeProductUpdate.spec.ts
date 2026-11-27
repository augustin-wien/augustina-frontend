import { describe, expect, it, vi } from 'vitest'
import router from '@/router'
import i18n from '@/locales/i18n'
import { fail, on, requested } from '@/__tests__/support/backend'
import * as f from '@/__tests__/support/fixtures'
import { mountRoute, settle } from '@/__tests__/support/mount'

const open = async (id: number) => {
  const { wrapper } = await mountRoute(`/backoffice/productsettings/update/${id}`)
  return wrapper
}

const saveButton = (wrapper: Awaited<ReturnType<typeof open>>) =>
  wrapper
    .findAll('button')
    .filter((b) => b.text() === 'Save')
    .slice(-1)[0]!

const notifyButton = (wrapper: Awaited<ReturnType<typeof open>>) =>
  wrapper.findAll('button').find((b) => b.text() === i18n.global.t('notifyAbonements'))!

const savedItem = () =>
  requested('put', /api\/items\/\d+\/$/).slice(-1)[0]!.data as Record<string, unknown>

describe('BackofficeProductUpdate', () => {
  it('saves the item and goes back to the product list', async () => {
    const wrapper = await open(1)

    await wrapper.get('#itemName').setValue('Zeitung neu')
    await saveButton(wrapper).trigger('click')
    await settle()

    expect(savedItem().Name).toBe('Zeitung neu')

    await vi.waitFor(
      () => expect(router.currentRoute.value.name).toBe('Backoffice Product Settings'),
      { timeout: 10000 }
    )
  })

  it('shows the backend error when saving fails', async () => {
    const wrapper = await open(1)
    fail('put', /api\/items\/1\/$/, 400, { error: { message: 'Name fehlt' } })

    await saveButton(wrapper).trigger('click')
    await settle()

    expect(wrapper.text()).toContain('Name fehlt')
  })

  it('requires a license group for an online issue', async () => {
    const wrapper = await open(4)

    await wrapper.get('#licenseGroup').setValue('  ')
    await saveButton(wrapper).trigger('click')
    await settle()

    expect(requested('put', /api\/items\//)).toHaveLength(0)
  })

  it('requires a duration between 1 and 120 months for a voucher', async () => {
    on('get', /api\/items\/(backoffice\/)?$/, [
      ...f.items(),
      f.item({
        ID: 8,
        Name: 'Gutschein',
        Type: 'abonement_voucher',
        LicenseGroup: 'digital_edition',
        AboDurationMonths: 0
      })
    ])

    const wrapper = await open(8)

    await saveButton(wrapper).trigger('click')
    await settle()
    expect(requested('put', /api\/items\//)).toHaveLength(0)

    await wrapper.get('#aboDurationMonths').setValue(12)
    await saveButton(wrapper).trigger('click')
    await settle()
    expect(savedItem().AboDurationMonths).toBe(12)
  })

  it('checks the license group in WordPress', async () => {
    const wrapper = await open(4)

    const check = wrapper.findAll('button').find((b) => /WordPress/i.test(b.text()))!
    await check.trigger('click')
    await settle()
    expect(wrapper.text()).toContain('Ausgabe gefunden')

    fail('get', /wordpress-issue/, 500, { error: { message: 'WordPress weg' } })
    await check.trigger('click')
    await settle()
    expect(wrapper.text()).toContain('WordPress weg')

    await wrapper.get('#licenseGroup').setValue('analog_edition')
    expect(wrapper.text()).not.toContain('WordPress weg')
  })

  it('mails the online issue to the abonnents and shows the delivery status', async () => {
    on('post', /notify-abonements/, { recipients: 3, alreadyMailed: 0 })
    const wrapper = await open(4)

    await notifyButton(wrapper).trigger('click')
    await settle()
    const confirm = wrapper.findAll('dialog[open] button').slice(-1)[0]!

    on('get', /notify-abonements/, {
      Counts: { sent: 2, pending: 1, failed: 1 },
      Total: 4,
      FirstQueuedAt: '2026-10-01T10:00:00Z',
      LastSentAt: '2026-10-01T10:05:00Z'
    })

    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
    await confirm.trigger('click')
    await vi.advanceTimersByTimeAsync(1000)
    vi.useRealTimers()
    await settle()

    expect(requested('post', /api\/items\/4\/notify-abonements\/$/)).toHaveLength(1)
    expect(wrapper.find('[data-test="mail-status"]').exists()).toBe(true)
  })

  it('says when every abonnent got the issue already, and when mailing fails', async () => {
    on('post', /notify-abonements/, { recipients: 0, alreadyMailed: 5 })
    const wrapper = await open(4)
    const notify = notifyButton(wrapper)

    await notify.trigger('click')
    await settle()
    await wrapper.findAll('dialog[open] button').slice(-1)[0]!.trigger('click')
    await settle()

    fail('post', /notify-abonements/)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    await notify.trigger('click')
    await settle()
    await wrapper.findAll('dialog[open] button').slice(-1)[0]!.trigger('click')
    await settle()

    expect(requested('post', /notify-abonements/)).toHaveLength(2)
  })

  it('deletes the item together with its license', async () => {
    const wrapper = await open(4)

    await wrapper
      .findAll('button')
      .filter((b) => b.text() === 'Delete')[0]
      .trigger('click')

    await settle()
    await wrapper.get('dialog[open] input[type="checkbox"]').setValue(true)
    await wrapper.findAll('dialog[open] button').slice(-1)[0]!.trigger('click')
    await settle()

    expect(requested('delete', /api\/items\/4\/$/)[0].params).toEqual({ deleteLicense: true })
  })

  it('explains that a license still in use cannot be deleted', async () => {
    const wrapper = await open(5)
    fail('delete', /api\/items\/5\/$/, 409)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await wrapper
      .findAll('button')
      .filter((b) => b.text() === 'Delete')[0]
      .trigger('click')

    await settle()

    expect(wrapper.find('dialog[open] button[disabled]').exists()).toBe(true)
  })

  it('shows an error when deleting fails', async () => {
    const wrapper = await open(1)
    fail('delete', /api\/items\/1\/$/)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await wrapper
      .findAll('button')
      .filter((b) => b.text() === 'Delete')[0]
      .trigger('click')

    await settle()
    await wrapper.findAll('dialog[open] button').slice(-1)[0]!.trigger('click')
    await settle()

    expect(wrapper.text()).toContain('konnte nicht gelöscht werden')
  })

  it('opens the stored pdf in a new tab', async () => {
    on('get', /api\/items\/(backoffice\/)?$/, [
      ...f.items(),
      f.item({ ID: 9, Type: 'online_issue', IsPDFItem: true, PDF: '/pdf/9.pdf', LicenseGroup: '' })
    ])

    on('get', /api\/items\/9\/pdf\/$/, new Blob(['%PDF']))
    URL.createObjectURL = vi.fn(() => 'blob:pdf')
    const tab = { location: { href: '' }, close: vi.fn() }
    vi.spyOn(window, 'open').mockReturnValue(tab as never)
    const wrapper = await open(9)

    for (const id of ['#image', '#pdf']) {
      const input = wrapper.get(id)

      Object.defineProperty(input.element, 'files', {
        value: [new File(['x'], 'a')],
        configurable: true
      })

      await input.trigger('change')
    }

    const view = wrapper.get('#pdf').element.parentElement!.querySelector('button')!
    view.click()
    await settle()
    expect(tab.location.href).toBe('blob:pdf')

    fail('get', /api\/items\/9\/pdf\/$/)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    view.click()
    await settle()
    expect(tab.close).toHaveBeenCalled()
  })
})
