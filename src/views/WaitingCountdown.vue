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
        paymentStore.verifyPayment(t[1])
    }
    )
</script>

<template>
    <div class="countdown">
        <svg viewBox="-50 -50 100 100" stroke-width="10">
            <circle r="35"></circle>
            <circle r="35" pathLength="1"></circle>
        </svg>
    </div>
</template>

<style scoped>
    @import "../assets/countdown.css"
</style>