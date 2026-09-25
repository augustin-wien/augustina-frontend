import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import VendorPicker from '@/components/VendorPicker.vue'
import type { Vendor } from '@/stores/vendor'

const vendor = (ID: number, LicenseID: string, FirstName: string, LastName = 'X') =>
  ({ ID, LicenseID, FirstName, LastName }) as Vendor

// 30 vendors plus two that share a name with a license-ID match
const vendors = [
  ...Array.from({ length: 30 }, (_, i) => vendor(i + 1, `fl-${100 + i}`, `Name${i}`)),
  vendor(99, 'xx-1', 'Maria', 'fl-12er'),
  vendor(100, 'fl-12', 'Josef')
]

const mountPicker = (modelValue: number | null = null) =>
  mount(VendorPicker, {
    props: { modelValue, vendors },
    global: { mocks: { $t: (key: string) => key } }
  })

const options = (wrapper: ReturnType<typeof mountPicker>) =>
  wrapper.findAll('[role=option]').map((o) => o.text())

describe('VendorPicker', () => {
  it('never renders more than ten results', async () => {
    const wrapper = mountPicker()
    await wrapper.get('input').trigger('focus')
    expect(options(wrapper)).toHaveLength(10)
  })

  it('ranks license IDs starting with the term before other matches', async () => {
    const wrapper = mountPicker()
    await wrapper.get('input').setValue('fl-12')
    const results = options(wrapper)
    expect(results[0]).toContain('fl-120')
    // The vendor whose name merely contains the term ranks behind all eleven license matches,
    // so the limit cuts it off
    expect(results.findIndex((r) => r.includes('xx-1'))).toBe(-1)
    await wrapper.get('input').setValue('maria')
    expect(options(wrapper)).toEqual(['xx-1 Maria fl-12er'])
  })

  it('emits the chosen vendor and null when cleared', async () => {
    const wrapper = mountPicker(5)
    expect((wrapper.get('input').element as HTMLInputElement).value).toBe('fl-104 – Name4 X')

    await wrapper.get('input').setValue('Josef')
    await wrapper.get('[role=option]').trigger('mousedown')
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([100])

    await wrapper.get('.vendor-picker-clear').trigger('mousedown')
    expect(wrapper.emitted('update:modelValue')?.[1]).toEqual([null])
  })

  it('picks the highlighted result with the keyboard', async () => {
    const wrapper = mountPicker()
    const input = wrapper.get('input')
    await input.setValue('fl-10')
    await input.trigger('keydown', { key: 'ArrowDown' })
    await input.trigger('keydown', { key: 'Enter' })
    expect(wrapper.emitted('update:modelValue')?.[0]).toEqual([2])
  })
})
