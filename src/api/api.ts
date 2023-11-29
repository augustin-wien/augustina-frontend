import keycloak from '@/keycloak/keycloak'
import { type Item } from '@/stores/items'
import { type PaymentsForPayout, type Payout } from '@/stores/payout'
import { type Settings } from '@/stores/settings'
import { type Vendor } from '@/stores/vendor'
import { type VendorLocation } from '@/stores/map'
import axios from 'axios'
import { AUTH_API_URL, ITEMS_API_URL, ITEMS_BACKOFFICE_API_URL, PAYMENTS_FOR_PAYOUT_API_URL, PAYMENT_API_URL, PAYOUT_API_URL, SETTINGS_API_URL, VENDORS_API_URL, VENDORS_LOCATION_URL } from './endpoints'

export const apiInstance = axios.create({
  withCredentials: true
})

apiInstance.interceptors.request.use(
  (config) => {
    if (keycloak && keycloak.keycloak.authenticated) {
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
      keycloak.keycloak.login()
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

// items
export async function fetchItems() {
  return apiInstance.get<Item[]>(ITEMS_API_URL)
}

export async function fetchItemsBackoffice() {
  return apiInstance.get<Item[]>(`${ITEMS_BACKOFFICE_API_URL}`)
}
export async function postItems(newItem: Item) {
  return apiInstance.post(ITEMS_API_URL, JSON.stringify(newItem), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

export async function patchItem(updatedItem: Item) {
  const formData = new FormData()
  formData.append('Image', updatedItem.Image)
  formData.append('Name', updatedItem.Name)
  formData.append('Price', updatedItem.Price.toString())
  formData.append('Description', updatedItem.Description)
  return apiInstance.put(`${ITEMS_API_URL}${updatedItem.ID}/`, formData, {
    headers: {
      accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  })
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
  formData.append('Color', updatedSettings.Color)
  formData.append('FontColor', updatedSettings.FontColor);
  formData.append('Logo', updatedSettings.Logo)
  formData.append('MainItem', updatedSettings.MainItem.toString())
  formData.append('OrgaCoversTransactionCosts', updatedSettings.OrgaCoversTransactionCosts.toString());
  formData.append('MaxOrderAmount', updatedSettings.MaxOrderAmount.toString());

  return apiInstance.put(
    `${SETTINGS_API_URL}`,
    formData,
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

//payments list
//sind rfc dates strings?
export async function fetchPayments(startDate: Date, endDate: Date, filter: string) {
  return apiInstance.get(`${PAYMENT_API_URL}?from=${startDate.toISOString()}&to=${endDate.toISOString()}${filter ? '&' + filter : ''}`)
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

export async function getLocations() {
  console.log((await apiInstance.get(VENDORS_LOCATION_URL)).data)
  return apiInstance.get(VENDORS_LOCATION_URL)
}
