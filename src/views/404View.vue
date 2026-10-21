<script setup lang="ts">
import { login } from '@/keycloak/keycloak'
</script>

<template>
  error 404
  <div class="btn" @click="login()">Login</div>
</template>
