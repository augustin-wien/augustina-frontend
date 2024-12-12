<script setup lang="ts">
import WaitingAnimation from '@/components/WaitingAnimation.vue'
import router from '@/router'
import { usePaymentStore } from '@/stores/payment'
import { onMounted } from 'vue'

const paymentStore = usePaymentStore()
const sleep = (delay: number) => new Promise((resolve) => setTimeout(resolve, delay))
let verified = false
let counter = 0

const verifyPayment = async () => {
  paymentStore.resetVerification()

  while (!verified) {
    verified = (await paymentStore.verifyPayment()) ? true : false

    if (verified || counter > 10) {
      break
    }

    counter++
    await sleep(2000)
  }
}

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
      <WaitingAnimation id="waiting-animation" />
    </template>
  </component>
</template>
