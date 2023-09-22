<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore'
import { onMounted } from 'vue'

const paymentStore = usePaymentStore()

onMounted(() => {
  const url = window.location.href
  const params = url.split('?')
  const vars = params[1].split('&')
  const t = vars[0].split('=')
  paymentStore.transactionID = t[1]
}
)
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

<style scoped>@import "../assets/loadingwheel.css"</style>