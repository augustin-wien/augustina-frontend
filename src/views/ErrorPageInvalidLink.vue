<script setup lang="ts">
import FeedbackForm from '@/components/FeedbackForm.vue'
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <h1 class="text-3xl my-6 font-bold text-red-800">{{ $t('error') }}</h1>
      <p>{{ $t('errorTextInvalidLink') }}</p>
      <FeedbackForm class="mt-6" />
    </template>
  </component>
</template>
