import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import FormField from '@/components/ui/FormField.vue'

describe('FormField', () => {
  it('renders the label associated with the given input id', () => {
    const wrapper = mount(FormField, {
      props: { label: 'E-Mail', for: 'email' },
      slots: { default: '<input id="email" />' }
    })

    const label = wrapper.get('label')
    expect(label.text()).toBe('E-Mail')
    expect(label.attributes('for')).toBe('email')
  })

  it('renders no label element when no label is given', () => {
    const wrapper = mount(FormField, { slots: { default: '<input />' } })
    expect(wrapper.findAll('label')).toHaveLength(0)
  })

  it('renders a required marker next to the label', () => {
    const wrapper = mount(FormField, { props: { label: 'Name', required: true } })
    expect(wrapper.get('.aug-field-required').text()).toBe('*')
  })

  it('shows the error message instead of the hint when both are given', () => {
    const wrapper = mount(FormField, {
      props: { label: 'E-Mail', error: 'Invalid address', hint: 'We never share this' }
    })

    expect(wrapper.get('.aug-field-error').text()).toBe('Invalid address')
    expect(wrapper.find('.aug-field-hint').exists()).toBe(false)
  })

  it('shows the hint when there is no error', () => {
    const wrapper = mount(FormField, {
      props: { label: 'E-Mail', hint: 'We never share this' }
    })

    expect(wrapper.get('.aug-field-hint').text()).toBe('We never share this')
    expect(wrapper.find('.aug-field-error').exists()).toBe(false)
  })

  it('renders the slotted input', () => {
    const wrapper = mount(FormField, {
      props: { label: 'E-Mail' },
      slots: { default: '<input id="email" type="email" />' }
    })

    expect(wrapper.find('input[type="email"]').exists()).toBe(true)
  })
})
