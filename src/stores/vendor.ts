import agent from '@/api/agent'
import { defineStore } from 'pinia'

export const useVendorStore = defineStore('vendor', {
  state: () => {
    return {
      vendorid: "",
      vendorName: ""
    }
  },
  actions: {
    async checkID(vendorId: string) {
      const response = await agent.Vendor.checkID(vendorId)
      this.vendorName = response.name
      if(this.vendorName !== ""){
        
      }
    }
  }
})
