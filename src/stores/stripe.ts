import { defineStore } from "pinia";
import agent from '@/api/agent'

export const useStripeStore = defineStore('stripe',{
    state: () =>{
        return{
            stripe: null,
            token: null,
            cardNumber: null,
            cardExpiry: null,
            cardCvc: null,
            loaded: false,
        }
    }
})
