<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useVendorStore } from '@/stores/vendor'
import keycloak, { initKeycloak } from '@/keycloak/keycloak'

const vendorStore = useVendorStore()
const route = useRoute()
const router = useRouter()
const checkID = vendorStore.checkID
const id = route.params.id

onMounted(async () => {
  if (id) {
    try {
      if (!keycloak.initailizedKeycloak) {
        await initKeycloak()
      }
      if (keycloak.keycloak?.tokenParsed?.groups?.includes('backoffice')) {
        router.replace({ name: 'BackofficePOS', params: { id: id as string } })
        return
      }
    } catch {
      // not authenticated — proceed to normal shop
    }
  }
  checkID(id)
})
</script>

<template>
  <div>
    <RouterView />
  </div>
</template>
