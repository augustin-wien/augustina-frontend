<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full grid grid-rows-5 font-semibold text-2xl">
                <div class="text-center">
                    Die gescannte ID ist nicht gültig
                </div>
                <div class="row-span-2">
                    <img alt="Error Alert" className="logo mx-auto my-1" src="@/assets/red-alert-icon.svg" width="180" height="105" />
                </div>
                <div class="text-center pt-8">
                    Gehen sie zu einer/m Verkäufer/in
                </div>
                <RouterLink class="w-full" to="{ name: 'LandingPage' }">
                    <button class="bg-green-600 rounded-full p-5 text-white text-3xl font font-semibold w-full">
                        Start
                    </button>
                </RouterLink>
            </div>
        </template>
    </component>
</template>
