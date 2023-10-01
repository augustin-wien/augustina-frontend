import { defineStore } from "pinia";
import type { VivaWalletResponse } from '@/models/responseVivaWallet'
import type { VivaWalletVerification } from "@/models/verificationVivaWallet";
import router from "@/router";
import agent from '@/api/agent'

export interface orderItem {
  item: number,
  quantity: number
}

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
            tipItem: 2,

            //vivawallet 
            response: [] as VivaWalletResponse[],
            transactionID: "",
            verification: {} as VivaWalletVerification,
            timeStamp: "",
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
          if(this.tip < 10){
            this.tip = this.tip + 0.5
          }
          else {
            this.tip = this.tip + 1
          }
        },
      
        decrement() {
          if(this.tip > 10 ){
              this.tip = this.tip - 1
          }
          else if(this.tip - 0.5 >= 0){
            this.tip = this.tip - 0.5
          }
        },

      incrementTipC(c: number) {
        this.tip = this.tip + c
      },
  
      decrementTipC(c: number) {
        if(this.tip - c >= 0) {
          this.tip = this.tip - c
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

      //AGB
      checkAgb() {
        if(this.agbChecked) {
          router.push({ name: 'Payment' })
        }
        else {
          console.log('pls check AGB')
        }
      },
      setPrice(price: number) {
        this.price = price
      },
      setPricePerPaper(price: number) {
        this.pricePerPaper = price
      },
      toAGB() {
        console.log(import.meta.env.VITE_AGB_URL)
        window.open(import.meta.env.VITE_AGB_URL, "_blank");
      },

      //vivawallet methodes
      async postOrder(items: Array<orderItem>, quantity: number, vendorLicenseID: string) {
        this.response[0] = await agent.VivaWallet.postOrder(items, vendorLicenseID)
        this.url = this.response[0].SmartCheckoutURL
        window.location.href = this.url
      },
      async verifyPayment(){
        if(this.transactionID === ""){
          console.log('id undefined')
        }
        else {
          try{
            this.verification = await agent.VivaWallet.verifyPayment(this.transactionID)
            this.timeStamp = this.verification.TimeStamp
          }catch (error){
            router.push('/failure')
          }
        }
        if(this.timeStamp != ""){
          router.push('/paymentconfirmation')
        }
        else{
          router.push('/failure')
        }
      }
    }
  }
)