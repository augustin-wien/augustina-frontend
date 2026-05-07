import { defineStore } from 'pinia'
import { fetchStatistics, fetchVendorUsageStatistics } from '@/api/api'

//define interface to store data from backend properly
export interface StatisticsItem {
  ID: number
  Name: string
  SumAmount: number
  SumQuantity: number
}
export interface StatisticsItemMinimal {
  id: number
  value: number
  name: string
}
export interface Statistics {
  ID: number
  Name: string
  SumAmount: number
  SumQuantity: number
  Items: StatisticsItem[] | null
}

export interface VendorUsageStatistics {
  From: string
  To: string
  TotalVendors: number
  UsedVendors: number
  UnusedVendors: number
  UsedPercentage: number
  UnusedPercentage: number
}

type StatisticsStoreState = {
  statistics: Statistics[]
  Items: Statistics[]
  vendorUsageStatistics: VendorUsageStatistics | null
}

export const useStatisticsStore = defineStore('statistics', {
  state: () => {
    return {
      statistics: [] as Statistics[],
      Items: [] as Statistics[],
      vendorUsageStatistics: null as VendorUsageStatistics | null
    } as StatisticsStoreState
  },
  getters: {
    statisticsList(state: StatisticsStoreState) {
      return state.statistics
    },
    vendorUsageStats(state: StatisticsStoreState) {
      return state.vendorUsageStatistics
    }
  },

  actions: {
    async getPayments(startDate: Date, endDate: Date) {
      try {
        const data = await fetchStatistics(startDate, endDate, '')
        //@ts-ignore
        this.statistics = data.data.Items
        //@ts-ignore
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    },

    async getVendorUsage(startDate: Date, endDate: Date) {
      try {
        const data = await fetchVendorUsageStatistics(startDate, endDate)
        //@ts-ignore
        this.vendorUsageStatistics = data.data
      } catch (error) {
        // eslint-disable-next-line no-console
        console.log(error)
      }
    }
  }
})
