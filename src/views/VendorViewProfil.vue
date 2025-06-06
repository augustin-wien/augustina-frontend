<script lang="ts" setup>
import { onMounted } from 'vue'
import { vendorsStore } from '@/stores/vendor'
import { useSettingsStore } from '@/stores/settings'
import { computed, watch } from 'vue'
import router from '@/router'
import { useKeycloakStore } from '@/stores/keycloak'

const keycloakStore = useKeycloakStore()
const authenticated = computed(() => keycloakStore.authenticated)

const store = vendorsStore()
const settStore = useSettingsStore()

const vendorMe = computed(() => store.vendor)

onMounted(async () => {
  if (authenticated.value) {
    try {
      store.fetchVendorMe()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Fehler beim API-Aufruf:', error)
    }
  } else {
    watch(authenticated, async () => {
      store.fetchVendorMe()

      if (authenticated.value) {
        try {
          store.fetchVendorMe()
        } catch (error) {
          // eslint-disable-next-line no-console
          console.error('Fehler beim API-Aufruf:', error)
        }
      }
    })
  }
})

// Computed property to manage dynamic styles
const customColor = computed(() => {
  return {
    '--custom-bg-color': settStore.settings.Color
  }
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="vendor-overview container mb-8 space-y-40 pb-3 w-5/6">
        <div className="flex flex-col items-center space-y-8">
          <h1 className="text-3xl font-bold">{{ $t('yourProfile') }}</h1>
          <div class="information">
            <div class="grid grid-cols-2 place-content-between">
              <strong>Name:</strong>
              {{ vendorMe?.FirstName }} {{ vendorMe?.LastName }}
            </div>
            <div class="grid grid-cols-2 place-content-between">
              <strong>{{ $t('IDNumber') }}:</strong> {{ vendorMe?.LicenseID }}
            </div>
            <div class="grid grid-cols-2 place-content-between">
              <strong>Email: </strong>{{ vendorMe?.Email }}
            </div>
            <div class="grid grid-cols-2 place-content-between">
              <strong> {{ $t('telephone') }}: </strong>{{ vendorMe?.Telephone }}
            </div>
          </div>
          <button
            :style="customColor"
            class="p-2 rounded-full customcolor text-white"
            @click="router.push('/me')"
          >
            {{ $t('back') }}
          </button>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
.customcolor {
  background-color: var(--custom-bg-color);
}
.vendor-overview {
  display: flex;
  flex-direction: column;
}

h2 {
  font-size: large;
}
.container {
  max-width: 300px;
  margin: 0 auto;
  align-items: center;
  justify-content: center;
  text-align: center;
}
.information {
  text-align: start;
}
</style>
