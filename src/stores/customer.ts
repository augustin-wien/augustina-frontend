import {
  fetchCustomers,
  getCustomer,
  postCustomer,
  putCustomer,
  removeCustomer,
  fetchCustomerAbonements,
  fetchActiveAbonements,
  postAbonement,
  putAbonement,
  removeAbonement
} from '@/api/api'
import { defineStore } from 'pinia'
import { ref } from 'vue'

export interface Customer {
  id: number
  keycloakid: string
  email: string
  firstname: string
  lastname: string
  licensegroups: string[]
  created_at?: string
  updated_at?: string
}

export interface Abonement {
  id: number
  customer_id: number
  item_id: number
  from_date: string
  to_date: string
  status: string
  created_at?: string
  updated_at?: string
}

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([])
  const customer = ref<Customer | null>(null)
  const abonements = ref<Abonement[]>([])
  const activeCustomerIds = ref<Set<number>>(new Set())

  async function getCustomers() {
    try {
      const response = await fetchCustomers()
      customers.value = response.data
    } catch (error) {
      console.error('Error fetching customers:', error)
    }
  }

  async function getCustomerById(id: number) {
    try {
      const response = await getCustomer(id)
      customer.value = response.data
    } catch (error) {
      console.error('Error fetching customer:', error)
    }
  }

  async function createCustomer(data: Partial<Customer>) {
    const response = await postCustomer(data)
    await getCustomers()
    return response.data as Customer
  }

  async function updateCustomer(id: number, data: Partial<Customer>) {
    const response = await putCustomer(id, data)
    customer.value = response.data
    return response.data as Customer
  }

  async function deleteCustomer(id: number) {
    await removeCustomer(id)
    await getCustomers()
  }

  async function getAbonementsByCustomer(customerId: number) {
    try {
      const response = await fetchCustomerAbonements(customerId)
      abonements.value = response.data ?? []
    } catch (error) {
      console.error('Error fetching abonements:', error)
      abonements.value = []
    }
  }

  async function getActiveCustomerIds() {
    try {
      const response = await fetchActiveAbonements()
      const items: Array<{ customer: Customer }> = response.data ?? []
      activeCustomerIds.value = new Set(items.map((entry) => entry.customer.id))
    } catch (error) {
      console.error('Error fetching active abonements:', error)
    }
  }

  async function createAbonement(data: Partial<Abonement>) {
    const response = await postAbonement(data)
    return response.data as Abonement
  }

  async function updateAbonement(id: number, data: Partial<Abonement>) {
    const response = await putAbonement(id, data)
    return response.data as Abonement
  }

  async function deleteAbonement(id: number) {
    await removeAbonement(id)
  }

  return {
    customers,
    customer,
    abonements,
    activeCustomerIds,
    getCustomers,
    getCustomerById,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getAbonementsByCustomer,
    getActiveCustomerIds,
    createAbonement,
    updateAbonement,
    deleteAbonement
  }
})
