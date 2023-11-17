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
      <div className="h-full w-full place-items-center">
        <div className="text-center font-semibold text-3xl mb-7">
          {{ $t('confirm') }}
        </div>
        <div class="w-full">
          <div v-for="item in shopStore.amount" :key="item.item">
            <div
              class="text-xl w-full h-[56px] text-center font-semibold text-white bg-black p-3 rounded-full mb-3"
              v-if="item.quantity > 0"
            >
              {{ item.quantity }}x {{ shopStore.getName(item.item) }} {{}}
            </div>
          </div>
        </div>
        <div className="grid grid-rows-1 py-10 w-full">
          <div className="grid grid-cols-6 w-full items-center">
            <div className="col-span-5">
              <p className="text-center text-8xl font-semibold">
                {{ paymentStore.priceInEuros() }}€
              </p>
              <p className="text-center text">
                {{ $t('includes') }} {{ paymentStore.tip }}€ {{ $t('donation') }}
              </p>
            </div>
            <RouterLink class="h-[56px] w-[56px]" :to="{ name: 'Shop' }">
              <button
                class="customcolor fill-white rounded-full h-full text-white text-3xl w-full place-items-center grid"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="30"
                  height="30"
                  viewBox="0 0 24 24"
                >
                  <g>
                    <path fill="none" d="M0 0h24v24H0z" />
                    <path
                      d="M15.728 9.686l-1.414-1.414L5 17.586V19h1.414l9.314-9.314zm1.414-1.414l1.414-1.414-1.414-1.414-1.414 1.414 1.414 1.414zM7.242 21H3v-4.243L16.435 3.322a1 1 0 0 1 1.414 0l2.829 2.829a1 1 0 0 1 0 1.414L7.243 21z"
                    />
                  </g>
                </svg>
              </button>
            </RouterLink>
          </div>
        </div>
        <div>
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
        <div className="flex place-items-center w-full mt-6">
          <button
            @click="paymentStore.checkAgb()"
            class="bg-gray-600 rounded-full text-center p-5 text-white text-3xl font font-semibold w-full"
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
