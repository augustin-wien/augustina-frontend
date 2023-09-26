import agent from '@/api/agent'
import router from '@/router'
import { defineStore } from 'pinia'

export const useVendorStore = defineStore('vendor', {
  state: () => {
    return {
      vendorid: "",
      vendorName: ""
    }
  },
  actions: {
    async checkID(vendorId: string | string[]) {
      const response = await agent.Vendor.checkID(vendorId)
      this.vendorName = response.FirstName
      if(this.vendorName !== ""){
        router.push({name: "LandingPage"})
      }
      else{
      }
    }
  }
})
