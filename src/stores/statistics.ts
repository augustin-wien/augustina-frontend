import { defineStore } from 'pinia'
import { fetchStatistics } from '@/api/api'

//define interface to store data from backend properly
export interface Statistics {
  ID: number
  Name: string
  SumAmount: number
  SumQuantity: number
  Items:
    | [
        {
          ID: number
          Name: string
          SumAmount: number
          SumQuantity: number
        }
      ]
    | null
}

export const useStatisticsStore = defineStore('statistics', {
  state: () => {
    return {
      statistics: [] as Statistics[]
    }
  },
  getters: {
    statisticsList(state: any) {
      return state.statistics
    }
  },

  actions: {
    async getPayments(startDate: Date, endDate: Date) {
      try {
        const data = await fetchStatistics(startDate, endDate, '')
        //@ts-ignore
        this.statistics = data.data
        //@ts-ignore
      } catch (error) {
        console.log(error)
      }
    }
  }
})
