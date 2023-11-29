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
                    </l-map>
                </div>
            </div>
        </template>
    </component>
</template>
  
<script lang="ts" setup>
import "leaflet/dist/leaflet.css";
import { LMap, LTileLayer } from "@vue-leaflet/vue-leaflet";
import { useMapStore } from '@/stores/map'
import { onMounted } from "vue";

const mapStore = useMapStore()

//Map configuration
const zoom = 12
const center = [48.2083, 16.3731]

onMounted(() => {
    mapStore.getLocations()
})
</script>
  
<style>

</style>