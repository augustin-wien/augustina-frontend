<script setup lang="ts">
import { useSettingsStore } from '@/stores/settings'
import { useKeycloakStore } from '@/stores/keycloak'
import { computed } from 'vue'

const keycloakStore = useKeycloakStore()

const authenticated = computed(() => keycloakStore.authenticated)

const settStore = useSettingsStore()
settStore.getSettingsFromApi()
</script>

<template>
  <div v-if="authenticated" class="vendor-layout">
    <main class="absolute inset-0 pt-4 pb-16 place-items-center vendor-layout">
      <header class="relative place-items-center h-1/6">
        <select
          v-model="$i18n.locale"
          class="h-[55px] w-[55px] absolute font-semibold border-2 top-0 right-0 border-gray-300 rounded-full text-gray-300 text-center mt-4 mr-4 pl-2 text-sm"
        >
          <option value="en">EN</option>
          <option value="de">DE</option>
        </select>
        <slot name="header">
          <img
            v-if="settStore.imgUrl"
            alt="Augustin logo"
            className="logo mx-auto my-1 scale-75"
            :src="settStore.imgUrl"
          />
        </slot>
      </header>
      <div class="h-5/6 main-container px-8">
        <slot name="main"> </slot>
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
</style>

<style>
main {
  max-width: 400px;
  left: 0;
  right: 0;
  margin: auto;
}
</style>
