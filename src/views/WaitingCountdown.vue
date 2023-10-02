<script setup lang="ts">
import router from '@/router';
import { usePaymentStore } from '@/stores/PaymentStore'
import { settingsStore } from '@/stores/settings';
import { onMounted } from 'vue'

const paymentStore = usePaymentStore()
const settStore = settingsStore()
const sleep = (delay:number) => new Promise((resolve) => setTimeout(resolve, delay))
const verifyPayment = async()=>{
  paymentStore.resetVerification()
  while (true) {
    const response = await paymentStore.verifyPayment()
    if (response) {
      break;
    }
    await sleep(2000)
  }
}

onMounted(() => {
  const url = window.location.href
  const params = url.split('?')
  if(params.length<2) {
    // Wrong params structure
    router.push("/failure")
    return 
  }
  const vars = params[1].split('&')
  const queries = vars[1] + '&' + vars[0]
  paymentStore.transactionID = queries
  verifyPayment()
})

</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full grid grid-rows-5 place-items-center">
        <div class="lds-ellipsis  row-span-4">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
@import "../assets/loadingwheel.css";
.customcolor{
    background-color: v-bind(settStore.settings.Color);
}
</style>