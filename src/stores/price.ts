import { ref, computed } from 'vue'
import { defineStore } from 'pinia'
import { storeToRefs } from 'pinia'

export const usePriceStore = defineStore('price', {
  
    state: () =>{
      return{
        value: 3
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
    }
  }
  )
  