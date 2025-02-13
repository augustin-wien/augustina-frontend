<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useRoute } from 'vue-router'
import { useShopStore } from '@/stores/ShopStore'

const settStore = useSettingsStore()
const shopStore = useShopStore()
const route = useRoute()
const item = shopStore.getItembyId(Number(route.query['item']))
const url = import.meta.env.VITE_API_URL
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <select
      v-model="$i18n.locale"
      class="h-[55px] w-[55px] absolute font-light border-2 top-0 right-0 border-gray-300 rounded-full text-gray-300 text-center mt-8 mr-4 text-sm"
    >
      <option value="en">EN</option>
      <option value="de">DE</option>
    </select>
    <template #main>
      <div class="item-avaiable-page h-full w-full grid grid-rows-5 place-items-center">
        <div
          class="item-header w-44 h-44 flex-none place-content-center rounded-2xl row-span-2 relative"
        >
          <div
            class="item-price rounded-full absolute h-12 w-12 right-0 top-0 place-items-center grid text-lg text-white font-semibold customcolor"
          >
            {{ item.Price / 100 }}€
          </div>
          <img
            :alt="item.Description"
            class="rounded-full h-44 w-44 object-cover customborder border-4"
            :src="url + item.Image"
          />
        </div>
        <div class="item-name text-center font-semibold text-3xl py-4">
          {{ item.Name }}
        </div>
        <div class="item-description text-center text-l row-span-1 place-items-center">
          {{ item.Description }}
        </div>
        <div class="item-additional-information text-center text-l row-span-2 place-items-center">
          {{ $t('information') }}
        </div>
        <div className="item-actions place-items-center w-full flex">
          <RouterLink class="back-link h-[76px] w-[76px] mx-auto" :to="{ name: 'Shop' }">
            <button
              class="back-button customcolor fill-white rounded-full h-full w-full place-items-center grid"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                fill="white"
                class="bi bi-arrow-left-short customfill"
                viewBox="0 0 16 16"
              >
                <path
                  fill-rule="evenodd"
                  d="M12 8a.5.5 0 0 1-.5.5H5.707l2.147 2.146a.5.5 0 0 1-.708.708l-3-3a.5.5 0 0 1 0-.708l3-3a.5.5 0 1 1 .708.708L5.707 7.5H11.5a.5.5 0 0 1 .5.5z"
                />
              </svg>
            </button>
          </RouterLink>
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

.customfill {
  fill: v-bind(settStore.settings.FontColor);
}
</style>
