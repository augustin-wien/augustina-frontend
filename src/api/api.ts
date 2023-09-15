import axios from 'axios'
import keycloak from '@/keycloak/keycloak'
import { type Vendor } from '@/stores/vendor'
import { type Item } from '@/stores/items'

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
  return apiInstance.get('http://localhost:3000/api/auth/hello/')
}

// vendors
export async function fetchVendors() {
  return apiInstance.get<Vendor[]>('http://localhost:3000/api/vendors/')
}
export async function postVendors(newVendor: Vendor) {
  return apiInstance.post('http://localhost:3000/api/vendors/', JSON.stringify(newVendor), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

export async function patchVendor(updatedVendor: Vendor) {
  return apiInstance.put(
    `http://localhost:3000/api/vendors/${updatedVendor.ID}/`,
    JSON.stringify(updatedVendor),
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'application/json'
      }
    }
  )
}

export async function removeVendor(vendorId: number) {
  return apiInstance.delete(`http://localhost:3000/api/vendors/${vendorId}/`)
}

// items
export async function fetchItems() {
  return apiInstance.get<Item[]>('http://localhost:3000/api/items/')
}

export async function postItems(newItem: Item) {
  return apiInstance.post('http://localhost:3000/api/items/', JSON.stringify(newItem), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  })
}

export async function patchItem(updatedItem: Item) {
  return apiInstance.put(
    `http://localhost:3000/api/items/${updatedItem.ID}/`,
    JSON.stringify(updatedItem),
    {
      headers: {
        accept: 'application/json',
        'Content-Type': 'multipart/form-data'
      }
    }
  )
}

export async function removeItem(itemId: number) {
  return apiInstance.delete(`http://localhost:3000/api/items/${itemId}/`)
}
