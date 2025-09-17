<script setup lang="ts">
import { useShopStore } from '@/stores/ShopStore'
import { usePaymentStore } from '@/stores/payment'
import { useSettingsStore } from '@/stores/settings'
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import EmailModal from '@/components/EmailModal.vue'

const router = useRouter()
const shopStore = useShopStore()
const settStore = useSettingsStore()
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
  const sum = shopStore.calculateSum()

  if (isNaN(sum) || sum == 0) {
    // when the sum is still 0 or NaN, then something is wrong with the items in the shop
    router.push({ name: 'Shop' })
  }
})

const hasLicenseItem = computed(() => {
  const item = shopStore.items?.find((item) => item.LicenseItem != null)

  if (item) {
    if (shopStore.amount.find((i) => i.item == item.ID)) return item
  }

  return null
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div id="confirmation-page" class="h-full w-full grid grid-rows-5 place-items-center">
        <div id="page-title" class="text-center font-semibold text-3xl">
          {{ $t('confirm') }}
        </div>
        <div class="row-span-3 w-full h-full">
          <div
            id="final-order-content"
            class="overflow-y-auto h-5/6 border-4 border-gray-200 rounded-3xl"
          >
            <div class="w-full items-center py-4">
              <p id="final-price" class="text-center text-8xl font-semibold">
                {{ shopStore.calculateSum().toFixed(2) }}€
              </p>
              <p className="text-center text">
                {{ $t('includes') }} {{ shopStore.donationInEuro }}€
                {{ $t('donation') }}
              </p>
            </div>
            <div class="w-full">
              <div v-for="item in shopStore.amount" :key="item.item" class="final-item">
                <div
                  v-if="item.quantity > 0 && item.item != shopStore.donationItem"
                  class="text-xl w-full text-center font-semibold text-white bg-black p-3 rounded-full mb-4"
                >
                  {{ item.quantity }}x {{ shopStore.getName(item.item) }}
                  {{ shopStore.getPriceInEuro(item.item).toFixed(2) }}€
                </div>
              </div>
            </div>
          </div>

          <div :class="shake ? 'shake' : ''">
            <div class="flex items-center justify-center">
              <input id="checkbox" v-model="paymentStore.agbChecked" type="checkbox" class="mr-2" />
              <label for="checkbox" class="text-center">
                {{ $t('agreement') }}
                <button class="text-blue-600" @click="settStore.toAGB()">
                  {{ $t('terms') }}
                </button></label
              >
            </div>
            <div v-if="hasLicenseItem">
              <EmailModal
                v-if="!paymentStore.email || paymentStore.email == ''"
                :licence-item="hasLicenseItem"
              />
            </div>
            <div class="w-full">
              <div v-if="hasLicenseItem != null" class="text-small text-center mb-3">
                {{ `${$t('for')} ${paymentStore.email}` }}
                <button class="text-blue-600" @click="paymentStore.email = ''">
                  {{ $t('change') }}
                </button>
              </div>
            </div>
          </div>
        </div>

        <div class="place-items-center w-full">
          <button
            v-if="
              shopStore.amount.length == 1 && shopStore.amount[0] && shopStore.amount[0].item == shopStore.donationItem
            "
            id="donation-only"
            class="bg-gray-500 rounded-full text-center p-5 customfont text-3xl font font-semibold w-full"
          >
            {{ $t('donation_only') }}
          </button>
          <button
            v-else
            id="next-btn"
            class="bg-gray-500 rounded-full text-center p-5 customfont text-3xl font font-semibold w-full"
            :style="paymentStore.agbChecked ? 'background-color:' + settStore.settings.Color : ''"
            @click="checkAgb"
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
