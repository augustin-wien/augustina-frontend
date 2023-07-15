import { defineStore } from "pinia";
import { StripeElementCard } from '@vue-stripe/vue-stripe'
import { loadStripe, type Stripe } from "@stripe/stripe-js";
import agent from '@/api/agent'

export const stripeStore = defineStore('stripe',{
    state: () =>{
        return{
            elements: null,
            token: null,
            cardNumber: null,
            cardExpiry: null,
            cardCvc: null,
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

        setUpStripe() {
            if (window.Stripe === undefined) {
              alert('Stripe V3 library not loaded!');
            } else {
              const stripe = window.Stripe('tc2yNFPJ9DYSmhNnf04vCUmbM3f MS94WK2w1YuhiTcxMIti8p3etufbrsr1oJpG2OUaLUmNUTU00cxAmOXLZ');
              this.elements = stripe.elements()
            }
        }
    }
})
