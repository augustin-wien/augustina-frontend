import { describe, expect, it, vi } from 'vitest'
import MailTemplatesSettings from '@/components/settings/MailTemplatesSettings.vue'
import { fail, on, requested } from '@/__tests__/support/backend'
import { mountComponent, settle } from '@/__tests__/support/mount'
import { useSettingsStore } from '@/stores/settings'

const templates = [
  {
    ID: 1,
    Name: 'welcome',
    Subject: 'Willkommen',
    Body: '<p>{{if .InviteURL}}Login{{else}}Kein Login{{end}} {{.URL}} {{if .Missing}}x{{end}} {{.Missing}}</p>'
  },
  { ID: 2, Name: 'other', Subject: 'Andere', Body: 'Text' }
]

const mountTemplates = async () => {
  on('get', /api\/mail-templates\/$/, templates)
  on('get', /api\/mail-templates\/welcome\/$/, templates[0])
  on('get', /api\/mail-templates\/other\/$/, templates[1])
  const { wrapper } = await mountComponent(MailTemplatesSettings)
  vi.spyOn(console, 'error').mockImplementation(() => {})
  return wrapper
}

type Wrapper = Awaited<ReturnType<typeof mountTemplates>>

const select = async (wrapper: Wrapper, index = 0) => {
  await wrapper.findAll('.template-item')[index].trigger('click')
  await settle()
}

describe('MailTemplatesSettings', () => {
  it('saves the sender name', async () => {
    const wrapper = await mountTemplates()

    await wrapper.get('input').setValue(' Augustina ')
    await wrapper.findAll('button')[0].trigger('click')
    await settle()

    expect((requested('put', /api\/settings\/$/)[0].data as FormData).get('MailSenderName')).toBe(
      'Augustina'
    )

    expect(useSettingsStore().settings.MailSenderName).toBe('Augustina')
    expect(wrapper.emitted('saved')).toHaveLength(1)

    fail('put', /api\/settings\/$/)
    await wrapper.findAll('button')[0].trigger('click')
    await settle()
    expect(wrapper.emitted('error')).toHaveLength(1)
  })

  it('follows the sender name of the settings', async () => {
    const wrapper = await mountTemplates()

    useSettingsStore().settings.MailSenderName = 'Neu'
    await settle()

    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('Neu')
  })

  it('previews a template with demo values', async () => {
    const wrapper = await mountTemplates()
    await select(wrapper)

    await wrapper.findAll('.view-toggle-btn')[1].trigger('click')

    expect(wrapper.get('.body-preview').attributes('srcdoc')).toBe(
      '<p>Login https://augustin.wien/zeitung  [Missing]</p>'
    )

    await wrapper.findAll('.view-toggle-btn')[0].trigger('click')
    expect(wrapper.find('.body-textarea').exists()).toBe(true)
  })

  it('inserts a variable at the cursor', async () => {
    const wrapper = await mountTemplates()
    await select(wrapper, 1)
    await select(wrapper)

    const textarea = wrapper.get('.body-textarea')

    await textarea.setValue('AB')

    ;(textarea.element as HTMLTextAreaElement).setSelectionRange(1, 1)
    await textarea.trigger('blur')
    await textarea.trigger('keyup')
    await textarea.trigger('click')
    await wrapper.findAll('.var-chip')[0].trigger('click')

    expect((textarea.element as HTMLTextAreaElement).value).toBe('A{{.URL}}B')
  })

  it('saves the template', async () => {
    const wrapper = await mountTemplates()
    await select(wrapper)

    await wrapper.findAll('.save-row button').slice(-1)[0]!.trigger('click')
    await settle()
    expect(requested('post', /api\/mail-templates\/$/)).toHaveLength(1)
    expect(wrapper.emitted('saved')).toHaveLength(1)

    fail('post', /api\/mail-templates\/$/)
    await wrapper.findAll('.save-row button').slice(-1)[0]!.trigger('click')
    await settle()
    expect(wrapper.emitted('error')).toHaveLength(1)
  })

  it('sends a test mail to the given recipients', async () => {
    const wrapper = await mountTemplates()
    await select(wrapper)
    const testRow = wrapper.findAll('.input-with-action').slice(-1)[0]!
    const send = testRow.get('button')

    await send.trigger('click')
    expect(wrapper.emitted('error')).toHaveLength(1)

    await testRow.get('input').setValue('a@example.org, b@example.org')
    await send.trigger('click')
    await settle()

    expect(JSON.parse(requested('post', /welcome\/send\/$/)[0].data as string).to).toEqual([
      'a@example.org',
      'b@example.org'
    ])

    fail('post', /send\/$/)
    await send.trigger('click')
    await settle()
    expect(wrapper.emitted('error')).toHaveLength(2)
  })

  it('reports templates that fail to load', async () => {
    const wrapper = await mountTemplates()

    fail('get', /api\/mail-templates\/welcome\/$/)
    await select(wrapper)
    expect(wrapper.emitted('error')).toHaveLength(1)
  })

  it('reports a list that fails to load', async () => {
    fail('get', /api\/mail-templates\/$/)
    vi.spyOn(console, 'error').mockImplementation(() => {})
    const { wrapper } = await mountComponent(MailTemplatesSettings)

    expect(wrapper.emitted('error')).toHaveLength(1)
  })
})
