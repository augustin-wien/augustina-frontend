<script setup lang="ts"></script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div id="error-page">
        <h1 class="text-3xl my-6 font-bold text-red-800">{{ $t('error') }}</h1>
        <p>{{ $t('errorText') }}</p>
      </div>
    </template>
  </component>
</template>
