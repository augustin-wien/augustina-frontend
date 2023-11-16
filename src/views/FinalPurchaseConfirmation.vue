<script setup lang="ts">
import { usePaymentStore } from '@/stores/payment'
import { settingsStore } from '@/stores/settings'
import { useShopStore } from '@/stores/ShopStore'
import { ref } from 'vue'

const shopStore = useShopStore()
const settStore = settingsStore()
const paymentStore = usePaymentStore()
const shake = ref(false)
const checkAgb = () => {
  const agbsChecked = paymentStore.checkAgb()

  if (!agbsChecked) {
    console.log(agbsChecked)
    shake.value = true
    setTimeout(() => {
      shake.value = false
    }, 500)
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="place-items-center">
        <div className="text-center font-semibold text-3xl pb-4">
          {{ $t('confirm') }}
        </div>
        <div class="w-full">
          <div v-for="item in shopStore.amount" :key="item.item">
            <div
              class="text-xl w-full h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full mb-3"
              v-if="item.quantity > 0"
            >
              {{ item.quantity }}x {{ shopStore.getName(item.item) }}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 pt-10 w-full">
          <p className="text-center text-8xl font-semibold col-span-3">
            {{ paymentStore.priceInEuros() }}€
          </p>
        </div>
        <div
          class="text-small w-full font-semibold text-center p-3 rounded-full mb-3"
          v-if="paymentStore.tip > 0"
        >
          {{ paymentStore.tip }}€ {{ $t('donation') }}
        </div>
        <div :class="shake ? 'shake' : ''">
          <input
            type="checkbox"
            id="checkbox"
            v-model="paymentStore.agbChecked"
            class="mr-2"
          />
          <label for="checkbox">
            {{ $t('agreement') }}
            <button @click="paymentStore.toAGB()" class="text-blue-600">
              {{ $t('terms') }}
            </button></label
          >
        </div>
        <div className="flex place-items-center w-full">
          <button
            @click="checkAgb"
            class="bg-gray-600 rounded-full text-center p-5 text-white text-3xl font font-semibold w-full mb-3 mt-3"
            :style="
              paymentStore.agbChecked
                ? 'background-color:' + settStore.settings.Color
                : ''
            "
          >
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
.shake {
  /* Start the shake animation and make the animation last for 0.5 seconds */
  animation: shake 0.5s;

  /* When the animation is finished, start again */
  /* animation-iteration-count: infinite; */
}

@keyframes shake {
  0% {
    transform: translate(1px, 1px) rotate(0deg);
  }
  10% {
    transform: translate(-1px, -2px) rotate(-1deg);
  }
  20% {
    transform: translate(-3px, 0px) rotate(1deg);
  }
  30% {
    transform: translate(3px, 2px) rotate(0deg);
  }
  40% {
    transform: translate(1px, -1px) rotate(1deg);
  }
  50% {
    transform: translate(-1px, 2px) rotate(-1deg);
  }
  60% {
    transform: translate(-3px, 1px) rotate(0deg);
  }
  70% {
    transform: translate(3px, 1px) rotate(-1deg);
  }
  80% {
    transform: translate(-1px, -1px) rotate(1deg);
  }
  90% {
    transform: translate(1px, 2px) rotate(0deg);
  }
  100% {
    transform: translate(1px, -2px) rotate(-1deg);
  }
}
</style>
