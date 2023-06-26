import { defineStore } from 'pinia'

export const usePriceStore = defineStore('price', {
  
    state: () =>{
      return{
        value: 3,
        digital: {digital: true}
      }
    },
    
    actions: {
      increment() {
        this.value++
      },

      // increment with custom values for euro (e) and cent (c)
      incrementec(e: number) {
        this.value = this.value + e
      },
  
      decrement() {
        if(this.value-1 >= 3){
            this.value--
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
        if(this.value-e >= 3){
          this.value = this.value - e
        }
      }
    }
  }
  )
  
