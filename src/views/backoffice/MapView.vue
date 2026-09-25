<script lang="ts" setup>
import L from 'leaflet'

globalThis.L = L
import 'leaflet/dist/leaflet.css'
import type { PointExpression } from 'leaflet'
import type { Ref } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import { LMarkerClusterGroup } from 'vue-leaflet-markercluster'
import 'vue-leaflet-markercluster/dist/style.css'
import { useMapStore } from '@/stores/map'
import { computed, ref } from 'vue'
import { useKeycloakStore } from '@/stores/keycloak'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useSettingsStore } from '@/stores/settings'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'
import { vendorsStore } from '@/stores/vendor'
import VendorInfo from '@/components/VendorInfo.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'

const store = vendorsStore()

const settingsStore = useSettingsStore()

const keycloakStore = useKeycloakStore()
const authenticated = computed(() => keycloakStore.authenticated)

const mapStore = useMapStore()
const vendors = computed(() => mapStore.vendors)
const showVendorInfo = ref(false)
//Map configuration
const zoom = ref(12)
// Todo: Get the center from the settings
const center: Ref<PointExpression> = ref([48.2083, 16.3731])
const map: Ref<any> = ref(null)
const provider = new OpenStreetMapProvider()
const emit = defineEmits(['newLocation'])

// Locations without a vendor get an orange pin so they stand out from the default blue ones
const unassignedIcon = L.divIcon({
  className: 'unassigned-marker',
  html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 25 41" width="25" height="41">
    <path d="M12.5 0C5.6 0 0 5.6 0 12.5 0 21.9 12.5 41 12.5 41S25 21.9 25 12.5C25 5.6 19.4 0 12.5 0z"
      fill="#e8590c" stroke="#9c3a06" stroke-width="1"/>
    <circle cx="12.5" cy="12.5" r="4.5" fill="#fff"/></svg>`,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34]
  // LMarker is typed for image icons only, but Leaflet accepts a DivIcon just the same
}) as unknown as L.Icon

const searchControl: any = new (GeoSearchControl as any)({
  provider: provider
})

useAuthLoad(() => mapStore.getLocations())

function onMapReady(instance: any) {
  if (instance) {
    map.value = instance
  }

  center.value = [settingsStore.settings.MapCenterLat, settingsStore.settings.MapCenterLong]

  map.value.addControl(searchControl)

  map.value.on('geosearch/showlocation', function (event: any) {
    emit('newLocation', event)
  })
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'" v-if="authenticated">
    <template v-if="vendors" #header>
      <PageHeader :title="$t('menuMap')" />
    </template>
    <template v-if="vendors" #main>
      <div class="h-full">
        <div style="height: 75vh; width: 100%" class="z-0 relative">
          <l-map
            v-model:zoom="zoom"
            :center="center"
            use-global-leaflet
            :max-zoom="18"
            :enable-search="1"
            @ready="onMapReady"
          >
            <l-tile-layer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              layer-type="base"
              name="OpenStreetMap"
            ></l-tile-layer>
            <l-marker-cluster-group>
              <li v-for="vendor in vendors" :key="vendor.locationID">
                <l-marker
                  v-if="vendor.latitude && vendor.longitude && !vendor.hasVendor"
                  :lat-lng="[vendor.latitude, vendor.longitude]"
                  :icon="unassignedIcon"
                >
                  <l-popup class="text-center text-black grid">
                    <h2 class="text-xl font-semibold">{{ vendor.locationName }}</h2>
                    <span>{{ vendor.address }}</span>
                    <span class="mb-2">{{ $t('noVendorAssigned') }}</span>
                    <router-link to="/backoffice/locations">
                      <Button variant="primary">{{ $t('menuLocations') }}</Button>
                    </router-link>
                  </l-popup>
                </l-marker>
                <l-marker
                  v-else-if="vendor.latitude && vendor.longitude"
                  :lat-lng="[vendor.latitude, vendor.longitude]"
                >
                  <l-popup class="text-center text-black grid">
                    <h2 class="text-xl font-semibold">{{ vendor.firstName }}</h2>
                    <span class="mb-2">{{ vendor.licenseID }}</span>
                    <Button
                      variant="primary"
                      @click="
                        async () => {
                          await store.getVendor(vendor.id)
                          showVendorInfo = true
                        }
                      "
                    >
                      {{ $t('info') }}
                    </Button>
                  </l-popup>
                </l-marker>
              </li>
            </l-marker-cluster-group>
          </l-map>
        </div>
        <div class="map-legend">
          <span class="map-legend-item">
            <span class="map-legend-dot map-legend-assigned" />{{ $t('mapLegendAssigned') }}
          </span>
          <span class="map-legend-item">
            <span class="map-legend-dot map-legend-unassigned" />{{ $t('noVendorAssigned') }}
          </span>
        </div>
      </div>
      <VendorInfo
        v-if="showVendorInfo"
        :show-vendorinfo="showVendorInfo"
        @close="showVendorInfo = false"
      />
    </template>
  </component>
</template>

<style scoped>
.map-legend {
  display: flex;
  gap: 16px;
  margin-top: 8px;
  font-size: 13px;
  color: var(--color-text-muted);
}
.map-legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.map-legend-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}
.map-legend-assigned {
  background: #2a81cb;
}
.map-legend-unassigned {
  background: #e8590c;
}
/* divIcon adds a white square background by default */
:global(.unassigned-marker) {
  background: none;
  border: none;
}
.leaflet-popup-content-wrapper {
  background-color: var(--color-surface);
}

.leaflet-popup-tip {
  background-color: var(--color-surface);
}

.leaflet-container a.leaflet-popup-close-button {
  color: var(--color-text);
}
</style>
