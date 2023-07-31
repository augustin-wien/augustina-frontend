import axios from "axios";
import { defineStore } from "pinia";
import { type AxiosResponse } from "axios";
import { type VivaWalletResponse } from "@/models/vivawalletresponse";

export const usePaymentStore = defineStore('payment',{
    state: () =>{
        return{
            agbChecked: false,
            testamount: 1,
            pricePerPaper: 300,
            digital: {digital: true},
            //the unit for price is cents (smallest unit)
            testprice: 300,
            tip: 0,

            //vivawallet 
            response: [] as AxiosResponse[],
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
        const sleep = (ms: number) => (response: AxiosResponse) => new Promise<AxiosResponse>(resolve => setTimeout(() => resolve(response), ms))
        this.response.push(await axios.post('http://localhost:3000/api/transaction/', {amount: price}, {headers: {'Content-Type': 'application/json'}}).then(sleep(50)))
        const data = this.response[0].data
        this.url = data.SmartCheckoutURL
      },
      }
    }
)