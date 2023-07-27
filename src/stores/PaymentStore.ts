import type { Stripe } from "@stripe/stripe-js";
import { defineStore } from "pinia";

export const usePaymentStore = defineStore('payment',{
    state: () =>{
        return{
            agbChecked: false,
            //the unit for price is cents (smallest unit)
            price: 300,
            tip: 0,
            digital: {digital: true}
        }
    },
    actions: {
      confirm(stripe:Stripe, elements) {
          stripe.confirmPayment({
              elements,
              confirmParams: {
                // Return URL where the customer should be redirected after the PaymentIntent is confirmed.
                return_url: 'https://example.com',
              },
            })
            .then(function(result) {
              if (result.error) {
                // Inform the customer that there was an error.
              }
            });
      },

      priceInEuros() {
        return (this.price + this.tip)/100
      },

      increment() {
          this.tip = this.tip + 100
        },
  
      // increment with custom values for euro (e) and cent (c)
      incrementec(e: number) {
        this.tip = this.tip + e
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
      // decrement with custom values for euro (e) and cent (c)
      decrementec(e: number) {
        if(this.tip-e >= 0){
          this.tip = this.tip - e
        }
      }
      }
    }
)