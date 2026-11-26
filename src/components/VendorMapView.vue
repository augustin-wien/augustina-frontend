<script lang="ts" setup>
import L from 'leaflet'

globalThis.L = L
import 'leaflet/dist/leaflet.css'
import type { PointExpression } from 'leaflet'
import type { Ref } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'vue-leaflet-markercluster/dist/style.css'
import { computed, watch, ref, shallowRef } from 'vue'
import type { Vendor, VendorLocation } from '@/stores/vendor'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'
import Button from '@/components/ui/Button.vue'

const emit = defineEmits(['newLocation', 'editMarker'])

const props = defineProps<{
  locations: VendorLocation[]
  enableSearch?: number | boolean
  vendor?: Vendor | null
  newCoords?: number | boolean
}>()

const provider = new OpenStreetMapProvider()

const searchControl = GeoSearchControl({ provider })

const locations = computed(() => props.locations)
const center: Ref<PointExpression> = ref([48.2083, 16.3731])

const centerMap = () => {
  if (locations.value.length > 0 && locations.value[0].latitude && locations.value[0].longitude) {
    center.value = [locations.value[0].latitude, locations.value[0].longitude]
  }
}

const updateMarkerPosition = () => {
  if (marker.value) {
    marker.value.setLatLng([locations.value[0].latitude, locations.value[0].longitude])
  }
}

centerMap()

watch(locations, () => {
  centerMap()
  updateMarkerPosition()
})

//Map configuration
const zoom = ref(12)
// Todo: Get the center from the settings
const map = shallowRef<L.Map | null>(null)
const marker = shallowRef<L.Marker | null>(null)
const markerCoords = ref<L.LatLng | null>(null)
const newMarker = ref(false)

const vendor = computed(() => props.vendor)

function onMapReady(instance: L.Map) {
  if (!instance) return

  map.value = instance

  instance.on('dblclick', (event: L.LeafletMouseEvent) => {
    alert('Latitude: ' + event.latlng.lat + ' \n Longitude: ' + event.latlng.lng)
  })

  if (props.enableSearch == 1) {
    instance.addControl(searchControl)

    instance.on('geosearch/showlocation', (event) => {
      emit('newLocation', event)
    })
  }

  if (props.newCoords == 1) {
    instance.setView([locations.value[0].latitude, locations.value[0].longitude], 10)
    newMarker.value = true

    const newCoordsMarker = L.marker([locations.value[0].latitude, locations.value[0].longitude], {
      draggable: true
    }).addTo(instance)

    newCoordsMarker.on('dragend', () => {
      markerCoords.value = newCoordsMarker.getLatLng()
      emit('editMarker', newCoordsMarker.getLatLng())
    })

    marker.value = newCoordsMarker
  }
}
</script>

<template>
  <div v-if="locations.length > 0" class="h-full w-full">
    <div style="height: 400px; width: 100%">
      <l-map
        v-model:zoom="zoom"
        :center="center"
        use-global-leaflet
        :max-zoom="18"
        @ready="onMapReady"
      >
        <l-tile-layer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          layer-type="base"
          name="OpenStreetMap"
        ></l-tile-layer>
        <li v-for="location in props.locations" :key="'location_' + location.id">
          123
          <l-marker
            v-if="location.latitude && location.longitude && !newMarker"
            :lat-lng="[location.latitude, location.longitude]"
          >
            <l-popup class="text-center text-black grid">
              <span class="font-bold">{{ location.name }}</span>
              <span>{{ location.address }}</span>
              <span>{{ location.zip }}</span>
              <span v-if="location.telephone"
                ><span class="font-bold mr-1">{{ $t('telephone') }}:</span
                ><a :href="`tel:${location.telephone}`">{{ location.telephone }}</a></span
              >
              <span
                ><span class="font-bold mr-1">{{ $t('workingTime') }}:</span
                >{{ location.working_time }}</span
              >
              <RouterLink
                v-if="vendor && vendor.ID"
                :to="{
                  name: 'Vendor Profile',
                  params: { ID: vendor.ID }
                }"
              >
                <Button variant="primary">{{ $t('edit') }}</Button>
              </RouterLink>
            </l-popup>
          </l-marker>
        </li>
      </l-map>
    </div>
  </div>
</template>

<style scoped>
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
