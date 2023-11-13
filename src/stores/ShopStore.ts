import { defineStore } from 'pinia'
import { fetchItems } from '@/api/api'
import { type Item } from './items'
import { usePaymentStore } from './payment'
  
const paymentStore = usePaymentStore()
//Item IDs of Items, that should not be displayed in the shop (4: License for E-Paper; 5: E-Paper)
const itemsBlacklist = [4]

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
              for (const id of itemsBlacklist){
                this.items = this.items.filter(item => item.ID != id)
              }
            } catch (error) {
              console.log(error)
            }
          },
        addItem(id: number, price: number){
          let inList = false
          for (const item of this.amount){
            if(id == item.item){
              inList = true
              item.quantity++
            }
          }
          if(inList == false){
            this.amount.push({item: id, quantity: 1})
          }
          paymentStore.sum += price
        },
        subtractItem(id: number, price: number){
          for (const item of this.amount){
            if(id == item.item && item.quantity > 0){
              item.quantity--
              paymentStore.sum -= price
            }
          }
        },
        getAmount(id: number){
          const inList = false
          for (const item of this.amount){
            if(id == item.item){
              return item.quantity
            }
          }
          return 0
        },
        getName(id: number){
          for (const item of this.items){
            if(id == item.ID){
              return item.Name
            }
          }
          return "Not found"
        }
    }
})