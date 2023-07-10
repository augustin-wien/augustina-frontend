import { defineStore } from 'pinia'

export const vendorStore = defineStore('vendor', {
  state: () => {
    return {
      vendorid: String
    }
  }
})
