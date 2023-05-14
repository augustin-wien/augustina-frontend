
<template>
    <div class="colormenu">
      <h1>Choose a color</h1>
      <div class="setvalues">
          <p class="elements">Red  </p>
          <button class="elements" @click="increment(0)">+</button>
          <p class="elements">{{ rgb[0] }}</p>
          <button class="elements" @click="decrement(0)">-</button>
      </div>
      <div class="setvalues">
          <p class="elements">Green</p>
          <button class="elements" @click="increment(1)">+</button>
          <p class="elements">{{ rgb[1] }}</p>
          <button class="elements" @click="decrement(1)">-</button>
      </div>
      <div class="setvalues">
          <p class="elements">Blue </p>
          <button class="elements" @click="increment(2)">+</button>
          <p class="elements">{{ rgb[2] }}</p>
          <button class="elements" @click="decrement(2)">-</button>
      </div>
    </div>
    
  </template>
  
  <style>
  @media (min-width: 1024px) {
    
    .colormenu {
      min-height: 100vh;
      align-items: center;
      vertical-align: middle;
      text-align: center;
      position: relative;
      margin-top: 30%;
    }
    .setvalues {
        align-items: baseline;
        display: flex;
        margin: 5%;
        text-align:center;
        position:relative;
      }
    .elements {
      margin: 10px auto;
      display: inline-block;
      align-items: baseline;
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
    const customColor = colorStore.$state.color
    const increment = colorStore.increment
    const decrement = colorStore.decrement
</script>