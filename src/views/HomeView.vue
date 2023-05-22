<script setup lang="ts">
import TheWelcome from '../components/TheWelcome.vue'
import HelloWorld from '../components/HelloWorld.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
        <RouterLink to="/landingpage">Landing</RouterLink>
      </nav>
    </div>
  </header>
  <main>
    <TheWelcome />
  </main>
</template>
