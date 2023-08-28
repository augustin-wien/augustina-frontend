<script setup lang="ts">
    import { usePaymentStore } from '@/stores/PaymentStore'
    import { RouterLink} from 'vue-router'
    const paymentStore = usePaymentStore()
    const increment = paymentStore.increment
    const decrement = paymentStore.decrement

</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="grid grid-rows-6 h-full place-items-center">
                <div>
                </div>
                <div className="text-center font-semibold text-4xl">
                    Zeitung kaufen
                </div>
                <div className="py-9 row-span-2 w-full">
                    <p className="text-center text-9xl font-semibold">{{ paymentStore.priceInEuros() }}€</p>
                </div>
                <div className="flex place-items-center row-span-2 w-full">
                    <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
                        <RouterLink to="/print-digital">Weiter</RouterLink>
                    </button>
                </div>
            </div>
        </template>
    </component>
</template>
