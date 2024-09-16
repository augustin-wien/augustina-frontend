<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { useVendorStore } from '@/stores/vendor'
import WaitingAnimation from '@/components/WaitingAnimation.vue'

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
      <WaitingAnimation />
    </template>
  </component>
</template>
