<script setup lang="ts">
import { usePaymentStore } from '@/stores/PaymentStore';
import { settingsStore } from '@/stores/settings';
import { RouterLink } from 'vue-router';

const settStore = settingsStore()
const paymentStore = usePaymentStore()

const increment = paymentStore.setTip
</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full w-full grid grid-rows-5 place-items-center">
                <div className="text-center font-semibold text-3xl">
                    {{ $t("donation") }}
                </div>
                <div className="flex place-items-center w-full">
                    <RouterLink class="w-full" :to="{ name: 'Confirmation' }">
                        <button @click="increment(2)"
                            class="customcolor rounded-full p-[18px] text-white text-4xl font font-semibold w-full">
                            2,00 €
                        </button>
                    </RouterLink>
                </div>
                <div className="flex place-items-center w-full">
                    <RouterLink class="w-full" :to="{ name: 'Confirmation' }">
                        <button @click="increment(1)"
                            class="customcolor rounded-full p-[18px] text-white text-4xl font font-semibold w-full">
                            1,00 €
                        </button>
                    </RouterLink>
                </div>
                <div className="flex place-items-center w-full">
                    <button class="customcolor rounded-full p-5 text-white text-3xl font font-semibold w-full">
                        <RouterLink :to="{ name: 'Custom Tip' }">{{ $t("edit") }}</RouterLink>
                    </button>
                </div>
                <div className="flex place-items-center w-full">
                    <RouterLink class="w-full" :to="{ name: 'Confirmation' }">
                        <button @click="increment(0)"
                            class="customcolor rounded-full p-5 text-white text-3xl font font-semibold w-full">
                            {{ $t("notToday") }}
                        </button>
                    </RouterLink>
                </div>
            </div>
        </template>
    </component>
</template>

<style>
.customcolor {
    background-color: v-bind(settStore.settings.Color);
}
</style>