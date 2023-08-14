import { defineStore } from "pinia";
import type { VivaWalletResponse } from '@/models/responseVivaWallet'
import type { VivaWalletVerification } from "@/models/verificationVivaWallet";
import router from "@/router";
import agent from '@/api/agent'


export const usePaymentStore = defineStore('payment',{
    state: () =>{
        return{
            //Payment service (0: Stripe, 1: vivawallet)
            paymentservice: 1,

            agbChecked: false,
            testamount: 1,
            pricePerPaper: 300,
            digital: {digital: true},
            //the unit for price is cents (smallest unit)
            price: 300,
            //the unit for tip is euros
            tip: 0,

            //vivawallet 
            response: [] as VivaWalletResponse[],
            transactionID: "",
            verification: [] as VivaWalletVerification[],
            verified: false,
            url: ""
        }
    },
    actions: {
      priceInEuros() {
        return this.price/100 + this.tip
      },

      tipInCents() {
        return (this.tip*100)
      },

      increment() {
          this.tip = this.tip + 100
        },
  
      // increment with custom values for cent (c)
      incrementPriceC(c: number) {
        this.tip = this.tip + c
      },

      incrementTipC(c: number) {
        this.tip = this.tip + c
      },
  
      decrementTipC(c: number) {
        if(this.tip - c >= 0) {
          this.tip = this.tip - c
        }
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
        this.testamount++
        this.price = this.price + (this.pricePerPaper * n)
      },

      //vivawallet methodes
      async postPrice(price: number) {
        this.response[0] = await agent.VivaWallet.postPrice(price)
        this.url = this.response[0].SmartCheckoutURL
        window.location.href = this.url
      },
      async verifyPayment(){
        if(this.transactionID === ""){
          console.log('id undefined')
        }
        else {
          this.verification[0] = await agent.VivaWallet.verifyPayment(this.transactionID)
          this.verified = this.verification[0].verification
          router.push('/paymentconfirmation')
        }
      }
    }
  }
)