<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment'
import { settingsStore } from '@/stores/settings'
import { useShopStore } from '@/stores/ShopStore'

const shopStore = useShopStore()
const settStore = settingsStore()
const paymentStore = usePaymentStore()
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full grid grid-rows-5 place-items-center">
        <div className="text-center font-semibold text-3xl">
          {{ $t('confirm') }}
        </div>
        <div class="w-full h-full">
          <div class="text-xl w-full h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full">
            {{ shopStore.getAmount(1) }}x {{ $t("newspaper") }}
          </div>
        </div>
        <div className="grid grid-cols-3 py-10 w-full">
          <p className="text-center text-8xl font-semibold col-span-3">
            {{ paymentStore.priceInEuros() }}€
          </p>
        </div>
        <div>
          <input type="checkbox" id="checkbox" v-model="paymentStore.agbChecked" class="mr-2" />
          <label for="checkbox">
            {{ $t('agreement') }}
            <button @click="paymentStore.toAGB()" class="text-blue-600">
              {{ $t('terms') }}
            </button></label>
        </div>
        <div className="flex place-items-center w-full">
          <button @click="paymentStore.checkAgb()"
            class="bg-gray-600 rounded-full text-center p-5 text-white text-3xl font font-semibold w-full" :style="paymentStore.agbChecked
              ? 'background-color:' + settStore.settings.Color
              : ''
              ">
            {{ $t('next') }}
          </button>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.customcolor {
    background-color: v-bind(settStore.settings.Color);
}
</style>