import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import Badge from '@/components/ui/Badge.vue'

describe('Badge', () => {
  it('renders its slot content', () => {
    const wrapper = mount(Badge, { slots: { default: 'Aktiv' } })
    expect(wrapper.text()).toBe('Aktiv')
  })

  it('defaults to the neutral variant', () => {
    const wrapper = mount(Badge)
    expect(wrapper.get('span').classes()).toContain('aug-badge-neutral')
  })

  it.each(['success', 'danger', 'info', 'neutral'] as const)(
    'applies the %s variant class',
    (variant) => {
      const wrapper = mount(Badge, { props: { variant } })
      expect(wrapper.get('span').classes()).toContain(`aug-badge-${variant}`)
    }
  )
})
