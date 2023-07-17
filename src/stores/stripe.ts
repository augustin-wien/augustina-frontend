import { defineStore } from "pinia";
import { loadStripe, type Stripe } from "@stripe/stripe-js";
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
    },
    actions: {
        async load(publicKey: string) {
            try{
                const stripeResponse = agent.StripeLoad.load

            }
            catch(error){
                alert(error);
                console.log(error);
            }
        },
    }
})
