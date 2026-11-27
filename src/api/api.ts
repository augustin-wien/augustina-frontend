import keycloak, { login } from '@/keycloak/keycloak'
import { type Item, type ItemUpload } from '@/stores/items'
import { type PaymentsForPayout, type Payout } from '@/stores/payout'
import { type Settings } from '@/stores/settings'
import {
  type NewVendorComment,
  type Vendor,
  type VendorComment,
  type VendorLocation
} from '@/stores/vendor'
import axios from 'axios'
import { getSentry } from '@/utils/sentry'
import { requestIdFromHeaders, setLastRequestId } from '@/utils/requestId'

import {
  AUTH_API_URL,
  ITEMS_API_URL,
  ITEMS_BACKOFFICE_API_URL,
  PAYMENTS_FOR_PAYOUT_API_URL,
  PAYMENT_API_URL,
  PAYOUT_API_URL,
  SETTINGS_API_URL,
  VENDORS_API_URL,
  VENDOR_CHECK_ID,
  VENDORS_LOCATION_URL,
  LOCATIONS_API_URL,
  CAMPAIGNS_API_URL,
  VENDOR_ME_API_URL,
  PAYMENT_STATISTICS_API_URL,
  REPORTS_API_URL,
  PDF_DOWNLOAD_API_URL,
  STYLES_URL,
  MAIL_TEMPLATES_API,
  BASE_URL,
  ORDERS_UNVERIFIED_API_URL,
  ORDERS_VERIFIED_API_URL,
  ORDERS_API_URL,
  ORDERS_STATISTICS_API_URL,
  VENDOR_STATISTICS_API_URL,
  CUSTOMERS_API_URL,
  ABONEMENTS_API_URL,
  VOUCHERS_API_URL,
  FEEDBACK_API_URL,
  MAIL_TASKS_API_URL
} from './endpoints'

declare module 'axios' {
  interface AxiosRequestConfig {
    // For polled requests that report their own failure once they stop retrying
    skipUnreachableReport?: boolean
  }
}

export const apiInstance = axios.create({
  withCredentials: true
})

apiInstance.interceptors.request.use(
  (config) => {
    if (keycloak && keycloak.keycloak?.authenticated) {
      config.headers.Authorization = `Bearer ${keycloak.keycloak.token}`
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// A 401 usually just means the access token expired mid-session, not that the user is
// genuinely logged out - refresh it once and retry before giving up to a full login
// redirect. Shared across concurrent 401s so a burst of simultaneously-expiring requests
// triggers one refresh (and, if that fails, one redirect) instead of one per request.
let refreshTokenPromise: Promise<boolean> | null = null
let loginTriggered = false

function refreshAccessToken(): Promise<boolean> {
  if (!refreshTokenPromise) {
    refreshTokenPromise = (keycloak.keycloak?.updateToken(-1) ?? Promise.resolve(false)).finally(
      () => {
        refreshTokenPromise = null
      }
    )
  }

  return refreshTokenPromise
}

apiInstance.interceptors.response.use(
  (response) => {
    setLastRequestId(requestIdFromHeaders(response.headers))

    return response
  },
  async (error) => {
    if (error.response) {
      setLastRequestId(requestIdFromHeaders(error.response.headers))

      if (error.response.status === 401 && !error.config?._retriedAfterRefresh) {
        if (error.config) error.config._retriedAfterRefresh = true

        const refreshed = await refreshAccessToken().catch(() => false)

        if (refreshed) {
          return apiInstance(error.config)
        }

        if (!loginTriggered) {
          loginTriggered = true
          login()
        }
      }
    } else if (!error.config?.skipUnreachableReport) {
      // No response at all: the request never reached the backend (offline, DNS/
      // connection failure, timeout, CORS). A normal 4xx/5xx already has error.response
      // and is handled above - this is the "backend unreachable" case, and unlike a
      // thrown Error it wouldn't otherwise reach Sentry via the console.error override.
      const Sentry = getSentry()

      Sentry?.withScope((scope) => {
        scope.setTag('error_type', 'backend_unreachable')

        scope.setContext('request', {
          url: error.config?.url,
          method: error.config?.method
        })

        Sentry.captureException(error)
      })
    }

    return Promise.reject(error)
  }
)

/**
 * True when a request failed because the backend could not be reached at all: no response
 * (offline, connection refused, DNS, timeout) or a gateway error from the reverse proxy in front
 * of a backend that is down. A normal 4xx/500 means the backend answered and is not included.
 */
export function isBackendUnreachable(error: unknown): boolean {
  if (!axios.isAxiosError(error)) return false

  if (!error.response) return true

  return [502, 503, 504].includes(error.response.status)
}

export interface FeedbackInput {
  Message: string
  TransactionID: string
  RequestID: string
  VendorID: string
  Page: string
  Email: string
}

export function sendFeedback(feedback: FeedbackInput) {
  return apiInstance.post(FEEDBACK_API_URL, feedback, {
    headers: { 'Content-Type': 'application/json' }
  })
}

export function getAuthHello() {
  return apiInstance.get(AUTH_API_URL)
}

// vendors
export async function fetchVendors() {
  return apiInstance.get<Vendor[]>(VENDORS_API_URL)
}

export async function recalculateVendorBalances() {
  return apiInstance.post<Vendor[]>(`${VENDORS_API_URL}recalculate-balances/`)
}
export async function postVendors(newVendor: Vendor) {
  return apiInstance.post(VENDORS_API_URL, JSON.stringify(newVendor), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

// What happens to a vendor's locations when the vendor is deleted or disabled:
// kept as unassigned locations or deleted. Without it they stay with the vendor.
export type VendorLocationsAction = 'keep' | 'delete'

export async function patchVendor(updatedVendor: Vendor, locations?: VendorLocationsAction) {
  return apiInstance.put(`${VENDORS_API_URL}${updatedVendor.ID}/`, JSON.stringify(updatedVendor), {
    params: locations ? { locations } : undefined,
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

// Keycloak mails the vendor a link to set a new password / to confirm their address
export async function sendVendorPasswordResetEmail(vendorId: number) {
  return apiInstance.post(`${VENDORS_API_URL}${vendorId}/password-reset-email/`)
}

export async function sendVendorVerifyEmail(vendorId: number) {
  return apiInstance.post(`${VENDORS_API_URL}${vendorId}/verify-email/`)
}

// Records that the vendor's ID card was scanned and returns the vendor
export async function scanVendorIdCard(licenseId: string) {
  return apiInstance.post(`${VENDORS_API_URL}${encodeURIComponent(licenseId)}/id-scan/`)
}

// Creates the vendor's document folder in Nextcloud if needed and returns a link to it
export async function openVendorNextcloudFolder(licenseId: string) {
  return apiInstance.post<{ URL: string }>(
    `${VENDORS_API_URL}${encodeURIComponent(licenseId)}/nextcloud-folder/`
  )
}

export type VendorSteckbrief = {
  VendorID: number
  FirstName: string
  LastName: string
  LicenseID: string
  Image: string
  Description: string
  Family: string
  Residence: string
  Education: string
  CareerGoal: string
  Support: string
}

export async function fetchPublicVendorSteckbrief(licenseId: string) {
  return apiInstance.get<Omit<VendorSteckbrief, 'VendorID'>>(
    `${VENDOR_CHECK_ID}${encodeURIComponent(licenseId)}/steckbrief/`
  )
}

export async function fetchVendorSteckbrief(vendorId: number) {
  return apiInstance.get<VendorSteckbrief>(`${VENDORS_API_URL}${vendorId}/steckbrief/`)
}

export async function updateVendorSteckbrief(vendorId: number, steckbrief: VendorSteckbrief) {
  return apiInstance.put<VendorSteckbrief>(`${VENDORS_API_URL}${vendorId}/steckbrief/`, steckbrief)
}

export async function uploadVendorSteckbriefImage(vendorId: number, image: File) {
  const formData = new FormData()
  formData.append('Image', image)
  return apiInstance.post<VendorSteckbrief>(
    `${VENDORS_API_URL}${vendorId}/steckbrief/image/`,
    formData,
    { headers: { 'Content-Type': 'multipart/form-data' } }
  )
}

export async function deleteVendorSteckbriefImage(vendorId: number) {
  return apiInstance.delete<VendorSteckbrief>(`${VENDORS_API_URL}${vendorId}/steckbrief/image/`)
}

export async function postPOSOrder(
  licenseId: string,
  entries: { item: number; quantity: number }[],
  useBalance: boolean
) {
  return apiInstance.post(
    `${VENDORS_API_URL}${licenseId}/pos-order/`,
    JSON.stringify({ entries, useBalance }),
    { headers: { 'Content-Type': 'application/json' } }
  )
}

export async function fetchPOSOrders(licenseId: string) {
  return apiInstance.get(`${VENDORS_API_URL}${licenseId}/pos-orders/`)
}

export async function fetchAllPOSOrders(startDate: Date, endDate: Date) {
  return apiInstance.get(
    `${BASE_URL}api/pos-orders/?from=${startDate.toISOString()}&to=${endDate.toISOString()}`
  )
}

export async function fetchExternalPayments(startDate: Date, endDate: Date) {
  return apiInstance.get(`${BASE_URL}api/external-payments/`, {
    params: { from: startDate.toISOString(), to: endDate.toISOString() }
  })
}

export async function removeVendor(vendorId: number, locations?: VendorLocationsAction) {
  return apiInstance.delete(`${VENDORS_API_URL}${vendorId}/`, {
    params: locations ? { locations } : undefined
  })
}

export async function getVendor(vendorId: number) {
  return apiInstance.get(`${VENDORS_API_URL}${vendorId}/`)
}

export async function checkVendorId(vendorId: string | string[]) {
  return apiInstance
    .get(`${VENDORS_API_URL}check/${vendorId}/`)
    .then((response) => {
      return response.data
    })
    .catch(() => {
      return null
    })
}

// vendor me
export async function getVendorMe() {
  return apiInstance.get<Vendor[]>(VENDOR_ME_API_URL)
}

// items
export async function fetchItems() {
  return apiInstance.get<Item[]>(ITEMS_API_URL)
}

export async function fetchItemsBackoffice(includeArchived = false) {
  return apiInstance.get<Item[]>(`${ITEMS_BACKOFFICE_API_URL}`, {
    params: includeArchived ? { includeArchived: true } : undefined
  })
}

export async function fetchArchivedItems() {
  return apiInstance.get<Item[]>(`${ITEMS_API_URL}archived/`)
}

export async function restoreItem(itemId: number) {
  return apiInstance.post(`${ITEMS_API_URL}${itemId}/restore/`)
}

export async function notifyAbonements(itemId: number) {
  return apiInstance.post(`${ITEMS_API_URL}${itemId}/notify-abonements/`)
}

// Delivery state of the mails sent to the abonnents for an online issue
export async function fetchOnlineIssueMailStatus(itemId: number) {
  return apiInstance.get(`${ITEMS_API_URL}${itemId}/notify-abonements/`)
}

export type WordPressIssueCheck = {
  configured: boolean
  ok: boolean
  message: string
  issue: {
    exists: boolean
    issue_number: string
    title?: string
    published: boolean
    is_demo: boolean
  }
}

// Asks WordPress (via the backend) whether the license group names a published issue
export async function checkWordPressIssue(licenseGroup: string) {
  return apiInstance.get<WordPressIssueCheck>(`${ITEMS_API_URL}wordpress-issue/`, {
    params: { licenseGroup }
  })
}

export async function fetchLicenseGroups() {
  return apiInstance.get<string[]>(`${ITEMS_API_URL}licensegroups/`)
}
export async function postItems(newItem: ItemUpload) {
  return apiInstance.postForm(ITEMS_API_URL, newItem)
}

export async function patchItem(updatedItem: ItemUpload) {
  return apiInstance.putForm(`${ITEMS_API_URL}${updatedItem.ID}/`, updatedItem)
}

export async function fetchItemPDF(itemId: number) {
  return apiInstance.get<Blob>(`${ITEMS_API_URL}${itemId}/pdf/`, { responseType: 'blob' })
}

export async function removeItem(itemId: number, deleteLicense = false) {
  return apiInstance.delete(`${ITEMS_API_URL}${itemId}/`, {
    params: deleteLicense ? { deleteLicense: true } : undefined
  })
}

//settings
export async function fetchSettings() {
  return apiInstance.get(SETTINGS_API_URL)
}

/**
 * The public endpoint deliberately withholds credentials such as the WordPress invite api key.
 * The backoffice needs them to display and re-save them, so it reads the complete settings from
 * the admin route instead.
 */
export async function fetchAdminSettings() {
  return apiInstance.get(`${SETTINGS_API_URL}admin/`)
}

export async function patchMailSenderName(mailSenderName: string) {
  const formData = new FormData()
  formData.append('MailSenderName', mailSenderName)

  return apiInstance.put(`${SETTINGS_API_URL}`, formData, {
    headers: {
      accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  })
}

export async function patchSettings(updatedSettings: Settings) {
  const formData = new FormData()
  formData.append('Color', updatedSettings.Color ?? '')
  formData.append('FontColor', updatedSettings.FontColor ?? '')
  formData.append('Logo', updatedSettings.Logo || '')
  formData.append('MainItem', (updatedSettings.MainItem ?? 1).toString())
  formData.append('AGBUrl', updatedSettings.AGBUrl ?? '')
  formData.append('MaintainanceModeHelpUrl', updatedSettings.MaintainanceModeHelpUrl ?? '')
  formData.append('QRCodeLogoImgUrl', updatedSettings.QRCodeLogoImgUrl ?? '')
  formData.append('QRCodeUrl', updatedSettings.QRCodeUrl ?? '')
  formData.append('VendorNotFoundHelpUrl', updatedSettings.VendorNotFoundHelpUrl ?? '')
  formData.append('VendorEmailPostfix', updatedSettings.VendorEmailPostfix ?? '')
  formData.append('WebshopIsClosed', (updatedSettings.WebshopIsClosed ?? false).toString())
  formData.append('NewspaperName', updatedSettings.NewspaperName ?? '')
  formData.append('MapCenterLat', (updatedSettings.MapCenterLat ?? 0).toString())
  formData.append('MapCenterLong', (updatedSettings.MapCenterLong ?? 0).toString())

  formData.append(
    'UseVendorLicenseIdInShop',
    (updatedSettings.UseVendorLicenseIdInShop ?? false).toString()
  )

  formData.append('Favicon', updatedSettings.Favicon || '')
  formData.append('QRCodeSettings', updatedSettings.QRCodeSettings ?? '')
  formData.append('QRCodeEnableLogo', (updatedSettings.QRCodeEnableLogo ?? false).toString())

  formData.append(
    'UseTipInsteadOfDonation',
    (updatedSettings.UseTipInsteadOfDonation ?? false).toString()
  )

  formData.append('ShopLanding', (updatedSettings.ShopLanding ?? false).toString())
  formData.append('DigitalItemsUrl', updatedSettings.DigitalItemsUrl ?? '')
  formData.append('AbonementUrl', updatedSettings.AbonementUrl ?? '')
  formData.append('AbonementEnabled', (updatedSettings.AbonementEnabled ?? false).toString())
  formData.append('VoucherEnabled', (updatedSettings.VoucherEnabled ?? false).toString())
  formData.append('POSEnabled', (updatedSettings.POSEnabled ?? true).toString())

  formData.append(
    'DonationTrackingEnabled',
    (updatedSettings.DonationTrackingEnabled ?? false).toString()
  )

  formData.append('WordPressInviteURL', updatedSettings.WordPressInviteURL ?? '')
  formData.append('WordPressInviteAPIKey', updatedSettings.WordPressInviteAPIKey ?? '')
  formData.append('WordPressInviteTTL', (updatedSettings.WordPressInviteTTL ?? 604800).toString())
  formData.append('PrivacyPolicyUrl', updatedSettings.PrivacyPolicyUrl ?? '')
  formData.append('MatomoUrl', updatedSettings.MatomoUrl ?? '')
  formData.append('MatomoSiteId', updatedSettings.MatomoSiteId ?? '')
  formData.append('OnlinePaperUrl', updatedSettings.OnlinePaperUrl ?? '')
  formData.append('MailSenderName', updatedSettings.MailSenderName ?? '')
  formData.append('AGBRequired', (updatedSettings.AGBRequired ?? true).toString())
  formData.append('DonationPageEnabled', (updatedSettings.DonationPageEnabled ?? true).toString())
  formData.append('MatomoTrackCart', (updatedSettings.MatomoTrackCart ?? false).toString())
  formData.append('FeedbackEnabled', (updatedSettings.FeedbackEnabled ?? false).toString())
  formData.append('FeedbackEmail', updatedSettings.FeedbackEmail ?? '')
  formData.append('NewsletterEnabled', (updatedSettings.NewsletterEnabled ?? false).toString())
  formData.append('IDScanEnabled', (updatedSettings.IDScanEnabled ?? false).toString())
  formData.append('NextcloudEnabled', (updatedSettings.NextcloudEnabled ?? false).toString())
  formData.append('SteckbriefEnabled', (updatedSettings.SteckbriefEnabled ?? false).toString())
  formData.append('NextcloudURL', updatedSettings.NextcloudURL ?? '')
  formData.append('NextcloudPublicURL', updatedSettings.NextcloudPublicURL ?? '')
  formData.append('NextcloudUsername', updatedSettings.NextcloudUsername ?? '')
  formData.append('NextcloudAppPassword', updatedSettings.NextcloudAppPassword ?? '')
  formData.append('NextcloudVendorRoot', updatedSettings.NextcloudVendorRoot ?? '')
  formData.append('OdooWebhookURL', updatedSettings.OdooWebhookURL ?? '')
  formData.append('OdooWebhookToken', updatedSettings.OdooWebhookToken ?? '')
  formData.append('OdooDBFilter', updatedSettings.OdooDBFilter ?? '')
  formData.append('AccountingReportEmail', updatedSettings.AccountingReportEmail ?? '')

  formData.append(
    'OrgaCoversTransactionCosts',
    (updatedSettings.OrgaCoversTransactionCosts ?? true).toString()
  )

  formData.append('MaxOrderAmount', (updatedSettings.MaxOrderAmount ?? 0).toString())

  return apiInstance.put(`${SETTINGS_API_URL}`, formData, {
    headers: {
      accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  })
}

// patch styles
export async function patchSettingsStyles(styles: string) {
  return apiInstance.put(`${SETTINGS_API_URL}css/`, styles, {
    headers: {
      accept: 'application/json',
      'Content-Type': 'text/css'
    }
  })
}

export type NextcloudTestResult = { Success: boolean; Message: string }

// Checks the saved Nextcloud settings
export async function testNextcloud() {
  return apiInstance.post<NextcloudTestResult>(`${SETTINGS_API_URL}nextcloud/test/`)
}

export type WordPressInviteTestResult = { Success: boolean; Message: string; Link: string }

// asks WordPress for a test login link with the given (possibly unsaved) invite settings
export async function testWordPressInvite(url: string, apiKey: string) {
  return apiInstance.post<WordPressInviteTestResult>(`${SETTINGS_API_URL}wordpress-invite/test/`, {
    WordPressInviteURL: url,
    WordPressInviteAPIKey: apiKey
  })
}

// get styles to load it dynamically
export async function getStyles(rev: number) {
  return apiInstance.get(`${STYLES_URL}?rev=${rev}`)
}

// Mail templates API
export async function fetchMailTemplates() {
  return apiInstance.get(`${MAIL_TEMPLATES_API}`)
}

export async function getMailTemplate(name: string) {
  return apiInstance.get(`${MAIL_TEMPLATES_API}${encodeURIComponent(name)}/`)
}

export async function createOrUpdateMailTemplate(template: {
  name: string
  subject: string
  body: string
}) {
  // backend expects capitalized keys (Name/Subject/Body)
  const payload = {
    Name: template.name,
    Subject: template.subject,
    Body: template.body
  }

  return apiInstance.post(MAIL_TEMPLATES_API, JSON.stringify(payload), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

export async function deleteMailTemplate(name: string) {
  return apiInstance.delete(`${MAIL_TEMPLATES_API}${encodeURIComponent(name)}/`)
}

//payments list
export async function fetchPayments(startDate: Date, endDate: Date, filter: string) {
  return apiInstance.get(
    `${PAYMENT_API_URL}?from=${startDate.toISOString()}&to=${endDate.toISOString()}${
      filter ? '&' + filter : ''
    }`
  )
}

//payout
export async function postPayout(payout: Payout) {
  return apiInstance.post(PAYOUT_API_URL, JSON.stringify(payout), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

//payout
export async function getPaymentsForPayout(payout: PaymentsForPayout) {
  return apiInstance.get(`${PAYMENTS_FOR_PAYOUT_API_URL}?vendor=${payout.Vendor}`)
}

//locations
export async function getLocations() {
  return apiInstance.get(VENDORS_LOCATION_URL)
}

//statistics
export async function fetchStatistics(startDate: Date, endDate: Date, filter: string) {
  return apiInstance.get(
    `${PAYMENT_STATISTICS_API_URL}?from=${startDate.toISOString()}&to=${endDate.toISOString()}${
      filter ? '&' + filter : ''
    }`
  )
}

export async function fetchVendorUsageStatistics(startDate: Date, endDate: Date) {
  return apiInstance.get(
    `${VENDOR_STATISTICS_API_URL}?from=${startDate.toISOString()}&to=${endDate.toISOString()}`
  )
}

export async function fetchOrderStatistics(startDate: Date, endDate: Date) {
  return apiInstance.get(
    `${ORDERS_STATISTICS_API_URL}?from=${startDate.toISOString()}&to=${endDate.toISOString()}`
  )
}

// monthly accounting report
export type ReportPeriod = { month: string } | { from: string; to: string }

const reportUrl = (period: ReportPeriod, action = '') =>
  'month' in period
    ? `${REPORTS_API_URL}monthly/${period.month}/${action}`
    : `${REPORTS_API_URL}period/${action}?from=${period.from}&to=${period.to}`

const reportFileName = (period: ReportPeriod) =>
  'month' in period ? `monatsbericht_${period.month}` : `bericht_${period.from}_${period.to}`

export async function fetchReport(period: ReportPeriod) {
  return apiInstance.get(reportUrl(period))
}

export async function fetchLastReport() {
  return apiInstance.get<{ To: string }>(`${REPORTS_API_URL}last/`)
}

export async function downloadReport(period: ReportPeriod, format: 'csv' | 'pdf') {
  const res = await apiInstance.get<Blob>(reportUrl(period, `${format}/`), {
    responseType: 'blob'
  })

  const url = URL.createObjectURL(res.data)
  const a = document.createElement('a')
  a.href = url
  a.download = `${reportFileName(period)}.${format}`
  a.click()
  URL.revokeObjectURL(url)
}

export async function sendReport(period: ReportPeriod) {
  return apiInstance.post(reportUrl(period, 'send/'))
}

// pdf download
export async function validatePdfDownload(linkId: string) {
  return apiInstance.get(`${PDF_DOWNLOAD_API_URL}${linkId}/validate/`)
}
export async function pdfDownload(linkId: string) {
  // create a hidden link and click it
  const link = document.createElement('a')
  link.href = `${PDF_DOWNLOAD_API_URL}${linkId}/`
  link.target = '_blank'
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

// image Download

export async function getBase64ImageFromUrl(url: string) {
  let finalUrl = url

  if (url.startsWith('/')) {
    finalUrl = `${BASE_URL}${url.slice(1)}`
  } else if (!finalUrl.startsWith('img')) {
    finalUrl = `${BASE_URL}${url}`
  }

  const response = await axios.get(finalUrl, { responseType: 'blob' })
  if (response.status == 200) {
    const base64data = await blobToData(response.data)
    return base64data
  } else return undefined
}

function blobToData(blob: Blob): Promise<string | undefined> {
  const result = new Promise<string | undefined>((resolve) => {
    const reader = new FileReader()

    reader.onloadend = () => {
      const result = reader.result

      if (result && result !== null && typeof result === 'string') {
        resolve(result)
      }

      resolve(undefined)
    }

    reader.readAsDataURL(blob)
  })

  return result
}

// Locations API

// Locations independent of a vendor: a location may belong to no vendor at all

export async function fetchAllLocations() {
  return apiInstance.get(LOCATIONS_API_URL)
}

export async function postLocation(location: unknown) {
  return apiInstance.post(LOCATIONS_API_URL, location)
}

export async function patchLocation(locationId: number, location: unknown) {
  return apiInstance.patch(`${LOCATIONS_API_URL}${locationId}/`, location)
}

export async function deleteLocation(locationId: number) {
  return apiInstance.delete(`${LOCATIONS_API_URL}${locationId}/`)
}

export async function fetchVendorLocations(vendorId: number) {
  return apiInstance.get(`${VENDORS_API_URL}${vendorId}/locations/`)
}

export async function postVendorLocation(vendorId: number, location: VendorLocation) {
  return apiInstance.post(`${VENDORS_API_URL}${vendorId}/locations/`, JSON.stringify(location), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

export async function patchVendorLocation(
  vendorId: number,
  locationId: number,
  location: VendorLocation
) {
  return apiInstance.patch(
    `${VENDORS_API_URL}${vendorId}/locations/${locationId}/`,
    JSON.stringify(location),
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }
  )
}

export async function deleteVendorLocation(vendorId: number, locationId: number) {
  return apiInstance.delete(`${VENDORS_API_URL}${vendorId}/locations/${locationId}/`)
}

// Comments API

export async function fetchVendorComments(vendorId: number) {
  return apiInstance.get(`${VENDORS_API_URL}${vendorId}/comments/`)
}

export async function postVendorComment(vendorId: number, comment: NewVendorComment) {
  return apiInstance.post(`${VENDORS_API_URL}${vendorId}/comments/`, JSON.stringify(comment), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

export async function patchVendorComment(
  vendorId: number,
  commentId: number,
  comment: VendorComment
) {
  return apiInstance.patch(
    `${VENDORS_API_URL}${vendorId}/comments/${commentId}/`,
    JSON.stringify(comment),
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }
  )
}

export async function deleteVendorComment(vendorId: number, commentId: number) {
  return apiInstance.delete(`${VENDORS_API_URL}${vendorId}/comments/${commentId}/`)
}

export async function fetchUnverifiedOrders() {
  return apiInstance.get(ORDERS_UNVERIFIED_API_URL)
}

export async function fetchVerifiedOrders(startDate: Date, endDate: Date) {
  return apiInstance.get(
    `${ORDERS_VERIFIED_API_URL}?from=${startDate.toISOString()}&to=${endDate.toISOString()}`
  )
}

// Sends the online paper and PDF download mails of a digital sale to its customer again
export async function resendOrderMail(orderID: number) {
  return apiInstance.post(`${ORDERS_API_URL}${orderID}/resend-mail/`)
}

// Mail tasks API: every mail the backend sends, with its delivery state
export type MailTaskFilter = {
  status?: string
  kind?: string
  item_id?: number
  order_id?: number
  search?: string
  limit?: number
  offset?: number
}

function mailTaskQuery(filter: MailTaskFilter) {
  const params = new URLSearchParams()

  Object.entries(filter).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') params.set(key, String(value))
  })

  const query = params.toString()
  return query ? `?${query}` : ''
}

export async function fetchMailTasks(filter: MailTaskFilter) {
  return apiInstance.get(`${MAIL_TASKS_API_URL}${mailTaskQuery(filter)}`)
}

export async function fetchMailTask(id: number) {
  return apiInstance.get(`${MAIL_TASKS_API_URL}${id}/`)
}

export async function retryMailTask(id: number) {
  return apiInstance.post(`${MAIL_TASKS_API_URL}${id}/retry/`)
}

export async function retryFailedMailTasks(filter: MailTaskFilter) {
  return apiInstance.post(`${MAIL_TASKS_API_URL}retry-failed/${mailTaskQuery(filter)}`)
}

// Customers API
export async function fetchCustomers() {
  return apiInstance.get(CUSTOMERS_API_URL)
}

export async function getCustomer(customerId: number) {
  return apiInstance.get(`${CUSTOMERS_API_URL}${customerId}/`)
}

export async function postCustomer(customer: object) {
  return apiInstance.post(CUSTOMERS_API_URL, JSON.stringify(customer), {
    headers: { accept: 'application/json', 'Content-Type': 'application/json' }
  })
}

export async function putCustomer(customerId: number, customer: object) {
  return apiInstance.put(`${CUSTOMERS_API_URL}${customerId}/`, JSON.stringify(customer), {
    headers: { accept: 'application/json', 'Content-Type': 'application/json' }
  })
}

export async function removeCustomer(customerId: number) {
  return apiInstance.delete(`${CUSTOMERS_API_URL}${customerId}/`)
}

export async function sendCustomerPasswordResetEmail(customerId: number) {
  return apiInstance.post(`${CUSTOMERS_API_URL}${customerId}/password-reset-email/`)
}

export async function sendCustomerVerifyEmail(customerId: number) {
  return apiInstance.post(`${CUSTOMERS_API_URL}${customerId}/verify-email/`)
}

export async function fetchCustomerAbonements(customerId: number) {
  return apiInstance.get(`${CUSTOMERS_API_URL}${customerId}/abonements/`)
}

// Abonements API
export async function fetchAbonements() {
  return apiInstance.get(ABONEMENTS_API_URL)
}

export async function fetchActiveAbonements() {
  return apiInstance.get(`${ABONEMENTS_API_URL}active/`)
}

export async function postAbonement(abonement: object) {
  return apiInstance.post(ABONEMENTS_API_URL, JSON.stringify(abonement), {
    headers: { accept: 'application/json', 'Content-Type': 'application/json' }
  })
}

export async function putAbonement(abonementId: number, abonement: object) {
  return apiInstance.put(`${ABONEMENTS_API_URL}${abonementId}/`, JSON.stringify(abonement), {
    headers: { accept: 'application/json', 'Content-Type': 'application/json' }
  })
}

export async function removeAbonement(abonementId: number) {
  return apiInstance.delete(`${ABONEMENTS_API_URL}${abonementId}/`)
}

// campaigns
export async function fetchCampaigns() {
  return apiInstance.get(CAMPAIGNS_API_URL)
}

export async function fetchActiveCampaigns() {
  return apiInstance.get(`${CAMPAIGNS_API_URL}active/`)
}

export async function postCampaign(campaign: unknown) {
  return apiInstance.post(CAMPAIGNS_API_URL, campaign)
}

export async function putCampaign(id: number, campaign: unknown) {
  return apiInstance.put(`${CAMPAIGNS_API_URL}${id}/`, campaign)
}

export async function deleteCampaign(id: number) {
  return apiInstance.delete(`${CAMPAIGNS_API_URL}${id}/`)
}

export async function trackCampaign(id: number, counter: 'view' | 'click') {
  return apiInstance.post(`${CAMPAIGNS_API_URL}${id}/${counter}/`)
}

// abonement vouchers
export interface VoucherCheck {
  Code: string
  Status: 'active' | 'redeemed' | 'disabled'
  ItemName: string
  DurationMonths: number
  RecipientName: string
  Message: string
}

export interface VoucherRedemption {
  ItemName: string
  DurationMonths: number
  FromDate: string
  ToDate: string
  Email: string
}

export interface AbonementVoucher {
  ID: number
  Code: string
  ItemID: number
  ItemName: string
  OrderID: number | null
  BuyerEmail: string
  RecipientName: string
  Message: string
  DurationMonths: number
  Status: 'active' | 'redeemed' | 'disabled'
  CreatedAt: string
  RedeemedAt: string | null
  RedeemedEmail: string | null
  RedeemedCustomerID: number | null
  AbonementID: number | null
}

export async function checkVoucher(code: string) {
  return apiInstance.post<VoucherCheck>(`${VOUCHERS_API_URL}check/`, { Code: code })
}

export async function redeemVoucher(data: {
  Code: string
  Email: string
  FirstName?: string
  LastName?: string
}) {
  return apiInstance.post<VoucherRedemption>(`${VOUCHERS_API_URL}redeem/`, data)
}

export async function fetchVouchers() {
  return apiInstance.get<AbonementVoucher[]>(VOUCHERS_API_URL)
}

export async function fetchVoucherPDF(id: number) {
  return apiInstance.get<Blob>(`${VOUCHERS_API_URL}${id}/pdf/`, { responseType: 'blob' })
}

export async function resendVoucher(id: number, email = '') {
  return apiInstance.post(`${VOUCHERS_API_URL}${id}/resend/`, email ? { Email: email } : {})
}

export async function setVoucherDisabled(id: number, disabled: boolean) {
  return apiInstance.post<AbonementVoucher>(
    `${VOUCHERS_API_URL}${id}/${disabled ? 'disable' : 'enable'}/`
  )
}
