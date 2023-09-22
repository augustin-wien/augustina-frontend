<script setup lang="ts">
import { onMounted } from 'vue';
import { usePaymentStore } from '@/stores/PaymentStore'


const paymentStore = usePaymentStore()

onMounted(() => {
  paymentStore.postOrder(1, 1, 1)
})
</script> 

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main className="h-full grid grid-rows-6 place-items-center">
        <div class="lds-ellipsis row-span-4">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </main>
    </template>
  </component>
</template>

<style scoped>@import "../assets/loadingwheel.css"</style>