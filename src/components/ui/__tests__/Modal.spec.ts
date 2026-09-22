import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import Modal from '@/components/ui/Modal.vue'

describe('Modal', () => {
  let showModalSpy: ReturnType<typeof vi.fn>
  let closeSpy: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // jsdom doesn't implement <dialog>'s modal behavior, so calling the real methods would throw.
    // Stub them and assert the component drives them correctly instead.
    showModalSpy = vi.fn()
    closeSpy = vi.fn()
    HTMLDialogElement.prototype.showModal = showModalSpy
    HTMLDialogElement.prototype.close = closeSpy
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('calls showModal() once mounted open', async () => {
    mount(Modal, { props: { open: true, title: 'Delete vendor' } })
    await flushPromises()
    expect(showModalSpy).toHaveBeenCalledTimes(1)
  })

  it('does not call showModal() when mounted closed', async () => {
    mount(Modal, { props: { open: false } })
    await flushPromises()
    expect(showModalSpy).not.toHaveBeenCalled()
  })

  it('calls close() when the open prop flips to false', async () => {
    const wrapper = mount(Modal, { props: { open: true } })
    await flushPromises()
    expect(showModalSpy).toHaveBeenCalledTimes(1)

    await wrapper.setProps({ open: false })
    await flushPromises()
    expect(closeSpy).toHaveBeenCalledTimes(1)
  })

  it('emits close when the header close button is clicked', async () => {
    const wrapper = mount(Modal, { props: { open: true, title: 'Delete vendor' } })
    await wrapper.get('.aug-icon-btn').trigger('click')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('emits close on the dialog cancel event (Esc key)', async () => {
    const wrapper = mount(Modal, { props: { open: true } })
    await wrapper.get('dialog').trigger('cancel')
    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('renders the title in the header', () => {
    const wrapper = mount(Modal, { props: { open: true, title: 'Delete vendor' } })
    expect(wrapper.get('.aug-modal-title').text()).toBe('Delete vendor')
  })

  it('renders no footer when no footer slot content is given', () => {
    const wrapper = mount(Modal, { props: { open: true, title: 'x' } })
    expect(wrapper.find('.aug-modal-footer').exists()).toBe(false)
  })

  it('renders the footer slot when given', () => {
    const wrapper = mount(Modal, {
      props: { open: true, title: 'x' },
      slots: { footer: '<button>Confirm</button>' }
    })

    expect(wrapper.get('.aug-modal-footer').text()).toBe('Confirm')
  })
})
