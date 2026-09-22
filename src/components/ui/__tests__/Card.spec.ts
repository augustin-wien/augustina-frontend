import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Card from '@/components/ui/Card.vue'

describe('Card', () => {
  it('renders its slot content inside .aug-card', () => {
    const wrapper = mount(Card, { slots: { default: '<p>Vendor table</p>' } })
    expect(wrapper.classes()).toContain('aug-card')
    expect(wrapper.html()).toContain('Vendor table')
  })
})
