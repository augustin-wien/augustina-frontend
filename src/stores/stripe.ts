import { defineStore } from 'pinia'

export const useStripeStore = defineStore('stripe', {
  state: () => {
    return {
      stripe: null,
      token: null,
      cardNumber: null,
      cardExpiry: null,
      cardCvc: null,
      loaded: false
    }
  }
})
