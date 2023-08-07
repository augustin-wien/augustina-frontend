<script setup lang="ts">
  import { onMounted } from 'vue';
  import { usePaymentStore } from '@/stores/PaymentStore'
  

  const paymentStore = usePaymentStore()

  onMounted(() => {
    paymentStore.postPrice(paymentStore.pricePerPaper*paymentStore.testamount+paymentStore.tip)
  })

</script> 

<template>
  <main className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header >
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div className="row-span-2 grid grid-rows-2 grid-cols-2">
      {{ paymentStore.url }}
    </div>
    <input v-model="paymentStore.transactionID" class="bg-green-300" type="text">
    <div>
      {{ paymentStore.transactionID }}
    </div>
    <div>
      <RouterLink to="/verifying"> Weiter </RouterLink>
    </div>
  </main>
</template>
