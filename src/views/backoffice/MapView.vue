<template>
    <component :is="$route.meta.layout || 'div'">
        <template #header>
            <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t("menuMap") }}</h1>

        </template>
        <template #main>
            <div class="h-full">
                <div style="height:550px; width:100%">
                    <l-map ref="map" v-model:zoom="zoom" v-model:center="center">
                        <l-tile-layer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" layer-type="base"
                            name="OpenStreetMap"></l-tile-layer>
                        <li v-for="vendor in mapStore.vendors" :key="vendor.licenseID">
                            <l-marker :lat-lng="[vendor.latitude, vendor.longitude]">
                                <l-popup class="text-center font-semibold text-white">{{ vendor.firstName }}<br>{{ vendor.licenseID }} </l-popup>
                            </l-marker>
                        </li>
                    </l-map>
                </div>
            </div>
        </template>
    </component>
</template>
  
<script lang="ts" setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer, LMarker, LPopup } from "@vue-leaflet/vue-leaflet";
import { useMapStore } from '@/stores/map'
import { onMounted } from "vue";

const mapStore = useMapStore()

const map = LMap
const marker = LMarker

//Map configuration
const zoom = 12
const center = [48.2083, 16.3731]

onMounted(() => {
    mapStore.getLocations()
})
</script>
  
<style>

.leaflet-popup-content-wrapper {
    background-color: #65a30d;
}

.leaflet-popup-content-wrapper .leaflet-popup-content {
}

.leaflet-popup-tip {
    background-color: #65a30d;
}

.leaflet-container a.leaflet-popup-close-button:hover, .leaflet-container a.leaflet-popup-close-button:focus {
    color: rgb(255 255 255);
}
</style>