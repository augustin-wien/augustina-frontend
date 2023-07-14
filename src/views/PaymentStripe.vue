<template>
  <div>
    <label>Card Number</label>
    <div id="card-number"></div>
    <label>Card Expiry</label>
    <div id="card-expiry"></div>
    <label>Card CVC</label>
    <div id="card-cvc"></div>
    <div id="card-error"></div>
    <button id="custom-button">Generate Token</button>
  </div>
</template>

<script setup lang="ts">
  import { StripeElementCard } from '@vue-stripe/vue-stripe';
  import { loadStripe } from '@stripe/stripe-js';
  import { onMounted } from 'vue'

  let stripe = null;
  onMounted(async () => {
    //public Key will become an env variable
    stripe = await loadStripe("pk_test_51NTszUJEpEVZWKtc2yNFPJ9DYSmhNnf04vCUmbM3fMS94WK2w1YuhiTcxMIti8p3etufbrsr1oJpG2OUaLUmNUTU00cxAmOXLZ")
    console.log(stripe)
  })
</script>