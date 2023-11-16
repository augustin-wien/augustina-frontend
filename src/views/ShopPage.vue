<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useShopStore } from '@/stores/ShopStore'
import { settingsStore } from '@/stores/settings'
const shopStore = useShopStore()
const settStore = settingsStore()
const items = shopStore.items
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
            <ul
              class="list-image-none overflow-y-auto w-full h-full bg-gray-200 border border-gray-600 rounded-3xl"
            >
              <li
                v-for="item in items"
                :key="item.ID"
                class="flex w-full p-1 border-b-gray-400 border-2"
              >
                <div class="flex-none grid grid-rows-2 place-content-start mr-2">
                  <div class="pb-1">
                    <div class="w-[64px] h-[64px] flex-none bg-red-600 rounded-2xl">
                      <img
                        :alt="item.Description"
                        className="logo mx-auto my-1 scale-75"
                        :src="item.Image"
                      />
                    </div>
                  </div>
                  <div class="h-[60px]">
                    <div
                      class="rounded-full w-[64px] h-[60px] bg-black text-center text-white font-semibold text-xl flex justify-center items-center"
                    >
                      {{ item.Price / 100 }}€
                    </div>
                  </div>
                </div>
                <div className="place-items-center grow h-full grid grid-rows-2">
                  <div class="w-full h-full py-1">
                    <div
                      class="bg-black h-16 w-full rounded-full text-center text-white font-semibold text-xl flex justify-center items-center"
                    >
                      {{ item.Name }}
                    </div>
                  </div>
                  <div className="flex grow h-full pb-2 w-full">
                    <div
                      class="customcolor text-white text-center text-2xl font-semibold rounded-full grow h-[60px] py-3 mr-1"
                    >
                      <div>
                        {{ shopStore.getAmount(item.ID) }}
                      </div>
                    </div>
                    <button>
                      <div
                        class="button-down customcolor h-[60px] w-[60px] rounded-full font-extrabold text-white text-2xl flex items-center justify-center mx-[2px]"
                        @click="shopStore.subtractItem(item.ID, item.Price)"
                      >
                        -
                      </div>
                    </button>
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
              </li>
            </ul>
          </div>
        </div>
        <div className="place-items-center row-span-2 w-full flex">
          <RouterLink
            class="flex-none h-[76px] w-[76px] mr-2"
            :to="{ name: 'LandingPage' }"
          >
            <button
              class="customcolor fill-white rounded-full h-full w-full place-items-center grid"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="white"
                class="bi bi-arrow-left-short"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
                />
              </svg>
            </button>
          </RouterLink>
          <RouterLink class="text-center h-[76px] grow" :to="{ name: 'Tippingpage' }">
            <button
              class="customcolor rounded-full p-5 text-white text-3xl w-full font-semibold"
            >
              Weiter
            </button>
          </RouterLink>
        </div>
      </div>
    </template>
  </component>
</template>

<style>
.customcolor {
  background-color: v-bind(settStore.settings.Color);
}
</style>
