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

const emit = defineEmits(['newLocation'])
const props = defineProps(['vendors', 'enableSearch'])

const provider = new OpenStreetMapProvider()

// GeoSearchControl has no types defined
const searchControl: any = new (GeoSearchControl as any)({
  provider: provider
})


const vendors = computed(() => props.vendors)

watch(vendors, () => {
  center.value = [vendors.value[0].Latitude, vendors.value[0].Longitude]
})

//Map configuration
const zoom = ref(12)
// Todo: Get the center from the settings
const center: Ref<PointExpression> = ref([48.2083, 16.3731])
const map: Ref<any> = ref(null)

function onMapReady(instance: any) {
  if (instance) {
    center.value = [vendors.value[0].Latitude, vendors.value[0].Longitude]
    map.value = instance
    
    map.value.on('dblclick', function (event: any) {
      alert('Latitude: ' + event.latlng.lat + ' \n Longitude: ' + event.latlng.lng)
    })
    if (props.enableSearch) {
      map.value.addControl(searchControl)
      map.value.on('geosearch/showlocation', function (event: any) {
        emit('newLocation', event)
      })
    }
  }
}
</script>

<template>
  <div v-if="vendors.length > 0" class="h-full">
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
        <li v-for="vendor in vendors" :key="vendor.licenseID">
          <l-marker
            v-if="vendor.Latitude && vendor.Longitude"
            :lat-lng="[vendor.Latitude, vendor.Longitude]"
          >
            <l-popup class="text-center text-black grid">
              <h2 class="text-xl font-semibold">{{ vendor.FirstName }}</h2>
              <span class="mb-2">{{ vendor.LcenseID }}</span>
              <RouterLink
                v-if="vendor.id"
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
