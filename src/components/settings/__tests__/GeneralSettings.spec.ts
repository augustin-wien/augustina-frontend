import { describe, expect, it, vi } from 'vitest'
import GeneralSettings from '@/components/settings/GeneralSettings.vue'
import ModuleCard from '@/components/settings/ModuleCard.vue'
import { fail, on, requested } from '@/__tests__/support/backend'
import * as f from '@/__tests__/support/fixtures'
import { mountComponent, settle } from '@/__tests__/support/mount'
import i18n from '@/locales/i18n'
import { useSettingsStore } from '@/stores/settings'

const t = (key: string) => i18n.global.t(key)

type Section = 'general' | 'modules' | 'qrcode'

const mountSettings = async (section: Section, overrides: Record<string, unknown> = {}) => {
  const harness = await mountComponent(GeneralSettings, {
    props: {
      updatedSettings: { ...f.settings(), ...overrides },
      items: f.items(),
      url: 'http://backend/',
      section,
      canSave: true
    }
  })

  return harness.wrapper
}

const moduleCard = (wrapper: Awaited<ReturnType<typeof mountSettings>>, titleKey: string) =>
  wrapper.findAllComponents(ModuleCard).find((c) => c.props('title') === t(titleKey))!

const savedForm = () => requested('put', /api\/settings\/$/).slice(-1)[0]!.data as FormData

describe('GeneralSettings', () => {
  it('saves the general settings', async () => {
    const wrapper = await mountSettings('general')

    await wrapper.get('#newspapername').setValue('Augustina')
    await (wrapper.vm as unknown as { saveSettings: () => Promise<boolean> }).saveSettings()

    expect(savedForm().get('NewspaperName')).toBe('Augustina')
    expect(wrapper.emitted('saved')).toHaveLength(1)
  })

  it('refuses a vendor email postfix that makes no valid address', async () => {
    const wrapper = await mountSettings('general')

    await wrapper.get('#vendorEmailPostfix').setValue('not an address')

    const saved = await (
      wrapper.vm as unknown as { saveSettings: () => Promise<boolean> }
    ).saveSettings()

    expect(saved).toBe(false)
    expect(wrapper.emitted('error')).toHaveLength(1)
    expect(requested('put', /api\/settings\/$/)).toHaveLength(0)
  })

  it('previews uploaded logo and favicon', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:preview')
    const wrapper = await mountSettings('general')
    const [logo, favicon] = wrapper.findAll('input[type="file"]')

    for (const input of [logo, favicon]) {
      Object.defineProperty(input.element, 'files', {
        value: [new File(['x'], 'a.png')],
        configurable: true
      })

      await input.trigger('change')
    }

    expect(wrapper.findAll('img[src="blob:preview"]')).toHaveLength(2)

    Object.defineProperty(logo.element, 'files', { value: [], configurable: true })
    await logo.trigger('change')
  })

  it('opens the AGB and privacy links', async () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const wrapper = await mountSettings('general')
    const store = useSettingsStore()
    store.settings.AGBUrl = 'https://example.org/agb'
    store.settings.PrivacyPolicyUrl = 'https://example.org/privacy'

    const buttons = wrapper.findAll('button').filter((b) => b.text() === t('Open'))
    for (const b of buttons) await b.trigger('click')

    expect(open).toHaveBeenCalledTimes(2)
  })

  it('tests the WordPress invite with the values in the form', async () => {
    on('post', /wordpress-invite\/test\/$/, {
      Success: true,
      Message: 'ok',
      Link: 'https://wp/invite'
    })

    const wrapper = await mountSettings('modules', {
      WordPressInviteURL: 'https://wp',
      WordPressInviteAPIKey: 'key'
    })

    const test = wrapper.get('.wp-invite-test button')
    await test.trigger('click')
    await settle()

    expect(requested('post', /wordpress-invite/)[0].data).toMatchObject({
      WordPressInviteURL: 'https://wp'
    })

    expect(wrapper.text()).toContain('https://wp/invite')

    fail('post', /wordpress-invite\/test\/$/)
    await test.trigger('click')
    await settle()
    expect(wrapper.text()).toContain('500')
  })

  it('saves before testing nextcloud and shows the result', async () => {
    on('post', /nextcloud\/test\/$/, { Success: false, Message: 'Login falsch' })
    const wrapper = await mountSettings('modules')

    const test = wrapper.get('.connection-test button')
    await test.trigger('click')
    await settle()

    expect(requested('put', /api\/settings\/$/)).toHaveLength(1)
    expect(wrapper.text()).toContain('Login falsch')

    fail('post', /nextcloud\/test\/$/)
    await test.trigger('click')
    await settle()
    expect(wrapper.text()).toContain('500')
  })

  it('clears the url of integrations that are switched off', async () => {
    const wrapper = await mountSettings('modules', {
      MatomoUrl: 'https://matomo',
      OdooWebhookURL: 'https://odoo',
      WordPressInviteURL: 'https://wp'
    })

    for (const title of ['matomoTitle', 'odooTitle', 'wpInviteTitle']) {
      moduleCard(wrapper, title)?.vm.$emit('update:modelValue', false)
    }

    await settle()
    await (wrapper.vm as unknown as { saveSettings: () => Promise<boolean> }).saveSettings()

    expect(savedForm().get('MatomoUrl')).toBe('')
    expect(savedForm().get('OdooWebhookURL')).toBe('')
    expect(savedForm().get('WordPressInviteURL')).toBe('')
  })

  it('follows settings that arrive after mount', async () => {
    const wrapper = await mountSettings('modules', { MatomoUrl: '' })

    await wrapper.setProps({ updatedSettings: { ...f.settings(), MatomoUrl: 'https://matomo' } })

    expect(moduleCard(wrapper, 'matomoTitle').props('modelValue')).toBe(true)
  })

  it('previews an uploaded QR code logo', async () => {
    URL.createObjectURL = vi.fn(() => 'blob:qr')
    const wrapper = await mountSettings('qrcode', { QRCodeEnableLogo: true })
    const input = wrapper.get('input[type="file"]')

    Object.defineProperty(input.element, 'files', {
      value: [new File(['x'], 'qr.png')],
      configurable: true
    })

    await input.trigger('change')

    expect(wrapper.find('img[src="blob:qr"]').exists()).toBe(true)
  })
})
