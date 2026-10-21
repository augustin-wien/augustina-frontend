import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import EmailModal from '@/components/EmailModal.vue'
import { usePaymentStore } from '@/stores/payment'

const mountModal = () =>
  mount(EmailModal, {
    props: { licenceItem: { Name: 'Digitale Ausgabe' } },
    global: { mocks: { $t: (key: string) => key } }
  })

const buttonWithText = (wrapper: ReturnType<typeof mountModal>, text: string) =>
  wrapper.findAll('button').find((b) => b.text().includes(text))!

describe('EmailModal', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    window.localStorage.clear()
  })

  it('marks the field as an email field for autofill', () => {
    const input = mountModal().get('input')
    expect(input.attributes('type')).toBe('email')
    expect(input.attributes('autocomplete')).toBe('email')
    expect(input.attributes('name')).toBe('email')
  })

  it('prefills the address saved earlier', () => {
    window.localStorage.setItem('email', 'max@gmail.com')
    expect((mountModal().get('input').element as HTMLInputElement).value).toBe('max@gmail.com')
  })

  it('saves a valid address without a typo straight away', async () => {
    const wrapper = mountModal()
    await wrapper.get('input').setValue('max@gmail.com')
    await wrapper.get('form').trigger('submit')
    expect(usePaymentStore().email).toBe('max@gmail.com')
  })

  it('suggests a correction instead of saving a domain typo', async () => {
    const wrapper = mountModal()
    await wrapper.get('input').setValue('max@gnail.com')
    await wrapper.get('form').trigger('submit')
    expect(wrapper.get('[role=alert]').text()).toContain('max@gmail.com')
    expect(usePaymentStore().email).not.toBe('max@gnail.com')

    await buttonWithText(wrapper, 'Yes, correct it').trigger('click')
    expect(usePaymentStore().email).toBe('max@gmail.com')
  })

  it('saves the address as typed when the customer keeps it', async () => {
    const wrapper = mountModal()
    await wrapper.get('input').setValue('max@gnail.com')
    await wrapper.get('input').trigger('blur')
    expect(wrapper.find('[role=alert]').exists()).toBe(true)

    await buttonWithText(wrapper, 'No, keep').trigger('click')
    expect(usePaymentStore().email).toBe('max@gnail.com')
    expect(wrapper.find('[role=alert]').exists()).toBe(false)
  })
})
