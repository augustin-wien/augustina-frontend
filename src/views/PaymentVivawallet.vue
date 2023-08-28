<script setup lang="ts">
  import { onMounted } from 'vue';
  import { usePaymentStore } from '@/stores/PaymentStore'
  

  const paymentStore = usePaymentStore()

  onMounted(() => {
    paymentStore.postPrice(paymentStore.price + paymentStore.tipInCents())
  })
</script> 

<template>
  <main className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header>
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div class="lds-ellipsis row-span-4"><div></div><div></div><div></div><div></div></div>
  </main>
</template>

<style scoped>
  @import "../assets/loadingwheel.css"
</style>