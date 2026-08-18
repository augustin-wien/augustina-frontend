<script setup lang="ts">
import { RouterView, useRouter } from 'vue-router'
import { useFavicon } from '@vueuse/core'
import { onMounted } from 'vue'
import { useSettingsStore } from '@/stores/settings'
import { initMatomo } from '@/utils/matomo'

const favicon = import.meta.env.VITE_API_URL + 'img/favicon.png'
useFavicon(favicon)

const settingsStore = useSettingsStore()
const router = useRouter()

// Matomo is configured per tenant in the backend settings, so it can only be started once those
// are loaded. Without a configured url and site id nothing is loaded at all.
onMounted(async () => {
  // Both have to be in place: the settings carry the configuration, and the router has to have
  // resolved the first route so it is that route which gets counted.
  await Promise.all([settingsStore.getSettingsFromApi(), router.isReady()])
  initMatomo(settingsStore.settings, router)
})
</script>

<template>
  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style>
