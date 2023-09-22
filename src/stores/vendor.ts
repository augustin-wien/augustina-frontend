import agent from '@/api/agent'
import { defineStore } from 'pinia'

export const vendorStore = defineStore('vendor', {
  state: () => {
    return {
      vendorid: "",
      vendorName: ""
    }
  },
  actions: {
    async checkID() {
      this.vendorName = (await agent.Vendor.checkID()).name
      if(this.vendorName !== ""){
        
      }
    }
  }
})
