<script setup lang="ts">
    import { usePaymentStore } from '@/stores/PaymentStore';
    import { settingsStore } from '@/stores/settings';

    const settStore = settingsStore()
    const paymentStore = usePaymentStore()
</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div  className="h-full grid grid-rows-5 place-items-center">
                <div className="text-center font-semibold text-3xl">
                    {{ $t("confirm") }}
                </div>
                <div className="grid grid-cols-3 py-10 row-span-2 w-full">
                    <p className="text-center text-8xl font-semibold col-span-3">{{ paymentStore.priceInEuros() }}€</p>
                </div>
                <div>
                    <input type="checkbox" id="checkbox" v-model="paymentStore.agbChecked" class="mr-2"/>
                    <label for="checkbox"> {{ $t("agreement") }} <button @click="paymentStore.toAGB()" class="text-blue-600">{{ $t("terms") }}</button></label>
                </div>
                <div className="flex place-items-center w-full">
                    <button @click="paymentStore.checkAgb()" class="bg-gray-600 rounded-full text-center p-5 text-white text-3xl font font-semibold w-full" :style="paymentStore.agbChecked?'background-color:'+settStore.settings.Color:''">
                        {{ $t("next") }}
                    </button>
                </div>
            </div>
        </template>
    </component>
</template>
