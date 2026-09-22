import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Button from '@/components/ui/Button.vue'

describe('Button', () => {
  it('renders its slot content', () => {
    const wrapper = mount(Button, { slots: { default: 'Save' } })
    expect(wrapper.text()).toBe('Save')
  })

  it('defaults to a primary, type=button element', () => {
    const wrapper = mount(Button)
    const button = wrapper.get('button')
    expect(button.classes()).toContain('aug-btn-primary')
    expect(button.attributes('type')).toBe('button')
  })

  it('applies the requested variant class', () => {
    const wrapper = mount(Button, { props: { variant: 'danger' } })
    expect(wrapper.get('button').classes()).toContain('aug-btn-danger')
    expect(wrapper.get('button').classes()).not.toContain('aug-btn-primary')
  })

  it('passes the type prop through to the native button', () => {
    const wrapper = mount(Button, { props: { type: 'submit' } })
    expect(wrapper.get('button').attributes('type')).toBe('submit')
  })

  it('forwards click listeners through attrs fallthrough', async () => {
    let clicks = 0
    const wrapper = mount(Button, { attrs: { onClick: () => clicks++ } })

    await wrapper.get('button').trigger('click')

    expect(clicks).toBe(1)
  })
})
