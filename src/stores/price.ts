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
  
      decrement() {
        if(this.value > 3){
            this.value--
        }
      },

      epaper() {
        this.digital.digital = true
      },

      print() {
        this.digital.digital = false
      }
    }
  }
  )
  