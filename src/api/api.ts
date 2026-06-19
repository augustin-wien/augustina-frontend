import keycloak from '@/keycloak/keycloak'
import { type Item } from '@/stores/items'
import { type PaymentsForPayout, type Payout } from '@/stores/payout'
import { type Settings } from '@/stores/settings'
import { type Vendor } from '@/stores/vendor'
import axios from 'axios'

import {
  AUTH_API_URL,
  ITEMS_API_URL,
  ITEMS_BACKOFFICE_API_URL,
  PAYMENTS_FOR_PAYOUT_API_URL,
  PAYMENT_API_URL,
  PAYOUT_API_URL,
  SETTINGS_API_URL,
  VENDORS_API_URL,
  VENDORS_LOCATION_URL,
  VENDOR_ME_API_URL,
  PAYMENT_STATISTICS_API_URL,
  PDF_DOWNLOAD_API_URL,
  STYLES_URL,
  MAIL_TEMPLATES_API,
  BASE_URL,
  ORDERS_UNVERIFIED_API_URL,
  VENDOR_STATISTICS_API_URL,
  CUSTOMERS_API_URL,
  ABONEMENTS_API_URL
} from './endpoints'

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

apiInstance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response.status === 401) {
      keycloak.keycloak?.login()
    }

    return Promise.reject(error)
  }
)

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

export async function patchVendor(updatedVendor: Vendor) {
  return apiInstance.put(`${VENDORS_API_URL}${updatedVendor.ID}/`, JSON.stringify(updatedVendor), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
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

export async function removeVendor(vendorId: number) {
  return apiInstance.delete(`${VENDORS_API_URL}${vendorId}/`)
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

export async function fetchItemsBackoffice() {
  return apiInstance.get<Item[]>(`${ITEMS_BACKOFFICE_API_URL}`)
}

export async function fetchLicenseGroups() {
  return apiInstance.get<string[]>(`${ITEMS_API_URL}licensegroups/`)
}
export async function postItems(newItem: Item) {
  return apiInstance.postForm(ITEMS_API_URL, newItem)
}

export async function patchItem(updatedItem: Item) {
  return apiInstance.putForm(`${ITEMS_API_URL}${updatedItem.ID}/`, updatedItem)
}

export async function removeItem(itemId: number) {
  return apiInstance.delete(`${ITEMS_API_URL}${itemId}/`)
}

//settings
export async function fetchSettings() {
  return apiInstance.get(SETTINGS_API_URL)
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
  formData.append('UseVendorLicenseIdInShop', (updatedSettings.UseVendorLicenseIdInShop ?? false).toString())
  formData.append('Favicon', updatedSettings.Favicon || '')
  formData.append('QRCodeSettings', updatedSettings.QRCodeSettings ?? '')
  formData.append('QRCodeEnableLogo', (updatedSettings.QRCodeEnableLogo ?? false).toString())
  formData.append('UseTipInsteadOfDonation', (updatedSettings.UseTipInsteadOfDonation ?? false).toString())
  formData.append('ShopLanding', (updatedSettings.ShopLanding ?? false).toString())
  formData.append('DigitalItemsUrl', updatedSettings.DigitalItemsUrl ?? '')
  formData.append('AbonementUrl', updatedSettings.AbonementUrl ?? '')
  formData.append('AbonementEnabled', (updatedSettings.AbonementEnabled ?? false).toString())
  formData.append('POSEnabled', (updatedSettings.POSEnabled ?? true).toString())
  formData.append('WordPressInviteURL', updatedSettings.WordPressInviteURL ?? '')
  formData.append('WordPressInviteAPIKey', updatedSettings.WordPressInviteAPIKey ?? '')
  formData.append('WordPressInviteTTL', (updatedSettings.WordPressInviteTTL ?? 604800).toString())
  formData.append('OrgaCoversTransactionCosts', (updatedSettings.OrgaCoversTransactionCosts ?? true).toString())
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

export async function fetchVendorLocations(vendorId: number) {
  return apiInstance.get(`${VENDORS_API_URL}${vendorId}/locations/`)
}

export async function postVendorLocation(vendorId: number, location: any) {
  return apiInstance.post(`${VENDORS_API_URL}${vendorId}/locations/`, JSON.stringify(location), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

export async function patchVendorLocation(vendorId: number, locationId: number, location: any) {
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

export async function postVendorComment(vendorId: number, comment: any) {
  return apiInstance.post(`${VENDORS_API_URL}${vendorId}/comments/`, JSON.stringify(comment), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

export async function patchVendorComment(vendorId: number, commentId: number, comment: any) {
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
