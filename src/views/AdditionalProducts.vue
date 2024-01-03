<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div className="h-full grid grid-rows-5 place-items-center">
        <div className="text-center font-semibold text-4xl row-span-2">
          Möchtest Du noch weitere Produkte kaufen?
        </div>
        <div className="flex place-items-center w-full">
          <RouterLink
            class="bg-green-600 rounded-full text-center p-7 text-white text-4xl font font-semibold w-full"
            to="/"
            >Ja</RouterLink
          >
        </div>
        <div className="flex place-items-center row-span-2 w-full">
          <RouterLink
            class="bg-green-600 rounded-full text-center p-7 text-white text-4xl font font-semibold w-full"
            to="/tipping"
            >Nein</RouterLink
          >
        </div>
      </div>
    </template>
  </component>
</template>
