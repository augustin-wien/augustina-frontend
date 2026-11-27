import { describe, expect, it, vi } from 'vitest'
import router from '@/router'
import { fail, on, requested } from '@/__tests__/support/backend'
import * as f from '@/__tests__/support/fixtures'
import { mountRoute, settle } from '@/__tests__/support/mount'

describe('BackofficeVendorNew', () => {
  const open = async () => (await mountRoute('/backoffice/newvendor')).wrapper

  const fill = async (wrapper: Awaited<ReturnType<typeof open>>) => {
    await wrapper.get('#firstName').setValue('Neu')
    await wrapper.get('#lastName').setValue('Verkäufer')
    await wrapper.get('#licenseID').setValue('AUG-9')
  }

  it('creates a vendor with the internal email and goes to the summary', async () => {
    const wrapper = await open()

    await fill(wrapper)
    await wrapper.get('form').trigger('submit')
    await settle()

    expect(JSON.parse(requested('post', /api\/vendors\/$/)[0].data as string)).toMatchObject({
      FirstName: 'Neu',
      LicenseID: 'AUG-9',
      Email: ''
    })

    await vi.waitFor(() => expect(router.currentRoute.value.name).toBe('Vendor Summary'), {
      timeout: 10000
    })
  })

  it.each([
    ['#firstName', 'Vorname'],
    ['#lastName', 'Nachname'],
    ['#licenseID', 'Lizenznummer']
  ])('requires %s', async (field, message) => {
    const wrapper = await open()

    await fill(wrapper)
    await wrapper.get(field).setValue('')
    await wrapper.get('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain(message)
    expect(requested('post', /api\/vendors\/$/)).toHaveLength(0)
  })

  it('requires the own email when switched on', async () => {
    const wrapper = await open()

    await fill(wrapper)
    await wrapper.get('#useOwnEmail').setValue(true)
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(requested('post', /api\/vendors\/$/)).toHaveLength(0)

    await wrapper.get('#email').setValue('neu@example.org')
    await wrapper.get('form').trigger('submit')
    await settle()

    expect(JSON.parse(requested('post', /api\/vendors\/$/)[0].data as string).Email).toBe(
      'neu@example.org'
    )
  })

  it('shows why creating failed', async () => {
    const wrapper = await open()
    fail('post', /api\/vendors\/$/, 400, { error: { message: 'Lizenz vergeben' } })
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await fill(wrapper)
    await wrapper.get('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('Lizenz vergeben')
  })

  it('downloads the csv template and imports vendors from a csv file', async () => {
    const wrapper = await open()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const pickers: HTMLInputElement[] = []

    vi.spyOn(HTMLInputElement.prototype, 'click').mockImplementation(function (
      this: HTMLInputElement
    ) {
      pickers.push(this)
    })

    on('get', /api\/vendors\/check\//, 'unknown', 404)
    on('post', /api\/vendors\/$/, 42)

    const [template, importButton] = wrapper.findAll('.csv-footer button')
    await template.trigger('click')
    expect(click).toHaveBeenCalled()

    await importButton.trigger('click')
    const csv = 'header\n1020;Billa;Gasse 1;16,3;48,2;;AUG-9;Neu;V;;de;;;Kommentar;ja;nein;ja;;\n'
    Object.defineProperty(pickers[0], 'files', { value: [new File([csv], 'v.csv')] })
    await pickers[0].onchange!(new Event('change'))
    await settle()

    expect(requested('post', /api\/vendors\/42\/locations\/$/)).toHaveLength(1)
    expect(wrapper.text()).toContain('erfolgreich angelegt')
  })
})

describe('BackofficeCampaigns', () => {
  const open = async () => (await mountRoute('/backoffice/campaigns')).wrapper

  it('lists campaigns with status, period and click rate', async () => {
    on('get', /api\/campaigns\/$/, [
      f.campaign(),
      f.campaign({ id: 2, starts_at: null, ends_at: null, views: 0 }),
      f.campaign({ id: 3, starts_at: null, item_id: 99 }),
      f.campaign({ id: 4, ends_at: null, enabled: false })
    ])

    const wrapper = await open()

    expect(wrapper.findAll('tbody tr')).toHaveLength(4)
    expect(wrapper.text()).toContain('7,0 %')
    expect(wrapper.text()).toContain('#99')
  })

  it('shows that loading failed', async () => {
    fail('get', /api\/campaigns\/$/)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await open()

    expect(wrapper.find('.campaigns-empty').exists()).toBe(true)
  })

  it('creates a campaign and refuses an end before the start', async () => {
    const wrapper = await open()

    await wrapper
      .findAll('button')
      .find((b) => b.text().includes('Campaign') || b.text().includes('campaign'))!
      .trigger('click')

    const form = wrapper.get('#campaign-form')
    await form.get('input[type="text"]').setValue('Ostern')
    await form.get('select').setValue(6)
    const [start, end] = form.findAll('input[type="datetime-local"]')
    await start.setValue('2026-04-01T10:00')
    await end.setValue('2026-03-01T10:00')
    await form.trigger('submit')
    await settle()
    expect(requested('post', /api\/campaigns\/$/)).toHaveLength(0)

    await end.setValue('2026-04-10T10:00')
    await form.trigger('submit')
    await settle()

    expect(requested('post', /api\/campaigns\/$/)[0].data).toMatchObject({
      name: 'Ostern',
      item_id: 6
    })

    expect(wrapper.find('#campaign-form').exists()).toBe(false)
  })

  it('edits, toggles and deletes campaigns', async () => {
    on('put', /api\/campaigns\/1\/$/, f.campaign({ enabled: false }))
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValue(true)
    const wrapper = await open()

    await wrapper.findAll('.aug-table .aug-icon-btn')[0].trigger('click')
    await wrapper.get('#campaign-form').trigger('submit')
    await settle()
    expect(requested('put', /api\/campaigns\/1\/$/)).toHaveLength(1)

    await wrapper.get('tbody input[type="checkbox"]').trigger('change')
    await settle()
    expect(requested('put', /api\/campaigns\/1\/$/)[1].data).toMatchObject({ enabled: true })

    await wrapper.findAll('.aug-table .aug-icon-btn-danger')[0].trigger('click')
    await wrapper.findAll('.aug-table .aug-icon-btn-danger')[0].trigger('click')
    await settle()
    expect(requested('delete', /api\/campaigns\/1\/$/)).toHaveLength(1)
  })

  it('alerts when saving, toggling or deleting fails', async () => {
    const alert = vi.spyOn(window, 'alert').mockImplementation(() => {})
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const wrapper = await open()
    fail('put', /api\/campaigns\//)
    fail('delete', /api\/campaigns\//)

    await wrapper.findAll('.aug-table .aug-icon-btn')[0].trigger('click')
    await wrapper.get('#campaign-form').trigger('submit')
    await settle()
    await wrapper.findAll('dialog[open] button')[0].trigger('click')
    await wrapper.get('tbody input[type="checkbox"]').trigger('change')
    await settle()
    await wrapper.findAll('.aug-table .aug-icon-btn-danger')[0].trigger('click')
    await settle()

    expect(alert).toHaveBeenCalledTimes(3)
  })
})
