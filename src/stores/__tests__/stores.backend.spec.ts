import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fail, installBackend, on, requested, requests } from '@/__tests__/support/backend'
import * as f from '@/__tests__/support/fixtures'
import { vendorsStore, type Vendor } from '@/stores/vendor'
import { useShopStore } from '@/stores/ShopStore'
import { useMailTemplatesStore } from '@/stores/mailTemplates'
import { useCustomerStore } from '@/stores/customer'
import { useItemsStore } from '@/stores/items'
import { useStatisticsStore } from '@/stores/statistics'
import { useMapStore } from '@/stores/map'
import { usePayoutStore } from '@/stores/payout'
import { usePaymentsStore } from '@/stores/payments'
import { useOrdersStore } from '@/stores/orders'
import { usePDFDownloadStore } from '@/stores/pdfDownload'
import { useCampaignsStore, campaignStatus, toCampaignInput } from '@/stores/campaigns'
import { useKeycloakStore } from '@/stores/keycloak'
import { useSettingsStore, vouchersEnabled } from '@/stores/settings'
import type { VendorCsvRow } from '@/utils/vendorCsv'

const from = new Date('2026-10-01T00:00:00Z')
const to = new Date('2026-10-31T00:00:00Z')

let log: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  setActivePinia(createPinia())
  installBackend()
  log = vi.spyOn(console, 'log').mockImplementation(() => {})
  vi.spyOn(console, 'error').mockImplementation(() => {})
})

const csvRow = (overrides: Partial<VendorCsvRow> = {}): VendorCsvRow => ({
  PLZ: '1020',
  Location: 'Billa',
  Address: 'Praterstraße 1',
  Longitude: 16.38,
  Latitude: 48.21,
  WorkingTime: '',
  LicenseID: 'AUG-9',
  FirstName: 'Neu',
  LastName: 'Verkäufer',
  Telephone: '',
  Language: 'de',
  RegistrationDate: '',
  VendorSince: '',
  Comment: 'Importiert',
  LastPayout: null,
  UrlID: '',
  OnlineMap: false,
  HasSmartphone: false,
  HasBankAccount: false,
  IsDisabled: false,
  Email: '',
  Debt: '',
  LocationTelephone: '',
  ...overrides
})

describe('vendorsStore', () => {
  it('loads and searches vendors by name, email and license id', async () => {
    const store = vendorsStore()
    await store.getVendors()

    expect(store.getvendors).toHaveLength(3)

    await store.searchVendors('bernd')
    expect(store.filteredVendors.map((v) => v.ID)).toEqual([2])

    await store.searchVendors('AUG-3')
    expect(store.filteredVendors.map((v) => v.ID)).toEqual([3])

    await store.searchVendors('')
    expect(store.filteredVendors).toHaveLength(3)
  })

  it('keeps the old list when loading fails', async () => {
    fail('get', /api\/vendors\/$/)
    const store = vendorsStore()
    await store.getVendors()

    expect(store.vendors).toEqual([])
  })

  it('takes the recalculated balances, or reloads when recalculating fails', async () => {
    const store = vendorsStore()
    on('post', /recalculate-balances/, [f.vendor({ Balance: 99 })])
    await store.recalculateBalances()
    expect(store.vendors[0].Balance).toBe(99)

    fail('post', /recalculate-balances/)
    await store.recalculateBalances()
    expect(store.vendors).toHaveLength(3)
  })

  it('saves new and existing locations and reloads the list', async () => {
    const store = vendorsStore()

    await store.saveLocation(f.vendorLocation({ id: 0, vendorID: undefined }))
    await store.saveLocation(f.vendorLocation({ id: 5, vendorID: 1 }))
    await store.removeLocation(5)

    expect(requested('post', /api\/locations\/$/)[0].data).toMatchObject({ vendorID: null })
    expect(requested('patch', /api\/locations\/5\/$/)).toHaveLength(1)
    expect(requested('delete', /api\/locations\/5\/$/)).toHaveLength(1)
    expect(store.allLocations).toHaveLength(2)
  })

  it('creates a vendor and reloads the list', async () => {
    const store = vendorsStore()
    await store.createVendor(f.vendor())
    await new Promise((r) => setTimeout(r, 0))

    expect(requested('post', /api\/vendors\/$/)).toHaveLength(1)
    expect(requested('get', /api\/vendors\/$/)).toHaveLength(1)
  })

  it('imports only vendors that do not exist yet, with their location and comment', async () => {
    on('get', /api\/vendors\/check\/AUG-1\//, { FirstName: 'Anna' })
    on('get', /api\/vendors\/check\/AUG-9\//, 'unknown', 404)
    on('post', /api\/vendors\/$/, 42)

    const store = vendorsStore()
    await store.createVendors([csvRow({ LicenseID: 'AUG-1' }), csvRow()])

    expect(store.vendorsImportedCount).toBe(2)
    expect(requested('post', /api\/vendors\/$/)).toHaveLength(1)
    expect(requested('post', /api\/vendors\/42\/locations\/$/)).toHaveLength(1)
    expect(requested('post', /api\/vendors\/42\/comments\/$/)).toHaveLength(1)
  })

  it('stops the import at a row without license id', async () => {
    const store = vendorsStore()

    expect(await store.createVendors([csvRow({ LicenseID: '' }), csvRow()])).toBeNull()
    expect(requests).toHaveLength(0)
  })

  it('skips details without a vendor id and survives failing details', async () => {
    const store = vendorsStore()
    await store.createImportedVendorDetails(undefined, csvRow())
    expect(requests).toHaveLength(0)

    fail('post', /locations\/$/)
    fail('post', /comments\/$/)
    await store.createImportedVendorDetails(7, csvRow())
    expect(requests).toHaveLength(2)

    await store.createImportedVendorDetails(
      7,
      csvRow({ Location: '', Address: '', PLZ: '', Comment: '' })
    )

    expect(requests).toHaveLength(2)
  })

  it('updates and deletes a vendor', async () => {
    const store = vendorsStore()

    expect(await store.updateVendor(f.vendor(), 'keep')).toBeUndefined()
    await store.deleteVendor(1, 'delete')

    fail('put', /api\/vendors\/1\/$/)
    expect(await store.updateVendor(f.vendor())).toBeInstanceOf(Error)
    expect(requested('delete', /api\/vendors\/1\/$/)[0].params).toEqual({ locations: 'delete' })
  })

  it('loads a single vendor and the own vendor', async () => {
    const store = vendorsStore()

    expect((await store.getVendor(1))?.LicenseID).toBe('AUG-1')
    store.vendor = null
    await store.fetchVendorMe()
    await new Promise((r) => setTimeout(r, 0))
    expect((store.vendor as Vendor | null)?.FirstName).toBe('Anna')

    fail('get', /api\/vendors\/1\/$/)
    expect(await store.getVendor(1)).toBeUndefined()
  })

  it('manages the locations of a vendor', async () => {
    const store = vendorsStore()

    await store.createVendorLocation(f.vendorLocation(), 1)
    await store.updateVendorLocation(f.vendorLocation({ id: 3 }), 1)
    await store.deleteVendorLocation(1, 3)
    await store.getVendorLocations(1)

    expect(store.vendorLocations).toHaveLength(1)
    expect(requested('patch', /locations\/3\/$/)).toHaveLength(1)

    fail('post', /locations\/$/)
    fail('patch', /locations\//)
    fail('delete', /locations\//)
    fail('get', /locations\/$/)
    expect(await store.createVendorLocation(f.vendorLocation(), 1)).toBeInstanceOf(Error)
    expect(await store.updateVendorLocation(f.vendorLocation(), 1)).toBeInstanceOf(Error)
    expect(await store.deleteVendorLocation(1, 3)).toBeInstanceOf(Error)
    expect(await store.getVendorLocations(1)).toBeInstanceOf(Error)
  })

  it('manages the comments of a vendor', async () => {
    const store = vendorsStore()

    await store.getVendorComments(1)
    await store.createVendorComment({ comment: 'neu' }, 1)
    await store.updateVendorComment(f.vendorComment({ id: 4 }), 1)
    await store.deleteVendorComment(1, 4)

    expect(store.vendorComments).toHaveLength(1)

    fail('get', /comments\/$/)
    fail('post', /comments\/$/)
    fail('patch', /comments\//)
    fail('delete', /comments\//)
    expect(await store.getVendorComments(1)).toBeInstanceOf(Error)
    expect(await store.createVendorComment({ comment: 'neu' }, 1)).toBeInstanceOf(Error)
    expect(await store.updateVendorComment(f.vendorComment(), 1)).toBeInstanceOf(Error)
    expect(await store.deleteVendorComment(1, 4)).toBeInstanceOf(Error)
  })
})

describe('useShopStore', () => {
  it('loads the items once and shares the request', async () => {
    const store = useShopStore()
    const [a, b] = await Promise.all([store.getItems(), store.getItems()])

    expect(a).toBe(b)
    await store.getItems()
    expect(requested('get', /api\/items\/$/)).toHaveLength(1)
  })

  it('allows a retry after the items failed to load', async () => {
    fail('get', /api\/items\/$/)
    const store = useShopStore()

    await expect(store.getItems()).rejects.toBeTruthy()
    expect(store.itemsPromise).toBeNull()
  })

  it('keeps the cart: add, subtract, sum and names', async () => {
    const store = useShopStore()
    await store.getItems()

    store.addItem(1)
    store.addItem(1)
    store.addItem(6)
    store.addItem(999)
    store.subtractItem(6)
    store.subtractItem(6)
    store.subtractItem(999)

    expect(store.getAmount(1)).toBe(2)
    expect(store.getAmount(6)).toBe(0)
    expect(store.getAmount(42)).toBe(0)
    expect(store.calculateSum()).toBe(8)
    expect(store.getName(6)).toBe('Kalender')
    expect(store.getName(999)).toBe('Spende')
    expect(store.getPriceInEuro(6)).toBe(10)
    expect(store.getPriceInEuro(999)).toBe(0)
    expect(store.getItemType(2)).toBe('donation')
    expect(store.getItemType(6)).toBe('normal_item')
    expect(store.getItembyId(6).Name).toBe('Kalender')
    expect(store.getItembyId(999).ID).toBe(0)

    store.reset()
    expect(store.amount).toEqual([])
  })

  it('handles the donation', async () => {
    const store = useShopStore()
    await store.getItems()

    expect(store.donation).toBeUndefined()
    expect(store.donationInEuro).toBe(0)

    store.setDonation(250.7)
    store.incrementDonation()
    expect(store.donation).toBe(350)
    expect(store.donationInEuro).toBe(3.5)

    store.decrementDonation()
    store.addItem(1)
    expect(store.calculateSum()).toBe(4 + 2.5)

    store.setDonation(0)
    store.deleteZeroDonation()
    expect(store.donation).toBeUndefined()
  })
})

describe('useMailTemplatesStore', () => {
  it('lists, selects, saves and deletes templates', async () => {
    on('get', /api\/mail-templates\/$/, [
      { ID: 1, Name: 'welcome', Subject: 'Hallo', Body: 'Text' }
    ])

    on('get', /api\/mail-templates\/welcome\/$/, {
      Name: 'welcome',
      Subject: 'Hallo',
      Body: 'Text'
    })

    const store = useMailTemplatesStore()

    await store.loadList()
    expect(store.templates).toHaveLength(1)

    await store.selectTemplate('welcome')
    expect(store.current).toEqual({ name: 'welcome', subject: 'Hallo', body: 'Text' })

    store.current.subject = 'Neu'
    await store.saveTemplate()

    expect(JSON.parse(requested('post', /mail-templates\/$/)[0].data as string)).toEqual({
      Name: 'welcome',
      Subject: 'Neu',
      Body: 'Text'
    })

    expect(store.current.subject).toBe('Hallo')

    await store.deleteTemplate('welcome')
    expect(store.current.name).toBe('')
    expect(store.loading).toBe(false)
  })

  it('fills missing fields of a selected template', async () => {
    on('get', /api\/mail-templates\/x\/$/, {})
    const store = useMailTemplatesStore()

    await store.selectTemplate('x')
    expect(store.current).toEqual({ name: 'x', subject: '', body: '' })
  })

  it('sends a test mail with recipients and data only when given', async () => {
    const store = useMailTemplatesStore()

    await store.sendTemplate('welcome', ['a@example.org'], { Name: 'A' })
    await store.sendTemplate('welcome')

    const sent = requested('post', /welcome\/send\/$/).map((r) => JSON.parse(r.data as string))
    expect(sent).toEqual([{ to: ['a@example.org'], data: { Name: 'A' } }, {}])
  })
})

describe('useCustomerStore', () => {
  it('manages customers and their abonements', async () => {
    on('get', /api\/abonements\/active\/$/, [{ customer: f.customer({ id: 2 }) }])
    on('post', /api\/customers\/$/, f.customer({ id: 3 }))
    on('put', /api\/customers\/1\/$/, f.customer({ firstname: 'Neu' }))
    on('post', /api\/abonements\/$/, f.abonement({ id: 9 }))
    on('put', /api\/abonements\/9\/$/, f.abonement({ id: 9, status: 'ended' }))
    const store = useCustomerStore()

    await store.getCustomers()
    await store.getCustomerById(1)
    await store.getAbonementsByCustomer(1)
    await store.getActiveCustomerIds()

    expect(store.customers).toHaveLength(2)
    expect(store.customer?.email).toBe('kunde@example.org')
    expect(store.abonements).toHaveLength(1)
    expect([...store.activeCustomerIds]).toEqual([2])

    expect((await store.createCustomer({ email: 'x' })).id).toBe(3)
    expect((await store.updateCustomer(1, {})).firstname).toBe('Neu')
    await store.deleteCustomer(1)
    expect((await store.createAbonement({})).id).toBe(9)
    expect((await store.updateAbonement(9, {})).status).toBe('ended')
    await store.deleteAbonement(9)

    expect(requested('delete', /api\/abonements\/9\/$/)).toHaveLength(1)
  })

  it('keeps going when loading fails', async () => {
    fail('get', /api\/customers\//)
    fail('get', /api\/abonements\//)
    const store = useCustomerStore()

    await store.getCustomers()
    await store.getCustomerById(1)
    await store.getAbonementsByCustomer(1)
    await store.getActiveCustomerIds()

    expect(store.customers).toEqual([])
    expect(store.abonements).toEqual([])
  })
})

describe('useItemsStore', () => {
  it('loads the item lists and changes items', async () => {
    on('post', /notify-abonements/, { recipients: 4, alreadyMailed: 1 })
    const store = useItemsStore()

    await store.getItems()
    await store.getItemsBackoffice()
    await store.getItemsWithArchived()
    await store.getArchivedItems()
    await store.restoreItem(1)
    await store.createItem(f.item() as never)
    await store.updateItem(f.item() as never)
    await store.deleteItem(1, true)

    expect(store.getitems).toHaveLength(7)
    expect(store.itemsWithArchived).toHaveLength(7)
    expect(await store.notifyAbonements(4)).toEqual({ recipients: 4, alreadyMailed: 1 })

    on('post', /notify-abonements/, {})
    expect(await store.notifyAbonements(4)).toEqual({ recipients: 0, alreadyMailed: 0 })
  })

  it('logs failures to load', async () => {
    fail('get', /api\/items\//)
    const store = useItemsStore()

    await store.getItems()
    await store.getItemsBackoffice()
    await store.getItemsWithArchived()
    await store.getArchivedItems()

    expect(store.items).toEqual([])
    expect(log).toHaveBeenCalledTimes(4)
  })
})

describe('small stores', () => {
  it('statistics loads payments, orders and vendor usage', async () => {
    const store = useStatisticsStore()
    await store.getPayments(from, to)
    await store.getOrderStatistics(from, to)
    await store.getVendorUsage(from, to)

    expect(store.statisticsList).toHaveLength(3)
    expect(store.days).toHaveLength(3)
    expect(store.topVendors).toHaveLength(1)
    expect(store.orderStatistics?.Completed).toBe(7)
    expect(store.vendorUsageStats?.UsedVendors).toBe(1)

    fail('get', /statistics/)
    await store.getPayments(from, to)
    await store.getOrderStatistics(from, to)
    await store.getVendorUsage(from, to)
    expect(log).toHaveBeenCalledTimes(3)
  })

  it('map keeps only located vendors', async () => {
    vi.useFakeTimers()

    on('get', /api\/map\/$/, [
      { id: 1, latitude: 48, longitude: 16 },
      { id: 2, latitude: 0, longitude: 0 }
    ])

    const store = useMapStore()
    const done = store.getLocations()
    await vi.advanceTimersByTimeAsync(500)
    await done

    expect(store.vendors.map((v) => v.id)).toEqual([1])

    on('get', /api\/map\/$/, null)
    const empty = store.getLocations()
    await vi.advanceTimersByTimeAsync(500)
    await empty
    expect(store.vendors).toEqual([])
    vi.useRealTimers()
  })

  it('payout posts a payout and loads payments for it', async () => {
    on('post', /payout\/$/, { VendorLicenseID: 'AUG-1' })
    const store = usePayoutStore()

    await store.postPayout({ From: null, To: null, VendorLicenseID: 'AUG-1' })
    await store.getPaymentsForPayout('AUG-1')

    expect(store.payout.VendorLicenseID).toBe('AUG-1')
    expect(store.paymentsForPayout.balance).toBe(800)

    fail('post', /payout\/$/)
    fail('get', /forpayout/)

    await expect(
      store.postPayout({ From: null, To: null, VendorLicenseID: 'x' })
    ).rejects.toBeTruthy()

    await store.getPaymentsForPayout('AUG-1')
    expect(store.paymentsForPayout).toEqual({})
  })

  it('payments loads payments, payouts and sales', async () => {
    const store = usePaymentsStore()
    await store.getPayments(from, to)
    await store.getPayouts(from, to)
    await store.getSales(from, to)

    expect(store.paymentsList).toHaveLength(2)

    expect(requests.map((r) => r.url.split('&').pop())).toEqual([
      'to=2026-10-31T00:00:00.000Z',
      'payouts=true',
      'sales=true'
    ])

    fail('get', /api\/payments\//)
    await store.getPayments(from, to)
    await store.getPayouts(from, to)
    await store.getSales(from, to)
    expect(log).toHaveBeenCalledTimes(3)
  })

  it('orders verifies payments, adds transaction ids and resends webhooks', async () => {
    vi.useFakeTimers()
    const store = useOrdersStore()

    for (const action of [
      () => store.verifyAdminPayment('123'),
      () => store.addTransactionID('123', 't'),
      () => store.resendOdooWebhook(1)
    ]) {
      const done = action()
      await vi.advanceTimersByTimeAsync(100)
      await done
    }

    expect(store.unverifiedOrders).toHaveLength(1)
    expect(requested('get', /unverified\/$/)).toHaveLength(3)

    fail('get', /unverified\//)
    fail('post', /./)
    await store.getUnverifiedOrders()

    for (const action of [
      () => store.verifyAdminPayment('123'),
      () => store.addTransactionID('123', 't'),
      () => store.resendOdooWebhook(1)
    ]) {
      const done = action().catch((e) => e)
      await vi.advanceTimersByTimeAsync(100)
      expect(await done).toBeInstanceOf(Error)
    }

    vi.useRealTimers()
  })

  it('pdf download validates the link and opens it', async () => {
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const store = usePDFDownloadStore()

    await store.validatePDFDownload('abc')
    await store.downloadPDF('abc')
    expect(store.pdfDownload).toEqual({ valid: true })

    fail('get', /api\/pdf\//)
    await expect(store.validatePDFDownload('abc')).rejects.toBeTruthy()
  })

  it('campaigns are listed, changed and tracked', async () => {
    on('put', /api\/campaigns\/1\/$/, f.campaign({ title: 'Neu' }))
    const store = useCampaignsStore()

    await store.getCampaigns()
    await store.updateCampaign(1, toCampaignInput(store.campaigns[0]))
    await store.updateCampaign(99, toCampaignInput(store.campaigns[0]))
    expect(store.campaigns[0].title).toBe('Neu')

    await store.createCampaign(toCampaignInput(f.campaign()))
    await store.removeCampaign(1)
    expect(store.campaigns.map((c) => c.id)).toEqual([2])

    fail('post', /click/)
    store.track(1, 'click')
    await new Promise((r) => setTimeout(r, 0))
    expect(requested('post', /api\/campaigns\/1\/click\/$/)).toHaveLength(1)
  })

  it.each([
    [{ enabled: false }, 'off'],
    [{ starts_at: '2099-01-01T00:00:00Z' }, 'scheduled'],
    [{ ends_at: '2020-01-01T00:00:00Z' }, 'ended'],
    [{ starts_at: null, ends_at: null }, 'running']
  ])('campaignStatus of %o is %s', (overrides, status) => {
    expect(campaignStatus(f.campaign(overrides))).toBe(status)
  })

  it('keycloak keeps authentication and user name', () => {
    const store = useKeycloakStore()
    store.setAuthenticated(true)
    store.setUsername('anna')

    expect(store.isAuthenticated).toBe(true)
    expect(store.getUsername).toBe('anna')
  })
})

describe('useSettingsStore', () => {
  it('loads the public settings once', async () => {
    const store = useSettingsStore()
    await Promise.all([store.getSettingsFromApi(), store.getSettingsFromApi()])
    await store.getSettingsFromApi()

    expect(store.getSettings.MainItemName).toBe('Zeitung')
    expect(store.settings.Keycloak?.Realm).toBe('augustin')
    expect(requested('get', /api\/settings\/$/)).toHaveLength(1)
  })

  it('loads the admin settings and reports failure', async () => {
    const store = useSettingsStore()

    expect(await store.getAdminSettingsFromApi()).toBe(true)
    expect(store.settings.SecretsSet).toEqual({ NextcloudAppPassword: true })

    fail('get', /admin\/$/)
    expect(await store.getAdminSettingsFromApi()).toBe(false)
  })

  it('saves the settings and reloads public and admin settings', async () => {
    const store = useSettingsStore()
    await store.updateSettings(f.settings() as never)

    expect(requested('put', /api\/settings\/$/)).toHaveLength(1)
    expect(requested('get', /api\/settings\/$/)).toHaveLength(1)
    expect(requested('get', /admin\/$/)).toHaveLength(1)

    fail('put', /api\/settings\/$/)
    await store.updateSettings(f.settings() as never)
    expect(log).toHaveBeenCalled()
  })

  it('saves and loads the custom css only when it changed', async () => {
    const store = useSettingsStore()

    await store.getStyleCss()
    await new Promise((r) => setTimeout(r, 0))
    expect(store.styles).toBe('body { color: red }')

    await store.updateStyleCss('a {}')
    await store.getStyleCss()
    expect(store.styles).toBe('a {}')
    expect(requested('get', /style\.css/)).toHaveLength(1)
  })

  it('opens only http links from the settings, without opener', () => {
    const open = vi.spyOn(window, 'open').mockImplementation(() => null)
    const store = useSettingsStore()
    store.settings.AGBUrl = 'https://example.org/agb'
    store.settings.PrivacyPolicyUrl = 'javascript:alert(1)'

    store.toAGB()
    store.toPrivacyPolicy()
    store.openExternalUrl('')
    store.openExternalUrl('http://[')

    expect(open).toHaveBeenCalledTimes(1)
    expect(open).toHaveBeenCalledWith('https://example.org/agb', '_blank', 'noopener,noreferrer')
  })

  it('enables vouchers only together with abonements', () => {
    expect(vouchersEnabled({ AbonementEnabled: true, VoucherEnabled: true })).toBe(true)
    expect(vouchersEnabled({ AbonementEnabled: false, VoucherEnabled: true })).toBe(false)
    expect(vouchersEnabled({ AbonementEnabled: true })).toBe(false)
  })
})
