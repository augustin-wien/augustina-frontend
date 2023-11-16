<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment'
import { settingsStore } from '@/stores/settings'
import { useShopStore } from '@/stores/ShopStore'
import { onMounted } from 'vue';

const shopStore = useShopStore()
const settStore = settingsStore()
const paymentStore = usePaymentStore()

const items = shopStore.finalitems

onMounted(() => {
  if (paymentStore.tip > 0) {
    items.push({
      item: paymentStore.tipItem,
      quantity: paymentStore.tip * 100
    })
  }
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full w-full grid grid-rows-5 place-items-center">
        <div className="text-center font-semibold text-3xl">
          {{ $t('confirm') }}
        </div>
        <div class="place-items-center w-full flex">
          <RouterLink class="flex-none h-[56px] w-[56px] mr-3" :to="{ name: 'Shop' }">
            <button class="customcolor button-down h-full w-full">

            </button>
          </RouterLink>
          <div class="text-xl grow h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full">
            {{ shopStore.getAmount(1) }}x {{ shopStore.getName(1) }}
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

.button-down {
  position: relative;
  padding: 5px;
  height: 56px;
  width: 56px;
  border-radius: 50%;
  transition: all 0.2s linear;
}

.button-down {
  margin-right: auto;
}

.button-down::after {
  content: '';
  position: absolute;
  left: 15px;
  z-index: 11;
  display: block;
  width: 27px;
  height: 27px;
  border-top: 2px solid #fff;
  border-left: 2px solid #fff;
}

.button-down::after {
  top: 10px;
  transform: rotate(225deg);
}
</style>