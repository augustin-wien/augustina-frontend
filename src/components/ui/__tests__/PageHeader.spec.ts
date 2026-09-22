import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import PageHeader from '@/components/ui/PageHeader.vue'

describe('PageHeader', () => {
  it('renders the title', () => {
    const wrapper = mount(PageHeader, { props: { title: 'Vendors' } })
    expect(wrapper.get('.page-header-title').text()).toBe('Vendors')
  })

  it('renders no back button by default', () => {
    const wrapper = mount(PageHeader, { props: { title: 'Vendors' } })
    expect(wrapper.find('.page-header-back').exists()).toBe(false)
  })

  it('renders a back button when showBack is set, and emits back on click', async () => {
    const wrapper = mount(PageHeader, { props: { title: 'Edit vendor', showBack: true } })

    const back = wrapper.get('.page-header-back')
    await back.trigger('click')

    expect(wrapper.emitted('back')).toHaveLength(1)
  })

  it('renders no actions area when no default slot content is given', () => {
    const wrapper = mount(PageHeader, { props: { title: 'Vendors' } })
    expect(wrapper.find('.page-header-actions').exists()).toBe(false)
  })

  it('renders slotted actions', () => {
    const wrapper = mount(PageHeader, {
      props: { title: 'Vendors' },
      slots: { default: '<button>Export</button>' }
    })

    expect(wrapper.get('.page-header-actions').text()).toBe('Export')
  })
})
