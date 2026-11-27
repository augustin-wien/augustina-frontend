import { describe, expect, it } from 'vitest'
import AddressModal from '@/components/AddressModal.vue'
import CommentsModal from '@/components/CommentsModal.vue'
import VendorInfo from '@/components/VendorInfo.vue'
import VendorMapView from '@/components/VendorMapView.vue'
import { on } from '@/__tests__/support/backend'
import * as f from '@/__tests__/support/fixtures'
import { mountComponent, settle } from '@/__tests__/support/mount'
import { vendorsStore, type VendorLocation } from '@/stores/vendor'
import { useSettingsStore } from '@/stores/settings'
import type { VueWrapper } from '@vue/test-utils'

const lastUpdate = (wrapper: VueWrapper) =>
  (wrapper.emitted('update')!.slice(-1)[0] as [VendorLocation])[0]

const save = async (wrapper: VueWrapper) => {
  await wrapper.findAll('button').slice(-1)[0]!.trigger('click')
  return lastUpdate(wrapper)
}

describe('AddressModal', () => {
  it('creates a new location at the map center with everyday hours', async () => {
    const { wrapper } = await mountComponent(AddressModal, {
      before: () => {
        useSettingsStore().settings.MapCenterLat = 48.2
        useSettingsStore().settings.MapCenterLong = 16.37
      }
    })

    await wrapper.get('#name').setValue('Hofer')
    await wrapper.get('#adress').setValue('Hauptstraße 2')
    await wrapper.get('#plz').setValue('1010')
    const location = await save(wrapper)

    expect(location).toMatchObject({
      id: 0,
      name: 'Hofer',
      zip: '1010',
      latitude: 48.2,
      longitude: 16.37
    })

    expect(wrapper.text()).toContain('New location')
  })

  it('edits a location and switches between the working time modes', async () => {
    const { wrapper } = await mountComponent(AddressModal, {
      props: { locations: [f.vendorLocation({ working_time: 'v' })] }
    })

    const mode = wrapper.get('#workingTime')

    await mode.setValue('by_day')
    const closed = wrapper.findAll('.working-time-day input[type="checkbox"]')[0]
    await closed.setValue(true)
    await closed.trigger('change')

    expect(
      ((await save(wrapper)).working_time as { week_days: Record<string, unknown[]> }).week_days.mon
    ).toEqual([])

    await closed.setValue(false)
    await closed.trigger('change')

    await mode.setValue('whole_week')
    expect((await save(wrapper)).working_time).toEqual({ mode: 'whole_week', whole_week: true })

    await mode.setValue('everyday')
    const everydayClosed = wrapper.get('.working-time-panel input[type="checkbox"]')
    await everydayClosed.setValue(true)
    await everydayClosed.trigger('change')
    expect((await save(wrapper)).working_time).toMatchObject({ mode: 'everyday', everyday: [] })

    await everydayClosed.setValue(false)
    await everydayClosed.trigger('change')

    expect((await save(wrapper)).working_time).toMatchObject({
      everyday: [{ from: '09:00', to: '17:00' }]
    })
  })

  it('takes the position from the map search and from moving the marker', async () => {
    const { wrapper } = await mountComponent(AddressModal, {
      props: { vendor: f.vendor(), locations: [f.vendorLocation()] }
    })

    const map = wrapper.findComponent(VendorMapView)
    map.vm.$emit('new-location', { location: { x: 16.1, y: 48.1, label: 'Gefunden 1' } })
    map.vm.$emit('edit-marker', { lat: 48.3, lng: 16.3 })
    await settle()

    expect(await save(wrapper)).toMatchObject({
      address: 'Gefunden 1',
      latitude: 48.3,
      longitude: 16.3
    })

    expect(wrapper.text()).toContain('AUG-1 Anna')
  })

  it('lets you pick the vendor of a location and closes on cancel', async () => {
    const { wrapper } = await mountComponent(AddressModal, {
      props: { vendors: f.vendors(), locations: [f.vendorLocation({ vendorID: 1 })] }
    })

    expect(wrapper.find('#location-vendor').exists()).toBe(true)

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')!
      .trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})

describe('CommentsModal', () => {
  it('saves a changed comment with its resolution date', async () => {
    const { wrapper } = await mountComponent(CommentsModal, {
      props: {
        vendor: f.vendor(),
        comment: f.vendorComment({ resolved_at: new Date('2026-10-05T00:00:00Z') })
      }
    })

    expect((wrapper.get('#comment-resolved').element as HTMLInputElement).value).toBe('2026-10-05')

    await wrapper.get('#comment-text').setValue('erledigt')
    await wrapper.get('#comment-resolved').setValue('2026-10-06')
    await wrapper.findAll('button').slice(-1)[0]!.trigger('click')

    const [comment] = wrapper.emitted('update')![0] as [{ comment: string; resolved_at: Date }]
    expect(comment.comment).toBe('erledigt')
    expect(comment.resolved_at.toISOString()).toMatch(/^2026-10-06/)
  })

  it('ignores the zero date of an open comment and closes on cancel', async () => {
    const { wrapper } = await mountComponent(CommentsModal, {
      props: {
        vendor: f.vendor(),
        comment: f.vendorComment({ resolved_at: new Date('0001-01-01T00:00:00Z') })
      }
    })

    expect((wrapper.get('#comment-resolved').element as HTMLInputElement).value).toBe('')

    await wrapper
      .findAll('button')
      .find((b) => b.text() === 'Cancel')!
      .trigger('click')

    expect(wrapper.emitted('close')).toBeTruthy()
  })
})

describe('VendorInfo', () => {
  const workingTimes: VendorLocation['working_time'][] = [
    'v',
    'n',
    'g',
    'irgendwann',
    { mode: 'whole_week', whole_week: true },
    { mode: 'everyday', everyday: [] },
    { mode: 'everyday', everyday: [{ full_day: true }, { from: '08:00', to: '10:00' }, {}] },
    { mode: 'by_day', week_days: { mon: [{ from: '08:00', to: '10:00' }], tue: [] } },
    { mode: 'other' },
    {}
  ]

  it('shows the vendor with locations, working times and comments', async () => {
    on(
      'get',
      /api\/vendors\/1\/locations\/$/,
      workingTimes.map((working_time, id) => f.vendorLocation({ id, working_time }))
    )

    on('get', /api\/vendors\/1\/comments\/$/, [
      f.vendorComment({ warning: true }),
      f.vendorComment({ id: 2, resolved_at: new Date('2026-10-05T00:00:00Z') as never })
    ])

    const { wrapper } = await mountComponent(VendorInfo, {
      before: () => {
        vendorsStore().vendor = f.vendor({
          IsBlocked: true,
          BlockedNote: 'Hausverbot',
          LastIDScan: '2026-10-01T10:00:00Z'
        })

        useSettingsStore().settings.IDScanEnabled = true
      }
    })

    const text = wrapper.text()
    expect(text).toContain('Hausverbot')
    expect(text).toContain('08:00 - 12:00')
    expect(text).toContain('13:00 - 17:00')
    expect(text).toContain('08:00 - 10:00')
    expect(text).toContain('irgendwann')
    expect(text).toContain('Ausweis erneuert')

    await wrapper.findAll('button')[0].trigger('click')
    expect(wrapper.emitted('close')).toBeTruthy()
  })

  it('shows dashes for missing dates', async () => {
    const { wrapper } = await mountComponent(VendorInfo, {
      before: () => {
        vendorsStore().vendor = f.vendor({
          RegistrationDate: '0001-01-01',
          VendorSince: 'kaputt',
          LastPayout: null,
          LastOnlineSale: 'kaputt',
          Debt: '',
          AccountProofUrl: null
        })
      }
    })

    expect(wrapper.text()).toContain('–')
  })
})
