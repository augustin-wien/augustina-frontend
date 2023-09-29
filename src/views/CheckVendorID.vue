<script setup lang="ts">
import { onMounted } from 'vue'
import { useVendorStore } from '@/stores/vendor';
import { useRoute } from 'vue-router';
import { settingsStore } from '@/stores/settings';

const vendorStore = useVendorStore()
const settStore = settingsStore()
const checkid = vendorStore.checkID
const fetch = settStore.fetchSettings
const route = useRoute()
const id = route.params.id

onMounted(()=>checkid(id).then(settStore.fetchSettings()))
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

<style scoped>@import "../assets/loadingwheel.css"</style>