<script setup lang="ts">
import { useShopStore } from '@/stores/ShopStore'
import { usePaymentStore } from '@/stores/payment'
import { settingsStore } from '@/stores/settings'
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const shopStore = useShopStore()
const settStore = settingsStore()
const paymentStore = usePaymentStore()
const shake = ref(false)
const checkAgb = () => {
  const agbsChecked = paymentStore.checkAgb()
  if (!agbsChecked) {
    shake.value = true
    setTimeout(() => {
      shake.value = false
    }, 500)
  }
}
onMounted(() => {
  if (isNaN(paymentStore.priceInEuros()) || paymentStore.priceInEuros() == 0) {
    const sum = shopStore.calculateSum()
    if (sum > 0) {
      paymentStore.setPrice(sum)
    } else {
      // when the sum is still 0 or NaN, then something is wrong with the items in the shop
      router.push({ name: 'Shop' })
    }
  }
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div class="h-full w-full grid grid-rows-5 place-items-center">
        <div class="text-center font-semibold text-3xl">
          {{ $t('confirm') }}
        </div>
        <div class="row-span-2 overflow-y-auto w-full h-full border-4 border-gray-200 rounded-3xl">
          <div class="w-full items-center py-3">
            <p class="text-center text-7xl font-semibold">
              {{ paymentStore.priceInEuros() }}€
            </p>
            <p className="text-center text">
              {{ $t('includes') }} {{ paymentStore.tip }}€ {{ $t('donation') }}
            </p>
          </div>
          <div class="w-full">
            <div v-for="item in shopStore.amount" :key="item.item">
              <div class="text-xl w-full h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full mb-3 "
                v-if="item.quantity > 0">
                {{ item.quantity }}x {{ shopStore.getName(item.item) }}
                {{ shopStore.getPriceInEuro(item.item) }}€
              </div>
            </div>
          </div>
        </div>

        <div :class="shake ? 'shake' : ''">
          <input type="checkbox" id="checkbox" v-model="paymentStore.agbChecked" class="mr-2" />
          <label for="checkbox">
            {{ $t('agreement') }}
            <button @click="paymentStore.toAGB()" class="text-blue-600">
              {{ $t('terms') }}
            </button></label>
        </div>
        <div class="place-items-center w-full">
          <button @click="checkAgb"
            class="bg-gray-500 rounded-full text-center p-5 customfont text-3xl font font-semibold w-full" :style="paymentStore.agbChecked
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
  color: v-bind(settStore.settings.FontColor);
  fill: v-bind(settStore.settings.FontColor);
}

.customfont {
  color: v-bind(settStore.settings.FontColor);
}

.button-down {
  position: relative;
  padding: 5px;
  height: 24px;
  width: 24px;
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

.shake {
  animation: shake 0.5s;
  animation-iteration-count: 2;
  animation-timing-function: linear;
  max-height: 20vh;
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
