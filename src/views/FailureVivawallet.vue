<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full font-semibold text-9xl">
                L
            </div>
        </template>
    </component></template>
