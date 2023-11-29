import { defineStore } from 'pinia'
import { getLocations } from '@/api/api'

export interface VendorLocation {
    firstName: string,
    latitude: number,
    licenseID: string,
    longitude: number
}

export const useMapStore = defineStore('mapStore', {
    state: ()=> {
        return {
            vendors: [] as VendorLocation[],
        }
    },
    actions: {
     async getLocations() {
        try {
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