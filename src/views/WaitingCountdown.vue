<script setup lang="ts">
    import { usePaymentStore } from '@/stores/PaymentStore'
    import { onMounted } from 'vue'
    
    const paymentStore = usePaymentStore()

    onMounted(() => {
        paymentStore.verifyPayment()
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