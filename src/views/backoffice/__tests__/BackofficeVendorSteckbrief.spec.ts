import { describe, expect, it, vi } from 'vitest'
import { fail, on, requested, steckbrief } from '@/__tests__/support/backend'
import { mountRoute, settle } from '@/__tests__/support/mount'
import { useSettingsStore } from '@/stores/settings'
import i18n from '@/locales/i18n'

const open = async () =>
  (
    await mountRoute('/backoffice/userprofile/1/steckbrief', {
      before: () => useSettingsStore().getSettingsFromApi()
    })
  ).wrapper

type Wrapper = Awaited<ReturnType<typeof open>>

const choosePhoto = async (wrapper: Wrapper) => {
  const input = wrapper.get('input[type="file"]')

  Object.defineProperty(input.element, 'files', {
    value: [new File(['x'], 'foto.jpg')],
    configurable: true
  })

  await input.trigger('change')
  await settle()
}

describe('BackofficeVendorSteckbrief', () => {
  it('saves the edited texts', async () => {
    on('put', /steckbrief\/$/, { VendorID: 1, ...steckbrief(), Residence: 'Graz' })
    const wrapper = await open()

    await wrapper.get('#steckbrief-Residence').setValue('Graz')
    await wrapper.get('form').trigger('submit')
    await settle()

    expect(requested('put', /api\/vendors\/1\/steckbrief\/$/)[0].data).toMatchObject({
      Residence: 'Graz'
    })

    expect(wrapper.get('[role="status"]').classes()).toContain('status-ok')
  })

  it('reports a failed save', async () => {
    const wrapper = await open()
    fail('put', /steckbrief\/$/)

    await wrapper.get('form').trigger('submit')
    await settle()

    expect(wrapper.get('[role="status"]').classes()).toContain('status-error')
  })

  it('uploads and removes the photo', async () => {
    on('post', /steckbrief\/image\/$/, { Image: '/img/neu.jpg' })
    on('delete', /steckbrief\/image\/$/, { Image: '' })
    vi.spyOn(window, 'confirm').mockReturnValueOnce(false).mockReturnValue(true)
    const wrapper = await open()

    await choosePhoto(wrapper)
    expect(wrapper.find('img[src*="neu.jpg"]').exists()).toBe(true)

    const remove = () =>
      wrapper
        .findAll('button')
        .find((b) => b.text().includes(i18n.global.t('steckbriefRemovePhoto')))

    await remove()!.trigger('click')
    await settle()
    expect(requested('delete', /steckbrief\/image\/$/)).toHaveLength(0)

    await remove()!.trigger('click')
    await settle()
    expect(requested('delete', /steckbrief\/image\/$/)).toHaveLength(1)
    expect(wrapper.text()).toContain('AM')
  })

  it('reports failed photo changes', async () => {
    fail('post', /steckbrief\/image\/$/)
    fail('delete', /steckbrief\/image\/$/)
    vi.spyOn(window, 'confirm').mockReturnValue(true)
    const wrapper = await open()

    await choosePhoto(wrapper)
    expect(wrapper.get('[role="status"]').classes()).toContain('status-error')

    await wrapper
      .findAll('button')
      .find((b) => b.text().includes(i18n.global.t('steckbriefRemovePhoto')))!
      .trigger('click')

    await settle()
    expect(wrapper.get('[role="status"]').classes()).toContain('status-error')
  })

  it('prints the sheet', async () => {
    const print = vi.spyOn(window, 'print').mockImplementation(() => {})
    const wrapper = await open()

    await wrapper
      .findAll('button')
      .find((b) => b.text().includes(i18n.global.t('print')))!
      .trigger('click')

    expect(print).toHaveBeenCalled()
  })

  it('loads the steckbrief when the settings are not loaded yet', async () => {
    const { wrapper } = await mountRoute('/backoffice/userprofile/1/steckbrief')

    expect(requested('get', /api\/vendors\/1\/steckbrief\/$/)).toHaveLength(1)
    expect(wrapper.find('form').exists()).toBe(true)
  })

  it('shows that loading failed', async () => {
    fail('get', /api\/vendors\/1\/steckbrief\/$/)
    const wrapper = await open()

    expect(wrapper.find('form').exists()).toBe(false)
  })

  it('shows nothing to edit while the module is off', async () => {
    const { wrapper } = await mountRoute('/backoffice/userprofile/1/steckbrief', {
      before: async () => {
        await useSettingsStore().getSettingsFromApi()
        useSettingsStore().settings.SteckbriefEnabled = false
      }
    })

    expect(wrapper.find('form').exists()).toBe(false)
    expect(requested('get', /steckbrief/)).toHaveLength(0)
  })
})
