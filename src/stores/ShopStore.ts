import { defineStore } from 'pinia'
import { fetchItems } from '@/api/api'
import { type Item } from './items'
import { usePaymentStore } from './payment'
  
const paymentStore = usePaymentStore()

export interface Amount {
  item: number,
  quantity: number
}

export const useShopStore = defineStore('shop',{
    state: () => {
        return {
          items: [] as Item[],
          amount: [] as Amount[],
          finalitems: [] as Amount[]
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
        reset(){
          this.amount = []
          this.finalitems = []
          paymentStore.sum = 0
          paymentStore.tip = 0
        },
        getAmount(id: number){
          const item =  this.amount.find(item => item.item == id)
          if (item){
            return item.quantity
          }
          return 0
        },
        getName(id: number){
          for (const item of this.items){
            if(id == item.ID){
              return item.Name
            }
          }
          return "Spende"
        },
        removeEmty() {
          this.finalitems = []
          for (const entry of this.amount){
            if(entry.quantity != 0){
              this.finalitems.push(entry)
            }
          }
        },
        getPriceInEuro(id: number){
          const item = this.items.find(item => item.ID == id)
          if (item){
            return item.Price / 100
          } 
          return 0
        },
        getItembyId(id: number){
          for (const entry of this.items){
            if(entry.ID == id){
              return entry
            }
          }
          return {
              Description: '',
              ID: 0,
              Image: '',
              Name: '',
              Price: 0
          }
        }
    }
})