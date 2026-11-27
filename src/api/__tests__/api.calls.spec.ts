import { beforeEach, describe, expect, it, vi } from 'vitest'
import * as api from '@/api/api'
import agent from '@/api/agent'
import { installBackend, on, requests } from '@/__tests__/support/backend'
import * as f from '@/__tests__/support/fixtures'
import type { Settings } from '@/stores/settings'

const from = new Date('2026-10-01T00:00:00Z')
const to = new Date('2026-10-31T00:00:00Z')

type Call = [string, () => Promise<unknown>, string, RegExp]

const calls: Call[] = [
  [
    'sendFeedback',
    () =>
      api.sendFeedback({
        Message: 'hi',
        TransactionID: '',
        RequestID: '',
        VendorID: '',
        Page: '/',
        Email: ''
      }),
    'post',
    /api\/feedback\/$/
  ],
  ['getAuthHello', () => api.getAuthHello(), 'get', /api\/auth\/hello\/$/],
  ['fetchVendors', () => api.fetchVendors(), 'get', /api\/vendors\/$/],
  [
    'recalculateVendorBalances',
    () => api.recalculateVendorBalances(),
    'post',
    /api\/vendors\/recalculate-balances\/$/
  ],
  ['postVendors', () => api.postVendors(f.vendor()), 'post', /api\/vendors\/$/],
  ['patchVendor', () => api.patchVendor(f.vendor(), 'keep'), 'put', /api\/vendors\/1\/$/],
  [
    'sendVendorPasswordResetEmail',
    () => api.sendVendorPasswordResetEmail(1),
    'post',
    /api\/vendors\/1\/password-reset-email\/$/
  ],
  [
    'sendVendorVerifyEmail',
    () => api.sendVendorVerifyEmail(1),
    'post',
    /api\/vendors\/1\/verify-email\/$/
  ],
  [
    'scanVendorIdCard',
    () => api.scanVendorIdCard('AUG 1'),
    'post',
    /api\/vendors\/AUG%201\/id-scan\/$/
  ],
  [
    'openVendorNextcloudFolder',
    () => api.openVendorNextcloudFolder('AUG-1'),
    'post',
    /api\/vendors\/AUG-1\/nextcloud-folder\/$/
  ],
  [
    'fetchPublicVendorSteckbrief',
    () => api.fetchPublicVendorSteckbrief('AUG-1'),
    'get',
    /api\/vendors\/check\/AUG-1\/steckbrief\/$/
  ],
  [
    'fetchVendorSteckbrief',
    () => api.fetchVendorSteckbrief(1),
    'get',
    /api\/vendors\/1\/steckbrief\/$/
  ],
  [
    'updateVendorSteckbrief',
    () => api.updateVendorSteckbrief(1, { VendorID: 1 } as never),
    'put',
    /api\/vendors\/1\/steckbrief\/$/
  ],
  [
    'uploadVendorSteckbriefImage',
    () => api.uploadVendorSteckbriefImage(1, new File(['x'], 'a.png')),
    'post',
    /api\/vendors\/1\/steckbrief\/image\/$/
  ],
  [
    'deleteVendorSteckbriefImage',
    () => api.deleteVendorSteckbriefImage(1),
    'delete',
    /api\/vendors\/1\/steckbrief\/image\/$/
  ],
  [
    'postPOSOrder',
    () => api.postPOSOrder('AUG-1', [{ item: 1, quantity: 2 }], true),
    'post',
    /api\/vendors\/AUG-1\/pos-order\/$/
  ],
  [
    'fetchPOSOrders',
    () => api.fetchPOSOrders('AUG-1'),
    'get',
    /api\/vendors\/AUG-1\/pos-orders\/$/
  ],
  [
    'fetchAllPOSOrders',
    () => api.fetchAllPOSOrders(from, to),
    'get',
    /api\/pos-orders\/\?from=2026-10-01/
  ],
  [
    'fetchExternalPayments',
    () => api.fetchExternalPayments(from, to),
    'get',
    /api\/external-payments\/$/
  ],
  ['removeVendor', () => api.removeVendor(1, 'delete'), 'delete', /api\/vendors\/1\/$/],
  ['getVendor', () => api.getVendor(1), 'get', /api\/vendors\/1\/$/],
  ['checkVendorId', () => api.checkVendorId('AUG-1'), 'get', /api\/vendors\/check\/AUG-1\/$/],
  ['getVendorMe', () => api.getVendorMe(), 'get', /api\/vendors\/me\/$/],
  ['fetchItems', () => api.fetchItems(), 'get', /api\/items\/$/],
  [
    'fetchItemsBackoffice',
    () => api.fetchItemsBackoffice(true),
    'get',
    /api\/items\/backoffice\/$/
  ],
  ['fetchArchivedItems', () => api.fetchArchivedItems(), 'get', /api\/items\/archived\/$/],
  ['restoreItem', () => api.restoreItem(1), 'post', /api\/items\/1\/restore\/$/],
  [
    'notifyAbonements',
    () => api.notifyAbonements(1),
    'post',
    /api\/items\/1\/notify-abonements\/$/
  ],
  [
    'fetchOnlineIssueMailStatus',
    () => api.fetchOnlineIssueMailStatus(1),
    'get',
    /api\/items\/1\/notify-abonements\/$/
  ],
  [
    'checkWordPressIssue',
    () => api.checkWordPressIssue('digital_edition'),
    'get',
    /api\/items\/wordpress-issue\/$/
  ],
  ['fetchLicenseGroups', () => api.fetchLicenseGroups(), 'get', /api\/items\/licensegroups\/$/],
  ['postItems', () => api.postItems(f.item() as never), 'post', /api\/items\/$/],
  ['patchItem', () => api.patchItem(f.item() as never), 'put', /api\/items\/1\/$/],
  ['fetchItemPDF', () => api.fetchItemPDF(1), 'get', /api\/items\/1\/pdf\/$/],
  ['removeItem', () => api.removeItem(1, true), 'delete', /api\/items\/1\/$/],
  ['fetchSettings', () => api.fetchSettings(), 'get', /api\/settings\/$/],
  ['fetchAdminSettings', () => api.fetchAdminSettings(), 'get', /api\/settings\/admin\/$/],
  ['patchMailSenderName', () => api.patchMailSenderName('Augustin'), 'put', /api\/settings\/$/],
  [
    'patchSettings',
    () => api.patchSettings(f.settings() as unknown as Settings),
    'put',
    /api\/settings\/$/
  ],
  [
    'patchSettings with defaults',
    () => api.patchSettings({} as Settings),
    'put',
    /api\/settings\/$/
  ],
  ['patchSettingsStyles', () => api.patchSettingsStyles('body {}'), 'put', /api\/settings\/css\/$/],
  ['testNextcloud', () => api.testNextcloud(), 'post', /api\/settings\/nextcloud\/test\/$/],
  [
    'testWordPressInvite',
    () => api.testWordPressInvite('https://wp', 'key'),
    'post',
    /api\/settings\/wordpress-invite\/test\/$/
  ],
  ['getStyles', () => api.getStyles(3), 'get', /public\/style\.css\?rev=3$/],
  ['fetchMailTemplates', () => api.fetchMailTemplates(), 'get', /api\/mail-templates\/$/],
  ['getMailTemplate', () => api.getMailTemplate('a b'), 'get', /api\/mail-templates\/a%20b\/$/],
  [
    'createOrUpdateMailTemplate',
    () => api.createOrUpdateMailTemplate({ name: 'a', subject: 's', body: 'b' } as never),
    'post',
    /api\/mail-templates\/$/
  ],
  ['deleteMailTemplate', () => api.deleteMailTemplate('a'), 'delete', /api\/mail-templates\/a\/$/],
  ['fetchPayments', () => api.fetchPayments(from, to, 'payouts'), 'get', /api\/payments\/\?from=/],
  [
    'postPayout',
    () => api.postPayout({ From: null, To: null, VendorLicenseID: 'AUG-1' }),
    'post',
    /api\/payments\/payout\/$/
  ],
  [
    'getPaymentsForPayout',
    () => api.getPaymentsForPayout({ From: null, To: null, Vendor: 'AUG-1' }),
    'get',
    /api\/payments\/forpayout\/\?vendor=AUG-1$/
  ],
  ['getLocations', () => api.getLocations(), 'get', /api\/map\/$/],
  [
    'fetchStatistics',
    () => api.fetchStatistics(from, to, 'items'),
    'get',
    /api\/payments\/statistics\/\?from=/
  ],
  [
    'fetchVendorUsageStatistics',
    () => api.fetchVendorUsageStatistics(from, to),
    'get',
    /api\/vendors\/statistics\/\?from=/
  ],
  [
    'fetchOrderStatistics',
    () => api.fetchOrderStatistics(from, to),
    'get',
    /api\/orders\/statistics\/\?from=/
  ],
  [
    'fetchReport monthly',
    () => api.fetchReport({ month: '2026-10' }),
    'get',
    /api\/reports\/monthly\/2026-10\/$/
  ],
  [
    'fetchReport period',
    () => api.fetchReport({ from: '2026-10-01', to: '2026-10-15' }),
    'get',
    /api\/reports\/period\/\?from=2026-10-01&to=2026-10-15$/
  ],
  ['fetchLastReport', () => api.fetchLastReport(), 'get', /api\/reports\/last\/$/],
  [
    'sendReport',
    () => api.sendReport({ month: '2026-10' }),
    'post',
    /api\/reports\/monthly\/2026-10\/send\/$/
  ],
  [
    'validatePdfDownload',
    () => api.validatePdfDownload('abc'),
    'get',
    /api\/pdf\/abc\/validate\/$/
  ],
  ['fetchAllLocations', () => api.fetchAllLocations(), 'get', /api\/locations\/$/],
  ['postLocation', () => api.postLocation({}), 'post', /api\/locations\/$/],
  ['patchLocation', () => api.patchLocation(2, {}), 'patch', /api\/locations\/2\/$/],
  ['deleteLocation', () => api.deleteLocation(2), 'delete', /api\/locations\/2\/$/],
  [
    'fetchVendorLocations',
    () => api.fetchVendorLocations(1),
    'get',
    /api\/vendors\/1\/locations\/$/
  ],
  [
    'postVendorLocation',
    () => api.postVendorLocation(1, f.vendorLocation()),
    'post',
    /api\/vendors\/1\/locations\/$/
  ],
  [
    'patchVendorLocation',
    () => api.patchVendorLocation(1, 2, f.vendorLocation()),
    'patch',
    /api\/vendors\/1\/locations\/2\/$/
  ],
  [
    'deleteVendorLocation',
    () => api.deleteVendorLocation(1, 2),
    'delete',
    /api\/vendors\/1\/locations\/2\/$/
  ],
  ['fetchVendorComments', () => api.fetchVendorComments(1), 'get', /api\/vendors\/1\/comments\/$/],
  [
    'postVendorComment',
    () => api.postVendorComment(1, { comment: 'x' }),
    'post',
    /api\/vendors\/1\/comments\/$/
  ],
  [
    'patchVendorComment',
    () => api.patchVendorComment(1, 2, f.vendorComment()),
    'patch',
    /api\/vendors\/1\/comments\/2\/$/
  ],
  [
    'deleteVendorComment',
    () => api.deleteVendorComment(1, 2),
    'delete',
    /api\/vendors\/1\/comments\/2\/$/
  ],
  ['fetchUnverifiedOrders', () => api.fetchUnverifiedOrders(), 'get', /api\/orders\/unverified\/$/],
  [
    'fetchVerifiedOrders',
    () => api.fetchVerifiedOrders(from, to),
    'get',
    /api\/orders\/verified\/\?from=/
  ],
  ['resendOrderMail', () => api.resendOrderMail(4), 'post', /api\/orders\/4\/resend-mail\/$/],
  [
    'fetchMailTasks',
    () => api.fetchMailTasks({ status: 'failed', search: '', item_id: 3 }),
    'get',
    /api\/mail-tasks\/\?status=failed&item_id=3$/
  ],
  ['fetchMailTasks without filter', () => api.fetchMailTasks({}), 'get', /api\/mail-tasks\/$/],
  ['fetchMailTask', () => api.fetchMailTask(5), 'get', /api\/mail-tasks\/5\/$/],
  ['retryMailTask', () => api.retryMailTask(5), 'post', /api\/mail-tasks\/5\/retry\/$/],
  [
    'retryFailedMailTasks',
    () => api.retryFailedMailTasks({ kind: 'order' }),
    'post',
    /api\/mail-tasks\/retry-failed\/\?kind=order$/
  ],
  ['fetchCustomers', () => api.fetchCustomers(), 'get', /api\/customers\/$/],
  ['getCustomer', () => api.getCustomer(1), 'get', /api\/customers\/1\/$/],
  ['postCustomer', () => api.postCustomer({}), 'post', /api\/customers\/$/],
  ['putCustomer', () => api.putCustomer(1, {}), 'put', /api\/customers\/1\/$/],
  ['removeCustomer', () => api.removeCustomer(1), 'delete', /api\/customers\/1\/$/],
  [
    'sendCustomerPasswordResetEmail',
    () => api.sendCustomerPasswordResetEmail(1),
    'post',
    /api\/customers\/1\/password-reset-email\/$/
  ],
  [
    'sendCustomerVerifyEmail',
    () => api.sendCustomerVerifyEmail(1),
    'post',
    /api\/customers\/1\/verify-email\/$/
  ],
  [
    'fetchCustomerAbonements',
    () => api.fetchCustomerAbonements(1),
    'get',
    /api\/customers\/1\/abonements\/$/
  ],
  ['fetchAbonements', () => api.fetchAbonements(), 'get', /api\/abonements\/$/],
  ['fetchActiveAbonements', () => api.fetchActiveAbonements(), 'get', /api\/abonements\/active\/$/],
  ['postAbonement', () => api.postAbonement({}), 'post', /api\/abonements\/$/],
  ['putAbonement', () => api.putAbonement(1, {}), 'put', /api\/abonements\/1\/$/],
  ['removeAbonement', () => api.removeAbonement(1), 'delete', /api\/abonements\/1\/$/],
  ['fetchCampaigns', () => api.fetchCampaigns(), 'get', /api\/campaigns\/$/],
  ['fetchActiveCampaigns', () => api.fetchActiveCampaigns(), 'get', /api\/campaigns\/active\/$/],
  ['postCampaign', () => api.postCampaign({}), 'post', /api\/campaigns\/$/],
  ['putCampaign', () => api.putCampaign(1, {}), 'put', /api\/campaigns\/1\/$/],
  ['deleteCampaign', () => api.deleteCampaign(1), 'delete', /api\/campaigns\/1\/$/],
  ['trackCampaign', () => api.trackCampaign(1, 'click'), 'post', /api\/campaigns\/1\/click\/$/],
  ['checkVoucher', () => api.checkVoucher('ABC'), 'post', /api\/vouchers\/check\/$/],
  [
    'redeemVoucher',
    () => api.redeemVoucher({ Code: 'ABC' } as never),
    'post',
    /api\/vouchers\/redeem\/$/
  ],
  ['fetchVouchers', () => api.fetchVouchers(), 'get', /api\/vouchers\/$/],
  ['fetchVoucherPDF', () => api.fetchVoucherPDF(1), 'get', /api\/vouchers\/1\/pdf\/$/],
  [
    'resendVoucher',
    () => api.resendVoucher(1, 'a@example.org'),
    'post',
    /api\/vouchers\/1\/resend\/$/
  ],
  [
    'setVoucherDisabled',
    () => api.setVoucherDisabled(1, true),
    'post',
    /api\/vouchers\/1\/disable\/$/
  ],
  [
    'setVoucherDisabled enable',
    () => api.setVoucherDisabled(1, false),
    'post',
    /api\/vouchers\/1\/enable\/$/
  ],
  ['agent settings', () => agent.SettingsConfiguration.current(), 'get', /api\/settings\/$/],
  [
    'agent postOrder',
    () => agent.VivaWallet.postOrder([{ item: 1, quantity: 1 }], 'AUG-1', 'a@example.org'),
    'post',
    /api\/orders\/$/
  ],
  [
    'agent verifyPayment',
    () => agent.VivaWallet.verifyPayment('t=1'),
    'get',
    /api\/orders\/verify\/\?t=1$/
  ],
  [
    'agent reportFailure',
    () => agent.VivaWallet.reportFailure('1', '2'),
    'post',
    /api\/orders\/failure\/$/
  ],
  [
    'agent verifyAdminPayment',
    () => agent.VivaWallet.verifyAdminPayment('123'),
    'get',
    /api\/orders\/unverified\/code\/123\/verify\/$/
  ],
  [
    'agent addTransactionID',
    () => agent.VivaWallet.addTransactionID('123', 't'),
    'post',
    /api\/orders\/unverified\/code\/123\/transactionID\/$/
  ],
  [
    'agent resendWebhook',
    () => agent.VivaWallet.resendWebhook(7),
    'post',
    /api\/orders\/resend\/7\/$/
  ],
  ['agent checkID', () => agent.Vendor.checkID('AUG-1'), 'get', /api\/vendors\/check\/AUG-1\/$/]
]

describe('api functions', () => {
  beforeEach(() => installBackend())

  it.each(calls)('%s sends the right request', async (_, call, method, url) => {
    await call()

    expect(requests).toHaveLength(1)
    expect(requests[0].method).toBe(method)
    expect(requests[0].url).toMatch(url)
  })

  it('sends the settings as form fields, with defaults for missing ones', async () => {
    await api.patchSettings({} as Settings)

    const form = requests[0].data as FormData
    expect(form.get('MainItem')).toBe('1')
    expect(form.get('POSEnabled')).toBe('true')
    expect(form.get('OrgaCoversTransactionCosts')).toBe('true')
  })

  it('passes the locations action of a vendor as parameter only when given', async () => {
    await api.patchVendor(f.vendor())
    await api.removeVendor(1)
    await api.removeVendor(1, 'keep')

    expect(requests.map((r) => r.params)).toEqual([undefined, undefined, { locations: 'keep' }])
  })

  it('returns null from checkVendorId when the backend fails', async () => {
    on('get', /api\/vendors\/check\//, 'not found', 404)

    expect(await api.checkVendorId('nope')).toBeNull()
  })

  it('returns the vendor name from checkVendorId', async () => {
    expect(await api.checkVendorId('AUG-1')).toEqual({ FirstName: 'Anna', AccountProofUrl: '' })
  })

  it('downloads a report as a file named after the period', async () => {
    on('get', /api\/reports\//, new Blob(['csv']))
    URL.createObjectURL = vi.fn(() => 'blob:report')
    URL.revokeObjectURL = vi.fn()
    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {})
    const names: string[] = []

    click.mockImplementation(function (this: HTMLAnchorElement) {
      names.push(this.download)
    })

    await api.downloadReport({ month: '2026-10' }, 'csv')
    await api.downloadReport({ from: '2026-10-01', to: '2026-10-15' }, 'pdf')

    expect(names).toEqual(['monatsbericht_2026-10.csv', 'bericht_2026-10-01_2026-10-15.pdf'])
    expect(requests[0].url).toMatch(/monthly\/2026-10\/csv\/$/)
    click.mockRestore()
  })

  it('opens the pdf download link in a new tab', async () => {
    const opened: string[] = []

    const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (
      this: HTMLAnchorElement
    ) {
      opened.push(`${this.target} ${this.href}`)
    })

    await api.pdfDownload('abc')

    expect(opened).toHaveLength(1)
    expect(opened[0]).toMatch(/^_blank .*api\/pdf\/abc\/$/)
    click.mockRestore()
  })

  it.each([
    ['no response', undefined, true],
    ['a bad gateway', 502, true],
    ['a server error', 500, false]
  ])('isBackendUnreachable is right for %s', async (_, status, expected) => {
    const { AxiosError } = await import('axios')

    const error = new AxiosError(
      'x',
      undefined,
      undefined,
      undefined,
      status ? ({ status } as never) : undefined
    )

    expect(api.isBackendUnreachable(error)).toBe(expected)
    expect(api.isBackendUnreachable(new Error('x'))).toBe(false)
  })
})
