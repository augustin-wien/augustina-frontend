import axios from 'axios'
import keycloak from '@/keycloak/keycloak'
import { type Vendor } from '@/stores/vendor'
import { type Item } from '@/stores/items'

const instance = axios.create({
  withCredentials: true
})

instance.interceptors.request.use(
  (config) => {
    if (keycloak.authenticated) {
      config.headers.Authorization = `Bearer ${keycloak.token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export function getAuthHello() {
  return instance.get('http://localhost:3000/api/auth/hello/')
}

// vendors
export async function fetchVendors() {
  return instance.get<Vendor[]>('http://localhost:3000/api/vendors/')
}
export async function postVendors(newVendor: Vendor) {
  return instance.post('http://localhost:3000/api/vendors/', JSON.stringify(newVendor), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'application/json'
    }
  })
}

export async function patchVendor(updatedVendor: Vendor) {
  return instance.put(
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
  return instance.delete(`http://localhost:3000/api/vendors/${vendorId}/`)
}

// items
export async function fetchItems() {
  return instance.get<Item[]>('http://localhost:3000/api/items/')
}

export async function postItems(newItem: Item) {
  return instance.post('http://localhost:3000/api/items/', JSON.stringify(newItem), {
    headers: {
      accept: 'application/json',
      'Content-Type': 'multipart/form-data'
    }
  })
}

export async function patchItem(updatedItem: Item) {
  return instance.put(
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
  return instance.delete(`http://localhost:3000/api/items/${itemId}/`)
}
