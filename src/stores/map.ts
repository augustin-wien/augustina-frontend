import { defineStore } from 'pinia'
import { getLocations } from '@/api/api'

export interface VendorLocation {
  firstName: string
  latitude: number
  licenseID: string
  longitude: number
  id: number
}

export const useMapStore = defineStore('mapStore', {
  state: () => {
    return {
      vendors: [] as VendorLocation[]
    }
  },
  actions: {
    async getLocations() {
      try {
        //timeout to prevent deadlock
        await new Promise((f) => setTimeout(f, 500))
        const data = await getLocations()
        //@ts-ignore
        this.vendors = data.data
        //@ts-ignore
      } catch (error) {
        console.log(error)
      }
    }
  }
})
