<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useVendorStore } from '@/stores/vendor'

const settStore = useSettingsStore()
const vendorStore = useVendorStore()
const fetch = settStore.getSettingsFromApi
const route = useRoute()
const checkID = vendorStore.checkID
const id = route.params.id

onMounted(() => fetch().then(() => checkID(id)))
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full grid grid-rows-5 place-items-center">
        <div class="lds-ellipsis row-span-4">
          <div></div>
          <div></div>
          <div></div>
          <div></div>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
@import '../assets/loadingwheel.css';
</style>
