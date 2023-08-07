import axios from "axios";
import { defineStore } from "pinia";
import { type AxiosResponse } from "axios";
import router from "@/router";

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
            testprice: 300,
            tip: 0,

            //vivawallet 
            response: [] as AxiosResponse[],
            transactionID: "",
            verification: [] as AxiosResponse[],
            verified: false,
            url: ""
        }
    },
    actions: {
      priceInEuros() {
        return (this.testprice + this.tip)/100
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
        this.testamount++
        this.testprice = this.testprice + (this.pricePerPaper * n)
      },

      //vivawallet methodes
      async postPrice(price: number) {
        this.response.push(await axios.post('http://localhost:3000/api/vivawallet/transaction_order/', {amount: price}, {headers: {'Content-Type': 'application/json'}}))
        const data = this.response[0].data
        this.url = data.SmartCheckoutURL
        window.location.href = this.url
      },
      async verifyPayment(t: string){
        if(this.transactionID === ""){
          console.log('id undefined')
        }
        else {
          this.verification.push(await axios.post('http://localhost:3000/api/vivawallet/transaction_verification/', {transactionID: t}, {headers: {'Content-Type': 'application/json'}}))
          const data = this.verification[0].data
          this.verified = data.Verification
          router.push('/paymentconfirmation')
        }
      }
    }
  }
)