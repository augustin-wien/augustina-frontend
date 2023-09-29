<script setup lang="ts">
import { RouterView } from 'vue-router';
</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div class="h-full w-full">
                <RouterView />
            </div>
        </template>
    </component>
</template>
