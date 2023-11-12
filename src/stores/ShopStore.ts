import { defineStore } from 'pinia'
import { fetchItems } from '@/api/api'
import { type Item } from './items'
  
export interface Amount {
  item: number,
  quantity: number
}

export const useShopStore = defineStore('shop',{
    state: () => {
        return {
          items: [] as Item[],
          amount: [] as Amount[]
        }
      },
    actions: {
        async getItems() {
            try {
              const data = await fetchItems()
              this.items = data.data
            } catch (error) {
              console.log(error)
            }
          },
        addItem(id: number){
          var inList = false
          for (var item of this.amount){
            if(id == item.item){
              inList = true
              item.quantity++
            }
          }
          if(inList == false){
            this.amount.push({item: id, quantity: 1})
          }
        },
        getAmount(id: number){
          var inList = false
          for (var item of this.amount){
            if(id == item.item){
              return item.quantity
            }
          }
          return 0
        }
    }
})