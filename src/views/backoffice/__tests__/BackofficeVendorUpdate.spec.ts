import { describe, expect, it, vi } from 'vitest'
import router from '@/router'
import AddressModal from '@/components/AddressModal.vue'
import CommentsModal from '@/components/CommentsModal.vue'
import { fail, on, requested } from '@/__tests__/support/backend'
import * as f from '@/__tests__/support/fixtures'
import { mountRoute, settle } from '@/__tests__/support/mount'

const open = async (vendor = f.vendor()) => {
  on('get', /api\/vendors\/1\/$/, vendor)
  const { wrapper } = await mountRoute('/backoffice/userprofile/1/update')
  return wrapper
}

const savedVendor = () =>
  JSON.parse(requested('put', /api\/vendors\/1\/$/).slice(-1)[0]!.data as string)

describe('BackofficeVendorUpdate', () => {
  it('saves the changed vendor', async () => {
    const wrapper = await open()

    await wrapper.get('#firstName').setValue('Anne')
    await wrapper.get('form').trigger('submit')
    await settle()

    expect(savedVendor()).toMatchObject({ FirstName: 'Anne', Email: 'anna@example.org' })
    expect(wrapper.text()).toContain('has been updated')
  })

  it('sends an empty email for a vendor without own email', async () => {
    const wrapper = await open(
      f.vendor({ HasOwnEmail: false, Email: 'aug-1@vendor.augustin.or.at' })
    )

    expect(wrapper.find('#email').exists()).toBe(false)
    await wrapper.get('form').trigger('submit')
    await settle()

    expect(savedVendor().Email).toBe('')
  })

  it('starts with an empty field when switching to an own email, and requires it', async () => {
    const wrapper = await open(
      f.vendor({ HasOwnEmail: false, Email: 'aug-1@vendor.augustin.or.at' })
    )

    await wrapper.get('#useOwnEmail').setValue(true)
    expect((wrapper.get('#email').element as HTMLInputElement).value).toBe('')

    await wrapper.get('form').trigger('submit')
    await settle()
    expect(requested('put', /api\/vendors\/1\/$/)).toHaveLength(0)
  })

  it('requires a note for a blocked vendor', async () => {
    const wrapper = await open()

    await wrapper.get('#isBlocked').setValue('true')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(requested('put', /api\/vendors\/1\/$/)).toHaveLength(0)

    await wrapper.get('#blockedNote').setValue('Hausverbot')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(savedVendor()).toMatchObject({ IsBlocked: true, BlockedNote: 'Hausverbot' })
  })

  it('asks what happens to the locations before disabling', async () => {
    const wrapper = await open()

    await wrapper.get('#isDisabled').setValue('true')
    await wrapper.get('form').trigger('submit')
    await settle()
    expect(requested('put', /api\/vendors\/1\/$/)).toHaveLength(0)

    await wrapper.get('input[name="disableLocations"][value="keep"]').setValue(true)
    await wrapper.get('#disable-vendor-confirm').trigger('click')
    await settle()

    expect(requested('put', /api\/vendors\/1\/$/)[0].params).toEqual({ locations: 'keep' })
  })

  it('shows an error when saving fails', async () => {
    const wrapper = await open()
    fail('put', /api\/vendors\/1\/$/)

    await wrapper.get('form').trigger('submit')
    await settle()

    expect(wrapper.text()).toContain('could not be updated')
  })

  it('refuses to delete a vendor with a balance', async () => {
    const wrapper = await open()

    await wrapper.get('#delete-vendor').trigger('click')
    await wrapper.get('#delete-vendor-confirm').trigger('click')
    await settle()

    expect(requested('delete', /api\/vendors\/1\/$/)).toHaveLength(0)
  })

  it('deletes a vendor and its locations', async () => {
    const wrapper = await open(f.vendor({ Balance: 0 }))

    await wrapper.get('#delete-vendor').trigger('click')
    await wrapper.get('input[name="deleteLocations"][value="delete"]').setValue(true)
    await wrapper.get('#delete-vendor-confirm').trigger('click')
    await settle()

    expect(requested('delete', /api\/vendors\/1\/$/)[0].params).toEqual({ locations: 'delete' })

    await vi.waitFor(
      () => expect(router.currentRoute.value.path).toBe('/backoffice/vendorsummary'),
      {
        timeout: 10000
      }
    )
  })

  it('shows an error when deleting fails', async () => {
    const wrapper = await open(f.vendor({ Balance: 0 }))
    fail('delete', /api\/vendors\/1\/$/)
    vi.spyOn(console, 'error').mockImplementation(() => {})

    await wrapper.get('#delete-vendor').trigger('click')
    await wrapper.get('#delete-vendor-confirm').trigger('click')
    await settle()

    expect(wrapper.text()).toContain('could not be deleted')
  })

  it('adds, edits and deletes locations', async () => {
    const wrapper = await open()

    const addButton = wrapper.findAll('.section-header button')[0]
    await addButton.trigger('click')
    wrapper.findComponent(AddressModal).vm.$emit('update', f.vendorLocation({ id: 0 }))
    await settle()
    expect(requested('post', /api\/vendors\/1\/locations\/$/)).toHaveLength(1)

    const entryButtons = wrapper.findAll('.entry-list')[0].findAll('button')
    await entryButtons[0].trigger('click')
    wrapper.findComponent(AddressModal).vm.$emit('update', f.vendorLocation({ id: 1, name: 'Neu' }))
    await settle()
    expect(requested('patch', /api\/vendors\/1\/locations\/1\/$/)).toHaveLength(1)

    await entryButtons[0].trigger('click')
    wrapper.findComponent(AddressModal).vm.$emit('close')
    await settle()
    expect(wrapper.findComponent(AddressModal).exists()).toBe(false)

    await entryButtons[1].trigger('click')
    await settle()
    expect(requested('delete', /api\/vendors\/1\/locations\/1\/$/)).toHaveLength(1)
  })

  it('adds, edits and deletes comments', async () => {
    const wrapper = await open()

    const addComment = wrapper.findAll('.section-header button').slice(-1)[0]!
    await addComment.trigger('click')

    wrapper
      .findComponent(CommentsModal)
      .vm.$emit('update', f.vendorComment({ id: 0, comment: 'neu' }))

    await settle()
    expect(requested('post', /api\/vendors\/1\/comments\/$/)).toHaveLength(1)

    const commentList = wrapper.findAll('.entry-list').slice(-1)[0]!
    await commentList.findAll('button')[0].trigger('click')

    wrapper
      .findComponent(CommentsModal)
      .vm.$emit('update', f.vendorComment({ comment: 'geändert' }))

    await settle()
    expect(requested('patch', /api\/vendors\/1\/comments\/1\/$/)).toHaveLength(1)

    await commentList.findAll('button')[0].trigger('click')
    wrapper.findComponent(CommentsModal).vm.$emit('close')
    await settle()

    await wrapper.get('#delete-vendor-comment').trigger('click')
    await settle()
    expect(requested('delete', /api\/vendors\/1\/comments\/1\/$/)).toHaveLength(1)
  })

  it('sends the account mails only for a saved own email', async () => {
    const wrapper = await open()

    const mailButtons = wrapper.findAll('button').filter((b) => /mail/i.test(b.text()))
    for (const b of mailButtons) await b.trigger('click')
    await settle()

    expect(requested('post', /password-reset-email|verify-email/).length).toBeGreaterThan(0)
  })
})
