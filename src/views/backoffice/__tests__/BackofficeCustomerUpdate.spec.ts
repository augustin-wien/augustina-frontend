import { describe, expect, it, vi } from 'vitest'
import router from '@/router'
import AccountMailButtons from '@/components/AccountMailButtons.vue'
import { fail, on, requested } from '@/__tests__/support/backend'
import * as f from '@/__tests__/support/fixtures'
import { mountRoute, settle } from '@/__tests__/support/mount'

const open = async (id: string | number = 1) =>
  (await mountRoute(`/backoffice/customers/${id}`)).wrapper

type Wrapper = Awaited<ReturnType<typeof open>>

const button = (wrapper: Wrapper, text: string) =>
  wrapper.findAll('button').filter((b) => b.text().includes(text))[0]

const dialogButton = (wrapper: Wrapper) => wrapper.findAll('dialog[open] button').slice(-1)[0]!

const body = (method: 'post' | 'put', url: RegExp) =>
  JSON.parse(requested(method, url).slice(-1)[0]!.data as string)

describe('BackofficeCustomerUpdate', () => {
  it('saves the customer with added and removed license groups', async () => {
    const wrapper = await open()

    await wrapper.get('#firstname').setValue('Karla')
    await wrapper.get('.license-add-row select').setValue('analog_edition')
    await wrapper.get('.license-add-row button').trigger('click')
    await wrapper.get('.license-chip-remove').trigger('click')
    await button(wrapper, 'Save').trigger('click')
    await settle()

    expect(body('put', /api\/customers\/1\/$/)).toMatchObject({
      firstname: 'Karla',
      licensegroups: ['analog_edition']
    })

    expect(wrapper.text()).toContain('Customer updated')
  })

  it('creates a new customer and goes back to the list', async () => {
    on('post', /api\/customers\/$/, f.customer({ id: 5 }))
    const wrapper = await open('new')

    await wrapper.get('#email').setValue('neu@example.org')
    await button(wrapper, 'Save').trigger('click')
    await settle()

    expect(body('post', /api\/customers\/$/).email).toBe('neu@example.org')

    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/backoffice/customers'), {
      timeout: 10000
    })
  })

  it('shows why saving failed', async () => {
    const wrapper = await open()
    fail('put', /api\/customers\/1\/$/, 400, { error: { message: 'Email vergeben' } })

    await button(wrapper, 'Save').trigger('click')
    await settle()

    expect(wrapper.text()).toContain('Email vergeben')
  })

  it('deletes the customer', async () => {
    const wrapper = await open()

    await button(wrapper, 'Delete').trigger('click')
    await dialogButton(wrapper).trigger('click')
    await settle()

    expect(requested('delete', /api\/customers\/1\/$/)).toHaveLength(1)

    await vi.waitFor(() => expect(router.currentRoute.value.path).toBe('/backoffice/customers'), {
      timeout: 10000
    })
  })

  it('reports a failed delete', async () => {
    const wrapper = await open()
    fail('delete', /api\/customers\/1\/$/)

    await button(wrapper, 'Delete').trigger('click')
    await dialogButton(wrapper).trigger('click')
    await settle()

    expect(wrapper.text()).toContain('Could not delete customer')
  })

  it('creates, edits and deletes abonements', async () => {
    const wrapper = await open()

    await wrapper.get('.section-header button').trigger('click')
    await dialogButton(wrapper).trigger('click')
    await settle()

    expect(body('post', /api\/abonements\/$/)).toMatchObject({
      customer_id: 1,
      item_id: 7,
      status: 'active'
    })

    await wrapper.findAll('.aug-table .aug-icon-btn')[0].trigger('click')
    await wrapper.findAll('dialog[open] select').slice(-1)[0]!.setValue('cancelled')
    await dialogButton(wrapper).trigger('click')
    await settle()
    expect(body('put', /api\/abonements\/1\/$/).status).toBe('cancelled')

    await wrapper.findAll('.aug-table .aug-icon-btn')[1].trigger('click')
    await dialogButton(wrapper).trigger('click')
    await settle()
    expect(requested('delete', /api\/abonements\/1\/$/)).toHaveLength(1)
  })

  it('reports failures around abonements', async () => {
    const wrapper = await open()
    fail('post', /api\/abonements\/$/, 400, 'kaputt')
    fail('delete', /api\/abonements\//)

    await wrapper.get('.section-header button').trigger('click')
    await dialogButton(wrapper).trigger('click')
    await settle()
    expect(wrapper.text()).toContain('Could not save abonement')

    await wrapper.findAll('dialog[open] button').slice(-2)[0]!.trigger('click')
    await wrapper.findAll('.aug-table .aug-icon-btn')[1].trigger('click')
    await dialogButton(wrapper).trigger('click')
    await settle()
    expect(wrapper.text()).toContain('Could not delete abonement')
  })

  it('needs an abonement product before adding an abonement', async () => {
    on(
      'get',
      /api\/items\/backoffice\/$/,
      f.items().filter((i) => i.Type !== 'abonement')
    )

    const wrapper = await open()

    await wrapper.get('.section-header button').trigger('click')

    expect(wrapper.find('dialog[open]').exists()).toBe(false)
  })

  it('sends the account mails and shows the result', async () => {
    const wrapper = await open()
    const mails = wrapper.findComponent(AccountMailButtons)

    for (const b of mails.findAll('button')) {
      await b.trigger('click')
      await settle()
    }

    expect(requested('post', /api\/customers\/1\/(password-reset|verify)-email\/$/)).toHaveLength(2)

    fail('post', /verify-email/, 500, { error: { message: 'Keycloak weg' } })
    await mails.findAll('button').slice(-1)[0]!.trigger('click')
    await settle()
    expect(wrapper.text()).toContain('Keycloak weg')
  })
})
