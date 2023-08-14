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
        paymentStore.verifyPayment()
    }
    )
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