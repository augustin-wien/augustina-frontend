import { defineStore } from 'pinia'

export const usePriceStore = defineStore('price', {
  
    state: () =>{
      return{
        price: 3,
      }
    },
    
    actions: {
      increment() {
        this.price++
      },

      // increment with custom values for euro (e) and cent (c)
      incrementec(e: number) {
        this.price = this.price + e
      },
  
      decrement() {
        if(this.price-1 >= 3){
            this.price--
        }
      },

      // decrement with custom values for euro (e) and cent (c)
      decrementec(e: number) {
        if(this.price-e >= 3){
          this.price = this.price - e
        }
      }
    }
  }
  )
  
