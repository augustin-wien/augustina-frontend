<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore'
import { RouterLink } from 'vue-router'

const paymentStore = usePaymentStore()

const increment = paymentStore.increment
const decrement = paymentStore.decrement

</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full grid grid-rows-5 place-items-center">
                <div className="text-center font-semibold text-3xl row-span-2">
                    Trinkgeld eingeben:
                </div>
                <div className="grid grid-cols-5 w-full h-full">
                    <button @click="decrement()">
                        <div class="button-down bg-green-600"></div>
                    </button>
                    <div
                        class="col-span-3 grid grid-cols-3 bg-green-500 text-white rounded-3xl border-spacing-7 place-items-center">
                        <input type="number" v-model.number="paymentStore.tip"
                            className="bg-green-600 col-span-2 text-white text-center text-6xl font-semibold border-2 border-green-600 rounded-3xl w-full h-full">
                        <p className="text-6xl font-semibold text-left">€ </p>
                    </div>
                    <button @click="increment">
                        <div class="button-up bg-green-600 ml-3"></div>
                    </button>
                </div>
                <div>

                </div>
                <div className="flex place-items-center w-full">
                    <RouterLink class="w-full" to="/confirmation">
                        <button class="bg-green-600 rounded-full p-5 text-white text-3xl font font-semibold w-full">
                            Weiter
                        </button>
                    </RouterLink>
                </div>
            </div>
        </template>
    </component>
</template>

<style scoped>@import "../assets/arrows.css"</style>