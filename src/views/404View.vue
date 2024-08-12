<script setup lang="ts">
import keycloak from '@/keycloak/keycloak'
</script>

<template>
  error 404
  <div class="btn" @click="keycloak.keycloak?.login()">Login</div>
</template>
