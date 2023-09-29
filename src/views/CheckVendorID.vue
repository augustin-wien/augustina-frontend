<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router';
import { settingsStore } from '@/stores/settings';
import { checkVendorId } from '@/api/api';

const settStore = settingsStore()
const fetch = settStore.getSettingsFromApi
const route = useRoute()
const id = route.params.id

onMounted(()=>fetch().then(() => checkVendorId(id)))
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