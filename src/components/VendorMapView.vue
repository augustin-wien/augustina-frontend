<script lang="ts" setup>
import L from 'leaflet'

globalThis.L = L
import 'leaflet/dist/leaflet.css'
import type { PointExpression } from 'leaflet'
import type { Ref } from 'vue'
import { LMap, LTileLayer, LMarker, LPopup } from '@vue-leaflet/vue-leaflet'
import 'vue-leaflet-markercluster/dist/style.css'
import { computed, watch, ref } from 'vue'
import { GeoSearchControl, OpenStreetMapProvider } from 'leaflet-geosearch'
import 'leaflet-geosearch/dist/geosearch.css'

const emit = defineEmits(['newLocation', 'editMarker'])
const props = defineProps(['locations', 'enableSearch', 'vendor', 'newCoords'])

const provider = new OpenStreetMapProvider()

// GeoSearchControl has no types defined
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const searchControl: any = new (GeoSearchControl as any)({
  provider: provider
})

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
const map: Ref<any> = ref(null)
const marker: Ref<any> = ref(null)
const markerCoords = ref(null)
const newMarker = ref(false)

const vendor = computed(() => props.vendor)

function onMapReady(instance: any) {
  if (instance) {
    map.value = instance

    map.value.on('dblclick', function (event: any) {
      alert('Latitude: ' + event.latlng.lat + ' \n Longitude: ' + event.latlng.lng)
    })

    if (props.enableSearch == 1) {
      map.value.addControl(searchControl)

      map.value.on('geosearch/showlocation', function (event: any) {
        emit('newLocation', event)
      })
    }

    if (props.newCoords == 1) {
      map.value.setView([locations.value[0].latitude, locations.value[0].longitude], 10)
      newMarker.value = true

      marker.value = L.marker([locations.value[0].latitude, locations.value[0].longitude], {
        draggable: true
      }).addTo(map.value)

      marker.value.on('dragend', function () {
        markerCoords.value = marker.value.getLatLng()
        emit('editMarker', marker.value.getLatLng())
      })
    }
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
        <li v-for="location in props.locations" :key="'location_' + location.Id">
          123
          <l-marker
            v-if="location.latitude && location.longitude && !newMarker"
            :lat-lng="[location.latitude, location.longitude]"
          >
            <l-popup class="text-center text-black grid">
              <span class="font-bold">{{ location.name }}</span>
              <span>{{ location.address }}</span>
              <span>{{ location.zip }}</span>
              <span
                ><span class="font-bold mr-1">{{ $t('workingTime') }}:</span
                >{{ location.working_time }}</span
              >
              <RouterLink
                v-if="vendor && vendor.Id"
                :to="{
                  name: 'Vendor Profile',
                  params: { ID: vendor.Id }
                }"
              >
                <button class="rounded-full customcolor py-2 px-3 h-10">
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

<style scoped>
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
