import { beforeAll, describe, expect, it, vi } from 'vitest'
import router from '@/router'
import { mountRoute, renderErrors } from './support/mount'

const paths: Array<[string, RegExp]> = [
  ['/v/AUG-1/landing-page', /./],
  ['/v/AUG-1/check-id', /./],
  ['/v/AUG-1/steckbrief', /./],
  ['/v/AUG-1/additionalproducts', /./],
  ['/v/AUG-1/print-digital', /./],
  ['/v/AUG-1/tipping', /./],
  ['/v/AUG-1/information', /./],
  ['/v/AUG-1/confirmation', /./],
  ['/v/AUG-1/payment', /./],
  ['/v/AUG-1/custom-tip', /./],
  ['/v/AUG-1/shop', /./],
  ['/v/AUG-1/item-available', /./],
  ['/v/AUG-1/items', /./],
  ['/go-to-vendor', /^Go to Vendor$/],
  ['/backoffice', /^Vendor Summary$/],
  ['/backoffice/credits', /^Backoffice Credit$/],
  ['/backoffice/credits/payout/1', /^Credit Payout$/],
  ['/backoffice/payments', /^Backoffice Accounting$/],
  ['/backoffice/pos-accounting', /^Backoffice POS Accounting$/],
  ['/backoffice/payouts', /^Backoffice Logs$/],
  ['/backoffice/sales', /^Backoffice Inbox$/],
  ['/backoffice/sales-extended', /^Backoffice Sales Extended$/],
  ['/backoffice/mails', /^Backoffice Mails$/],
  ['/backoffice/unverified-orders', /^Backoffice Unverified Orders$/],
  ['/backoffice/vendorsummary', /^Vendor Summary$/],
  ['/backoffice/scan-id', /^Scan ID Card$/],
  ['/backoffice/newvendor', /^New Vendor$/],
  ['/backoffice/userprofile/1', /^Vendor Profile$/],
  ['/backoffice/userprofile/1/update', /^Update Vendor Profile$/],
  ['/backoffice/userprofile/1/comments', /^Vendor Comments$/],
  ['/backoffice/userprofile/1/steckbrief', /^Vendor Steckbrief$/],
  ['/backoffice/settings/update', /^Update Backoffice Settings$/],
  ['/backoffice/vouchers', /^Backoffice Vouchers$/],
  ['/backoffice/productsettings', /^Backoffice Product Settings$/],
  ['/backoffice/newproduct', /^New Product$/],
  ['/backoffice/locations', /^Locations$/],
  ['/backoffice/monthly-report', /^Monthly Report$/],
  ['/backoffice/donations', /^Donations$/],
  ['/backoffice/campaigns', /^Campaigns$/],
  ['/backoffice/map', /^Map$/],
  ['/backoffice/pos', /^BackofficePOSPickVendor$/],
  ['/backoffice/pos/AUG-1', /^BackofficePOS$/],
  ['/backoffice/customers', /^Customers$/],
  ['/backoffice/customers/1', /^Customer Detail$/],
  ['/backoffice/statistics', /^Statistics$/],
  ['/backoffice/productsettings/update/1', /^Update Product$/],
  ['/404', /^404$/],
  ['/error', /^Error$/],
  ['/error-invalid-link', /^Error invalid link$/],
  ['/einloesen', /^Redeem Voucher$/],
  ['/pdf/abc', /^pdf download link$/],
  ['/me', /^My Info$/],
  ['/me/qrcode', /^My QR Code$/],
  ['/me/profile', /^My Profile$/],
  ['/maintenance', /^Maintenance$/],
  ['/does/not/exist', /^all$/]
]

describe('every route', () => {
  beforeAll(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(window, 'alert').mockImplementation(() => {})
  })

  it.each(paths)('renders %s', async (path, name) => {
    const { wrapper } = await mountRoute(path)

    expect(String(router.currentRoute.value.name)).toMatch(name)
    expect(wrapper.html().length).toBeGreaterThan(0)
    expect(renderErrors).toEqual([])
  })
})
