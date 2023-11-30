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
        <div class="w-full">
          <div v-if="shopStore.finalitems.length < 2" v-for="item in shopStore.amount" :key="item.item">
            <div class="text-xl w-full h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full mb-3 "
              v-if="item.quantity > 0">
              {{ item.quantity }}x {{ shopStore.getName(item.item) }}
              {{ shopStore.getPriceInEuro(item.item) }}€
            </div>
          </div>
          <div v-if="shopStore.finalitems.length >= 2">
            <div class="text-xl w-full h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full relative">
              {{ shopStore.finalitems[0].quantity }}x {{ shopStore.getName(shopStore.finalitems[0].item) }}
              {{ shopStore.getPriceInEuro(shopStore.finalitems[0].item) }}€
              <RouterLink class="h-6 w-6 bottom-0 right-0 absolute" :to="{ name: 'Items' }">
                <button class="customcolor text-center rounded-full w-full h-full flex items-center justify-center">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="#ffffff">
                    <g id="SVGRepo_bgCarrier" stroke-width="0"></g>
                    <g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                      <path d="M6 12H18M12 6V18" :stroke="settStore.settings.FontColor" stroke-width="2" stroke-linecap="round"
                        stroke-linejoin="round"></path>
                    </g>
                  </svg>
                </button>
              </RouterLink>
            </div>

          </div>
        </div>
        <div class="grid grid-rows-1 w-full">
          <div class="grid grid-cols-6 w-full items-center">
            <div></div>
            <div class="col-span-4">
              <p class="text-center text-8xl font-semibold">
                {{ paymentStore.priceInEuros() }}€
              </p>
              <p className="text-center text">
                {{ $t('includes') }} {{ paymentStore.tip }}€ {{ $t('donation') }}
              </p>
            </div>
            <RouterLink class="h-[56px] w-[56px]" :to="{ name: 'Shop' }">
              <button
                class="customcolor fill-white rounded-full h-full text-white text-3xl w-full place-items-center grid">
                <svg xmlns="http://www.w3.org/2000/svg" class="customfill" width="30" height="30" viewBox="0 0 24 24">
                  <g>
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                      d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z" />
                  </g>
                </svg>
              </button>
            </RouterLink>
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
}</style>
