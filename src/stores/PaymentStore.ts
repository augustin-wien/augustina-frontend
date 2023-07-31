import type { Stripe } from "@stripe/stripe-js";
import { defineStore } from "pinia";

export const usePaymentStore = defineStore('payment',{
    state: () =>{
        return{
            agbChecked: false,
            amount: 1,
            pricePerPaper: 300,
            //the unit for price is cents (smallest unit)
            price: 300,
            tip: 0,
            digital: {digital: true}
        }
    },
    actions: {
      priceInEuros() {
        return (this.price + this.tip)/100
      },

      increment() {
          this.tip = this.tip + 100
        },
  
      // increment with custom values for cent (c)
      incrementec(c: number) {
        this.tip = this.tip + c
      },
  
      decrement() {
        if(this.tip-100 >= 0){
            this.tip = this.tip - 100
        }
      },

      epaper() {
        this.digital.digital = true
      },

      print() {
        this.digital.digital = false
      },
      // decrement with custom values for cent (c)
      decrementec(c: number) {
        if(this.tip-c >= 0){
          this.tip = this.tip - c
        }
      },
      addN(n: number) {
        this.amount++
        this.price = this.price + (this.pricePerPaper * n)
      }
      }
    }
)