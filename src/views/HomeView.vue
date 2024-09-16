<script setup lang="ts"></script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      Bitte gehe zu deiner lieblings VerkäuferIn und kaufe dort eine Zeitung.
    </template>
  </component>
</template>
