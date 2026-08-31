import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { VendorCsvRow } from '@/utils/vendorCsv'
import {
  buildVendorCsvTemplate,
  downloadVendorCsvTemplate,
  hasLocation,
  parseVendorsCsv,
  VENDOR_CSV_COLUMNS,
  VENDOR_CSV_TEMPLATE_FILENAME
} from '@/utils/vendorCsv'
// The sample file shipped for backoffice users — the test imports the real file so the two cannot
// drift apart.
import sampleCsv from '../../../Vendor_import.csv?raw'

// The backend answers a vendor creation with the new vendor id — locations and comments are hung
// off that id afterwards.
let lastVendorId = 0
const postVendors = vi.fn((_vendor: VendorCsvRow) => Promise.resolve({ data: ++lastVendorId }))

const checkVendorId = vi.fn((_licenseId: string) => Promise.resolve<{ name: string } | null>(null))

const postVendorLocation = vi.fn((_vendorId: number, _location: unknown) =>
  Promise.resolve({ data: {} })
)

const postVendorComment = vi.fn((_vendorId: number, _comment: unknown) =>
  Promise.resolve({ data: {} })
)

// The vendor store pulls in the axios/keycloak api layer and the router, neither of which we want
// to boot for a unit test — the import path we care about is parse -> createVendors -> postVendors.
vi.mock('@/api/api', () => ({
  postVendors,
  checkVendorId,
  getVendor: vi.fn(),
  fetchVendors: vi.fn(() => Promise.resolve({ data: [] })),
  patchVendor: vi.fn(),
  removeVendor: vi.fn(),
  getVendorMe: vi.fn(),
  patchVendorLocation: vi.fn(),
  postVendorLocation,
  deleteVendorLocation: vi.fn(),
  fetchVendorLocations: vi.fn(),
  fetchVendorComments: vi.fn(),
  postVendorComment,
  patchVendorComment: vi.fn(),
  deleteVendorComment: vi.fn(),
  recalculateVendorBalances: vi.fn()
}))

vi.mock('@/api/agent', () => ({ default: {} }))
vi.mock('@/router', () => ({ default: { push: vi.fn() } }))

const EMAIL_POSTFIX = '@augustin.or.at'

describe('parseVendorsCsv', () => {
  it('parses every data row of the shipped sample file', () => {
    const dataLines = sampleCsv
      .split('\n')
      .slice(1)
      .filter((line) => line.trim() !== '')

    const vendors = parseVendorsCsv(sampleCsv, EMAIL_POSTFIX)

    expect(dataLines.length).toBeGreaterThan(1)
    expect(vendors).toHaveLength(dataLines.length)
    expect(vendors.every((vendor) => vendor.LicenseID !== '')).toBe(true)
  })

  it('has a sample file matching the documented column order', () => {
    const header = sampleCsv.split('\n')[0]?.trim().split(';')

    expect(header).toEqual([...VENDOR_CSV_COLUMNS])
  })

  it('maps every column of a row onto the vendor payload', () => {
    const csv = [
      VENDOR_CSV_COLUMNS.join(';'),
      '1010;Billa Stephansplatz;Stephansplatz 4;16.3725;48.2082;G;A-201;Marija;Novak;' +
        '+436641234501;deutsch/kroatisch;2024-01-15;2024-01-15;Stammplatz am Vormittag;Ja;Ja;Ja;0'
    ].join('\n')

    expect(parseVendorsCsv(csv, EMAIL_POSTFIX)[0]).toEqual({
      PLZ: '1010',
      Location: 'Billa Stephansplatz',
      Address: 'Stephansplatz 4',
      Longitude: 16.3725,
      Latitude: 48.2082,
      WorkingTime: 'G',
      LicenseID: 'A-201',
      FirstName: 'Marija',
      LastName: 'Novak',
      Telephone: '+436641234501',
      Language: 'deutsch/kroatisch',
      RegistrationDate: '2024-01-15',
      VendorSince: '2024-01-15',
      Comment: 'Stammplatz am Vormittag',
      LastPayout: null,
      UrlID: '',
      OnlineMap: true,
      HasSmartphone: true,
      HasBankAccount: true,
      IsDisabled: false,
      Email: 'A-201@augustin.or.at',
      Debt: '0'
    })
  })

  it('derives the email from the license id and the configured postfix', () => {
    const vendors = parseVendorsCsv(sampleCsv, EMAIL_POSTFIX)

    for (const vendor of vendors) {
      expect(vendor.Email).toBe(`${vendor.LicenseID}${EMAIL_POSTFIX}`)
    }
  })

  it('keeps license ids unique so the import does not collide on emails', () => {
    const licenseIds = parseVendorsCsv(sampleCsv, EMAIL_POSTFIX).map((vendor) => vendor.LicenseID)

    expect(new Set(licenseIds).size).toBe(licenseIds.length)
  })

  it('falls back to defaults for empty coordinates and working time', () => {
    const csv = [
      VENDOR_CSV_COLUMNS.join(';'),
      '1050;Penny;Margaretenplatz 3;;;;A-205;Petra;Horvath;;deutsch;2024-03-18;2024-03-18;;Ja;Nein;Ja;0'
    ].join('\n')

    const vendor = parseVendorsCsv(csv, EMAIL_POSTFIX)[0]

    expect(vendor?.Longitude).toBe(0.1)
    expect(vendor?.Latitude).toBe(0.1)
    expect(vendor?.WorkingTime).toBe('G')
  })

  it('reads decimal commas as written by German Excel', () => {
    const csv = [
      VENDOR_CSV_COLUMNS.join(';'),
      '1030;Hofer;Landstraße 99;16,3947;48,1966;G;A-203;Erzsebet;Kovacs;;deutsch;2024-02-12;2024-02-12;;Nein;Ja;Nein;15,00'
    ].join('\n')

    const vendor = parseVendorsCsv(csv, EMAIL_POSTFIX)[0]

    expect(vendor?.Longitude).toBeCloseTo(16.3947)
    expect(vendor?.Latitude).toBeCloseTo(48.1966)
  })

  it('reads the yes/no columns in both languages and casing', () => {
    const row = (onlineMap: string, smartphone: string, bankAccount: string) =>
      `1010;Billa;Gasse 1;1;1;G;A-1;Test;Person;;deutsch;2024-01-01;2024-01-01;;${onlineMap};${smartphone};${bankAccount};0`

    const vendors = parseVendorsCsv(
      [
        VENDOR_CSV_COLUMNS.join(';'),
        row('Ja', 'ja', 'yes'),
        row('Nein', 'nein', 'no'),
        row('', '', '')
      ].join('\n'),
      EMAIL_POSTFIX
    )

    expect(vendors[0]).toMatchObject({ OnlineMap: true, HasSmartphone: true, HasBankAccount: true })

    expect(vendors[1]).toMatchObject({
      OnlineMap: false,
      HasSmartphone: false,
      HasBankAccount: false
    })

    expect(vendors[2]).toMatchObject({
      OnlineMap: false,
      HasSmartphone: false,
      HasBankAccount: false
    })
  })

  it('ignores the header, blank lines and rows without a license id', () => {
    const csv = [
      VENDOR_CSV_COLUMNS.join(';'),
      '1010;Billa;Gasse 1;1;1;G;A-1;Test;Person;;deutsch;2024-01-01;2024-01-01;;Ja;Ja;Ja;0',
      '',
      '1020;Spar;Gasse 2;1;1;G;;Ohne;Ausweis;;deutsch;2024-01-01;2024-01-01;;Ja;Ja;Ja;0',
      '   ',
      ''
    ].join('\n')

    const vendors = parseVendorsCsv(csv, EMAIL_POSTFIX)

    expect(vendors).toHaveLength(1)
    expect(vendors[0]?.LicenseID).toBe('A-1')
  })

  it('handles CRLF line endings and padded cells', () => {
    const csv =
      `${VENDOR_CSV_COLUMNS.join(';')}\r\n` +
      '1010; Billa ;Gasse 1;1;1;G; A-1 ; Test ; Person ;;deutsch;2024-01-01;2024-01-01;;Ja;Ja;Ja;0\r\n'

    const vendors = parseVendorsCsv(csv, EMAIL_POSTFIX)

    expect(vendors).toHaveLength(1)

    expect(vendors[0]).toMatchObject({
      Location: 'Billa',
      LicenseID: 'A-1',
      FirstName: 'Test',
      LastName: 'Person',
      Email: `A-1${EMAIL_POSTFIX}`,
      Debt: '0'
    })
  })
})

describe('the demo CSV offered for download', () => {
  it('can be imported again without losing a single vendor', () => {
    // The download carries a UTF-8 BOM for Excel — it must not turn up in the first vendor.
    expect(buildVendorCsvTemplate().startsWith('\ufeff')).toBe(true)

    expect(parseVendorsCsv(buildVendorCsvTemplate(), EMAIL_POSTFIX)).toEqual(
      parseVendorsCsv(sampleCsv, EMAIL_POSTFIX)
    )
  })

  it('is handed to the browser as a csv download', () => {
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const appendChild = vi.spyOn(document.body, 'appendChild')

    downloadVendorCsvTemplate()

    expect(click).toHaveBeenCalledOnce()

    const anchor = appendChild.mock.calls[0]?.[0] as HTMLAnchorElement

    expect(anchor.download).toBe(VENDOR_CSV_TEMPLATE_FILENAME)

    expect(decodeURIComponent(anchor.href.replace('data:text/csv;charset=utf-8,', ''))).toBe(
      buildVendorCsvTemplate()
    )

    // The anchor is a means to an end and must not linger in the DOM.
    expect(document.body.contains(anchor)).toBe(false)

    click.mockRestore()
    appendChild.mockRestore()
  })
})

describe('importing the sample file through the vendor store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    lastVendorId = 0
    postVendors.mockClear()
    postVendorLocation.mockClear()
    postVendorComment.mockClear()
    checkVendorId.mockClear()
    checkVendorId.mockImplementation(() => Promise.resolve(null))
  })

  it('creates every vendor of the sample file', async () => {
    const { vendorsStore } = await import('@/stores/vendor')
    const store = vendorsStore()
    const vendors = parseVendorsCsv(sampleCsv, EMAIL_POSTFIX)

    await store.createVendors(vendors)

    expect(postVendors).toHaveBeenCalledTimes(vendors.length)
    expect(store.vendorsImportedCount).toBe(vendors.length)

    const posted = postVendors.mock.calls.map(([vendor]) => vendor)
    expect(posted).toEqual(vendors)
  })

  it('skips vendors whose license id already exists', async () => {
    const { vendorsStore } = await import('@/stores/vendor')
    const store = vendorsStore()
    const vendors = parseVendorsCsv(sampleCsv, EMAIL_POSTFIX)
    const existing = vendors[0]?.LicenseID

    checkVendorId.mockImplementation((licenseId: string) =>
      Promise.resolve(licenseId === existing ? { name: 'Marija' } : null)
    )

    await store.createVendors(vendors)

    expect(postVendors).toHaveBeenCalledTimes(vendors.length - 1)
    expect(postVendors.mock.calls.map(([vendor]) => vendor.LicenseID)).not.toContain(existing)
  })

  it('creates the Standplatz of every vendor against the id it just got back', async () => {
    const { vendorsStore } = await import('@/stores/vendor')
    const store = vendorsStore()
    const vendors = parseVendorsCsv(sampleCsv, EMAIL_POSTFIX)

    await store.createVendors(vendors)

    // Every row of the sample names a Standplatz.
    expect(vendors.filter(hasLocation)).toHaveLength(vendors.length)
    expect(postVendorLocation).toHaveBeenCalledTimes(vendors.length)

    // Ids are handed out in order, so the nth location must belong to the nth vendor.
    expect(postVendorLocation.mock.calls.map(([vendorId]) => vendorId)).toEqual(
      vendors.map((_vendor, index) => index + 1)
    )

    expect(postVendorLocation.mock.calls[0]?.[1]).toEqual({
      id: 0,
      name: 'Billa Stephansplatz',
      address: 'Stephansplatz 4',
      zip: '1010',
      longitude: 16.3725,
      latitude: 48.2082,
      working_time: {
        mode: 'by_day',
        week_days: {
          mon: [{ from: '08:00', to: '12:00' }],
          tue: [{ from: '08:00', to: '12:00' }],
          wed: [{ from: '08:00', to: '12:00' }],
          thu: [{ from: '08:00', to: '12:00' }],
          fri: [{ from: '08:00', to: '12:00' }]
        }
      }
    })
  })

  it('turns every written working time of the sample into a structured one', async () => {
    const { vendorsStore } = await import('@/stores/vendor')
    const store = vendorsStore()
    const vendors = parseVendorsCsv(sampleCsv, EMAIL_POSTFIX)

    await store.createVendors(vendors)

    const workingTimeOf = (written: string) => {
      const index = vendors.findIndex((vendor) => vendor.WorkingTime === written)

      expect(index, `sample has no row with working time "${written}"`).toBeGreaterThan(-1)

      return (postVendorLocation.mock.calls[index]?.[1] as { working_time: unknown }).working_time
    }

    // The sample covers every accepted spelling on purpose.
    expect(workingTimeOf('Di,Do 09:00-13:00')).toEqual({
      mode: 'by_day',
      week_days: {
        tue: [{ from: '09:00', to: '13:00' }],
        thu: [{ from: '09:00', to: '13:00' }]
      }
    })

    expect(workingTimeOf('09:00-17:00')).toEqual({
      mode: 'everyday',
      everyday: [{ from: '09:00', to: '17:00' }]
    })

    expect(workingTimeOf('Mo-So')).toEqual({ mode: 'whole_week', whole_week: true })
    expect(workingTimeOf('G')).toEqual({ mode: 'whole_week', whole_week: true })

    // None of them may reach the backend as plain text.
    for (const [, location] of postVendorLocation.mock.calls) {
      expect(typeof (location as { working_time: unknown }).working_time).toBe('object')
    }
  })

  it('creates a comment only for the rows that carry one', async () => {
    const { vendorsStore } = await import('@/stores/vendor')
    const store = vendorsStore()
    const vendors = parseVendorsCsv(sampleCsv, EMAIL_POSTFIX)
    const commented = vendors.filter((vendor) => vendor.Comment !== '')

    await store.createVendors(vendors)

    // The sample deliberately leaves some comments empty — those must not create an empty comment.
    expect(commented.length).toBeLessThan(vendors.length)
    expect(postVendorComment).toHaveBeenCalledTimes(commented.length)

    expect(postVendorComment.mock.calls[0]?.[1]).toEqual({
      comment: 'Stammplatz am Vormittag',
      warning: false
    })
  })

  it('leaves locations and comments alone for vendors that already exist', async () => {
    const { vendorsStore } = await import('@/stores/vendor')
    const store = vendorsStore()
    const vendors = parseVendorsCsv(sampleCsv, EMAIL_POSTFIX)

    checkVendorId.mockImplementation(() => Promise.resolve({ name: 'schon da' }))

    await store.createVendors(vendors)

    expect(postVendors).not.toHaveBeenCalled()
    expect(postVendorLocation).not.toHaveBeenCalled()
    expect(postVendorComment).not.toHaveBeenCalled()
  })

  it('imports a row without Standplatz and comment as a plain vendor', async () => {
    const { vendorsStore } = await import('@/stores/vendor')
    const store = vendorsStore()

    const csv = [
      VENDOR_CSV_COLUMNS.join(';'),
      ';;;;;;A-1;Test;Person;;deutsch;2024-01-01;2024-01-01;;Nein;Nein;Nein;0'
    ].join('\n')

    await store.createVendors(parseVendorsCsv(csv, EMAIL_POSTFIX))

    expect(postVendors).toHaveBeenCalledOnce()
    expect(postVendorLocation).not.toHaveBeenCalled()
    expect(postVendorComment).not.toHaveBeenCalled()
  })

  it('keeps importing the remaining vendors when a Standplatz cannot be created', async () => {
    const { vendorsStore } = await import('@/stores/vendor')
    const store = vendorsStore()
    const vendors = parseVendorsCsv(sampleCsv, EMAIL_POSTFIX)
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    postVendorLocation.mockRejectedValueOnce(new Error('location endpoint down'))

    await store.createVendors(vendors)

    expect(postVendors).toHaveBeenCalledTimes(vendors.length)
    expect(postVendorLocation).toHaveBeenCalledTimes(vendors.length)
    expect(consoleError).toHaveBeenCalled()

    consoleError.mockRestore()
  })
})
