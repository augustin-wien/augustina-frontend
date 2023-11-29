<template>
    <component :is="$route.meta.layout || 'div'">
        <template #header>
            <h1 className="font-bold mt-3 pt-3 text-2xl">{{ $t("menuMap") }}</h1>

        </template>
        <template #main>
            <div class="h-full">
                <div style="height:600px; width:800px">
                    <l-map ref="map" v-model:zoom="zoom" :center="[47.41322, -1.219482]">
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
const zoom = 2
</script>
  
<style>
#map {
    height: 180px;
}
</style>