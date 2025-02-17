<script setup lang="ts">
import { STYLES_URL } from '@/api/endpoints'
import WaitingAnimation from '@/components/WaitingAnimation.vue'
import { useSettingsStore } from '@/stores/settings'

const settStore = useSettingsStore()
settStore.getSettingsFromApi()

//load custom css from backend
const cssUrl = STYLES_URL
const link = document.createElement('link')
link.href = cssUrl
link.type = 'text/css'
link.rel = 'stylesheet'
link.media = 'screen,print'

document.getElementsByTagName('head')[0].appendChild(link)
</script>

<template>
  <div class="base-layout">
    <main class="absolute inset-0 pt-4 pb-16 place-items-center base-layout">
      <header class="relative place-items-center h-1/6">
        <select
          v-model="$i18n.locale"
          class="h-[55px] w-[55px] absolute font-semibold border-0 top-0 right-0 text-gray-500 bg-white text-center mt-4 mr-4 pl-2 text-sm"
        >
          <option value="en">EN</option>
          <option value="de">DE</option>
        </select>
        <slot name="header">
          <img
            v-if="settStore.imgUrl"
            alt="Newspaper logo"
            className="logo mx-auto my-1 scale-75"
            :src="settStore.imgUrl"
          />
        </slot>
      </header>
      <div class="h-5/6 main-container px-8">
        <slot name="main">
          <WaitingAnimation />
        </slot>
      </div>
    </main>
    <footer>
      <slot name="footer" />
    </footer>
  </div>
</template>

<style lang="scss" scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.logo {
  max-height: 80px;
  width: auto;
}
header {
  width: 100%;
}
</style>

<style>
main {
  max-width: 400px;
  left: 0;
  right: 0;
  margin: auto;
}
</style>
