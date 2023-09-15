import { defineStore } from 'pinia'

export const usePriceStore = defineStore('price', {
  
    state: () =>{
      return{
        //the unit for price is cents (smallest unit)
        price: 300, 
        digital: {digital: true}
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

      epaper() {
        this.digital.digital = true
      },

      print() {
        this.digital.digital = false
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
  
