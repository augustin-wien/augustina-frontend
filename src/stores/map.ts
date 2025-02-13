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
        const vendors_data = data.data

        if (!vendors_data) {
          this.vendors = []
          return
        }

        //filter out vendors with no location
        this.vendors = vendors_data.filter(
          (vendor: VendorLocation) => vendor.latitude && vendor.longitude
        )
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    }
  }
})
