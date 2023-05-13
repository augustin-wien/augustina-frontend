
<template>
    <div class="about">
      <h1>Choose a color</h1>
        <div class="button">
            <p>Red </p>
            <button @click="increment(0)">+</button>
            <p>{{ rgb[0] }}</p>
            <button @click="decrement(0)">-</button>
        </div>
    </div>
    
  </template>
  
  <style>
  @media (min-width: 1024px) {
    
    .about {
      min-height: 100vh;
      display: flex;
      align-items: center;
    }
    .button {
        display: flex;
        align-items: flex;
    }
    .varcolor {
      font-size: var(--text-color);
    }
  }
  </style>
    
  <script setup lang="ts">
    import { useColorStore } from '@/stores/counter'
    import { storeToRefs } from 'pinia';

    const colorStore = useColorStore()
    const rgb = colorStore.$state.rgb
    const increment = colorStore.increment
    const decrement = colorStore.decrement
</script>