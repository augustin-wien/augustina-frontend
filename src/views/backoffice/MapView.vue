<script lang="ts" setup>
import 'leaflet/dist/leaflet.css'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import { useMapStore } from '@/stores/map'
import { onMounted, computed, watch, ref } from 'vue'
import { useKeycloakStore } from '@/stores/keycloak'

const keycloakStore = useKeycloakStore()
const authenticated = computed(() => keycloakStore.authenticated)

const mapStore = useMapStore()
const vendors = computed(() => mapStore.vendors)

//Map configuration
const zoom = ref(12)
const center = ref([48.2083, 16.3731])

onMounted(() => {
  if (authenticated.value) {
    mapStore.getLocations()
  } else {
    watch(authenticated, () => {
      mapStore.getLocations()
    })
  }
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'" v-if="authenticated">
    <template v-if="vendors && vendors.length > 0" #header>
      <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t('menuMap') }}</h1>
    </template>
    <template v-if="vendors && vendors.length > 0" #main>
      <div class="h-full">
        <div style="height: 100%; width: 100%">
          <l-map v-model:zoom="zoom" v-model:center="center" :use-global-leaflet="false">
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              layer-type="base"
              name="OpenStreetMap"
            ></l-tile-layer>
            <li v-for="vendor in vendors" :key="vendor.licenseID">
              <l-marker
                v-if="vendor.latitude && vendor.longitude"
                :lat-lng="[vendor.latitude, vendor.longitude]"
              >
                <l-popup class="text-center text-black grid"
                  ><h2 class="text-xl font-semibold">{{ vendor.firstName }}</h2>
                  <span class="mb-2">{{ vendor.licenseID }}</span>
                  <RouterLink
                    v-if="vendor.id"
                    :to="{
                      name: 'Vendor Profile',
                      params: { ID: vendor.id },
                    }"
                  >
                    <button
                      class="rounded-full bg-lime-600 text-white hover:bg-lime-700 px-4 py-2 h-10"
                    >
                      {{ $t('edit') }}
                    </button>
                  </RouterLink>
                </l-popup>
              </l-marker>
            </li>
          </l-map>
        </div>
      </div>
    </template>
  </component>
</template>

<style>
.leaflet-popup-content-wrapper {
  background-color: #fff;
}

.leaflet-popup-tip {
  background-color: #fff;
}

.leaflet-container a.leaflet-popup-close-button {
  color: #000;
}
</style>
