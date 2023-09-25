import axios from 'axios'
import keycloak from '@/keycloak/keycloak'
import { type Vendor } from '@/stores/vendor'
import { type Item } from '@/stores/items'
import { type Settings } from '@/stores/settings'
import { VENDORS_API_URL } from './endpoints'
import { ITEMS_API_URL } from './endpoints'
import { AUTH_API_URL } from './endpoints'
import { SETTINGS_API_URL } from './endpoints'
import { PAYMENT_API_URL } from './endpoints'

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

// items
export async function fetchItems() {
  return apiInstance.get<Item[]>(ITEMS_API_URL)
}

export async function postItems(newItem: Item) {
  return apiInstance.post(VENDORS_API_URL, JSON.stringify(newItem), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  })
}

export async function patchItem(updatedItem: Item) {
  return apiInstance.put(`${VENDORS_API_URL}${updatedItem.ID}/`, JSON.stringify(updatedItem), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  })
}

export async function removeItem(itemId: number) {
  return apiInstance.delete(`${VENDORS_API_URL}${itemId}/`)
}

//settings
export async function fetchSettings() {
  return apiInstance.get(SETTINGS_API_URL)
}

export async function patchSettings(updatedSettings: Settings) {
  return apiInstance.put(
    `${SETTINGS_API_URL}${updatedSettings}/`,
    JSON.stringify(updatedSettings),
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
export async function fetchPayments(startDate: string, endDate: string) {
  return apiInstance.get(`${PAYMENT_API_URL}?from=${startDate}&to=${endDate}`)
}
