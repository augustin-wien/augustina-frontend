import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useCounterStore = defineStore('counter', () => {
  const count = ref(0)
  const doubleCount = computed(() => count.value * 2)
  function increment() {
    count.value++
  }

  return { count, doubleCount, increment }
})

export const useColorStore = defineStore('color', {
  
  state: () =>{
    return{
      rgb: [0, 0, 0],
      color: "red"
    }
  },
  
  actions: {
    increment(i: number) {
      if(this.rgb[i] < 255){
        this.rgb[i]++
      }
    },

    decrement(i: number) {
      if(this.rgb[i] > 0){
        this.rgb[i]--
      }
    },


  }

}
)
