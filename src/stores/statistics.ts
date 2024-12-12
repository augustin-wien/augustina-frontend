import { defineStore } from 'pinia'
import { fetchStatistics } from '@/api/api'

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

type StatisticsStoreState = {
  statistics: Statistics[]
  Items: Statistics[]
}

export const useStatisticsStore = defineStore('statistics', {
  state: () => {
    return {
      statistics: [] as Statistics[],
      Items: [] as Statistics[]
    } as StatisticsStoreState
  },
  getters: {
    statisticsList(state: StatisticsStoreState) {
      return state.statistics
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
    }
  }
})
