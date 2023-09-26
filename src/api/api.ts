import axios from 'axios'
import keycloak from '@/keycloak/keycloak'
import { type Vendor } from '@/stores/vendor'
import { type Item } from '@/stores/items'
import { VENDORS_API_URL } from './endpoints'
import { ITEMS_API_URL } from './endpoints'
import { AUTH_API_URL } from './endpoints'

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
  const formData = new FormData();
  formData.append('Image', newItem.Image);
  formData.append('Name', newItem.Name);
  formData.append('Price', newItem.Price.toString());
  formData.append('Description', newItem.Description);
  return apiInstance.post(ITEMS_API_URL, formData, {
    headers: {
      accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  })
}

export async function patchItem(updatedItem: Item) {
  const formData = new FormData();
  formData.append('Image', updatedItem.Image);
  formData.append('Name', updatedItem.Name);
  formData.append('Price', updatedItem.Price.toString());
  formData.append('Description', updatedItem.Description);
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
