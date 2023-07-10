import { defineStore } from "pinia";
import { StripeElementCard } from '@vue-stripe/vue-stripe'
import { computed } from "vue";

export const stripeStore = defineStore('stripe',{
    state: () =>{
        return{
            token: null,
            cardNumber: null,
            cardExpiry: null,
            cardCvc: null,
        }
    },

})
