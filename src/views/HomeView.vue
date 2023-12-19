<script setup lang="ts">
const apiUrl = import.meta.env.VITE_API_URL as string
console.log(apiUrl)
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      Bitte gehe zu deiner lieblings VerkäuferIn und kaufe dort eine Zeitung.
    </template>
  </component>
</template>
