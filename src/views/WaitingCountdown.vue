<script setup lang="ts">
import router from '@/router'
import { usePaymentStore } from '@/stores/payment'
import { settingsStore } from '@/stores/settings'
import { onMounted } from 'vue'

const paymentStore = usePaymentStore()
const settStore = settingsStore()
const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))
let verified = false
const verifyPayment = async () => {
  paymentStore.resetVerification()
  while (!verified) {
    verified = (await paymentStore.verifyPayment()) ? true : false
    if (verified) {
      break
    }
    await sleep(2000)
  }
}
const settings = settStore.settings
onMounted(() => {
  const url = window.location.href
  const params = url.split('?')
  if (params.length < 2) {
    // Wrong params structure
    router.push('/failure')
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
        <div class="lds-ellipsis row-span-4">
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
.lds-ellipsis {
  display: inline-block;
  position: relative;
  width: 80px;
  height: 80px;
}
.lds-ellipsis div {
  position: absolute;
  top: 33px;
  width: 13px;
  height: 13px;
  border-radius: 50%;
  background-color: v-bind(settings.Color);
  animation-timing-function: cubic-bezier(0, 1, 1, 0);
}
.lds-ellipsis div:nth-child(1) {
  left: 8px;
  animation: lds-ellipsis1 0.6s infinite;
}
.lds-ellipsis div:nth-child(2) {
  left: 8px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(3) {
  left: 32px;
  animation: lds-ellipsis2 0.6s infinite;
}
.lds-ellipsis div:nth-child(4) {
  left: 56px;
  animation: lds-ellipsis3 0.6s infinite;
}
@keyframes lds-ellipsis1 {
  0% {
    transform: scale(0);
  }
  100% {
    transform: scale(1);
  }
}
@keyframes lds-ellipsis3 {
  0% {
    transform: scale(1);
  }
  100% {
    transform: scale(0);
  }
}
@keyframes lds-ellipsis2 {
  0% {
    transform: translate(0, 0);
  }
  100% {
    transform: translate(24px, 0);
  }
}

.customcolor {
  background-color: v-bind(settings.Color);
}
</style>
