import axios from 'axios'
import { defineStore } from 'pinia'

//define interface to store data from backend properly
interface Vendor {
  account: number
  email: string
  firstName: string
  id: number
  keycloakID: string
  lastName: string
  lastPayout: {
    infinityModifier: number
    time: string
    valid: true
  }
  licenseID: string
  urlID: string
}

export const vendorsStore = defineStore('vendors', {
  state: () => {
    return {
      vendors: [] as Vendor[]
    }
  },

  getters: {
    getVendors(state) {
      return state.vendors
    }
  },

  actions: {
    async fetchVendors() {
      try {
        const data = await axios.get<Vendor[]>('http://localhost:3000/api/vendors/')
        this.vendors = data.data
        console.log(this.vendors)
        console.log('Vendors fetched from database')
      } catch (error) {
        alert(error)
        console.log(error)
      }
    }
  }
})
