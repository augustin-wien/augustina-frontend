<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { useShopStore } from '@/stores/ShopStore'
import { settingsStore } from '@/stores/settings'
import { ref } from 'vue'
import Toast from '@/components/ToastMessage.vue'

const shopStore = useShopStore()
const settStore = settingsStore()
const items = shopStore.items
const router = useRouter()

const url = import.meta.env.VITE_API_URL
type ToastMessage = {
  message: string
  type: string
}
const toast = ref<ToastMessage | null>(null)

const checkIfItemSelected = () => {
  if (shopStore.amount.length > 0) {
    let sum = 0
    for (let i = 0; i < shopStore.amount.length; i++) {
      sum += shopStore.amount[i].quantity
    }
    if (sum > 0) router.push({ name: 'Tippingpage' })
    else {
      toast.value = {
        message: 'Bitte wähle ein Produkt aus',
        type: 'error',
      }
    }
  } else {
    toast.value = {
      message: 'Bitte wähle ein Produkt aus',
      type: 'error',
    }
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full grid grid-rows-5 place-items-center w-full">
        <div class="row-span-4 w-full h-full">
          <div className="text-center font-semibold text-3xl py-4">
            {{ $t('product') }}
          </div>
          <div class="h-5/6 pb-3">
            <Toast v-if="toast" :toast="toast" />
            <ul
              class="list-image-none overflow-y-auto w-full h-full border-4 border-gray-200 rounded-3xl"
            >
              <li
                v-for="item in items"
                :key="item.ID"
                class="flex w-full p-1 pt-2 relative"
              >
                <div class="flex-none grid grid-rows-1 place-content-start mr-2">
                  <div class="pb-1">
                    <RouterLink
                      :to="{ name: 'Item Available', query: { item: item.ID } }"
                    >
                      <div
                        class="w-[90px] h-[90%] flex-none bg-cover bg-red-600 rounded-2xl"
                        :style="'background-image: url(' + url + item.Image + ')'"
                      ></div>
                    </RouterLink>
                  </div>
                </div>
                <div className="place-items-center grow h-full grid grid-rows-2">
                  <div class="w-full h-full py-1 relative">
                    <RouterLink
                      :to="{ name: 'Item Available', query: { item: item.ID } }"
                    >
                      <button
                        class="bg-gray-500 absolute rounded-full text-center w-6 text-white font-bold top-0 right-0"
                      >
                        i
                      </button>
                      <div
                        class="bg-black h-16 w-full rounded-full text-center text-white font-semibold text-xl flex justify-center items-center"
                      >
                        {{ item.Name }} {{ item.Price / 100 }}€
                      </div>
                    </RouterLink>
                  </div>
                  <div className="flex grow h-full pb-2 w-full">
                    <button>
                      <div
                        class="button-down customcolor h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]"
                        @click="shopStore.subtractItem(item.ID, item.Price)"
                      >
                        -
                      </div>
                    </button>
                    <div
                      class="border-2 border-black text-black text-center text-2xl font-semibold rounded-full grow h-[60px] py-3 mr-1"
                    >
                      <div>
                        {{ shopStore.getAmount(item.ID) }}
                      </div>
                    </div>
                    <button class="place-content-">
                      <div
                        class="button-up customcolor h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]"
                        @click="shopStore.addItem(item.ID, item.Price)"
                      >
                        +
                      </div>
                    </button>
                  </div>
                </div>
                <hr class="absolute bottom-0 left-0 w-full h-[3px] bg-gray-200" />
              </li>
            </ul>
          </div>
        </div>
        <div className="place-items-center row-span-1 w-full flex">
          <button
            class="text-center h-[76px] grow customcolor rounded-full p-5 text-white text-3xl w-full font-semibold"
            @click="checkIfItemSelected"
          >
            Weiter
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
