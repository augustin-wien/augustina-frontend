<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment';
import { settingsStore } from '@/stores/settings'
import { computed, onMounted, watch } from 'vue';
import { RouterLink } from 'vue-router';
import { useVendorStore } from '@/stores/vendor';
import { useShopStore } from '@/stores/ShopStore';
const shopStore = useShopStore()
const vendorStore = useVendorStore()
const settStore = settingsStore()
const fetch = settStore.getSettingsFromApi
const price = computed(() => settStore.settings.MainItemPrice / 100)

watch(price, () => {
    usePaymentStore().setPrice(settStore.settings.MainItemPrice)
    usePaymentStore().setPricePerPaper(settStore.settings.MainItemPrice)
})
onMounted(() => {
    fetch()
    shopStore.getItems()
    if(shopStore.amount.length == 0){
        shopStore.addItem(1,1)
    }
})

</script>

<template>
    <component :is="$route.meta.layout || 'div'">
       
        <template #main v-if="settStore.settings.MainItemPrice">
            <div className="grid grid-rows-5 h-full place-items-center w-full">
                <div class="row-span-2 grid grid-rows-3 h-full w-full">
                    <div className="text-center font-semibold text-2xl pt-5">
                        {{ $t("buyItem") }}
                    </div>
                    <div class="flex place-content-center">
                        <div class="text-center min-w-fit h-4/5 text-4xl rounded-full text-black font-bold">
                            {{ vendorStore.vendorName }}
                        </div>
                    </div>
                    <div class="place-items-center w-full flex">
                        <RouterLink class="flex-none h-[56px] w-[56px] mr-3" :to="{ name: 'Shop' }">
                            <button
                                class="customcolor fill-white rounded-full h-full text-white text-3xl w-full place-items-center grid">
                                <svg xmlns="http://www.w3.org/2000/svg" width="30" height="30" viewBox="0 0 24 24">
                                    <g>
                                        <path fill="none" d="M0 0h24v24H0z" />
                                        <path
                                            d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z" />
                                    </g>
                                </svg>
                            </button>
                        </RouterLink>
                        <div class="text-xl grow h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full">
                            1x {{ $t("newspaper") }}
                        </div>
                    </div>
                </div>
                <div className="w-full row-span-2">
                    <p className="text-center text-8xl font-semibold">{{ price }}€</p>
                </div>
                <div className="place-items-center w-full flex">
                    <RouterLink class="text-center h-[76px] grow" :to="{ name: 'Tippingpage' }">
                        <button
                            class="customcolor background-color rounded-full p-5 text-white text-3xl w-full font-semibold">
                            {{ $t("next") }}
                        </button>
                    </RouterLink>
                </div>
            </div>
            <div class="absolute">

            </div>
        </template>
    </component>
</template>

<style scoped>
.customcolor {
    background-color: v-bind(settStore.settings.Color);
}
</style>