<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full grid grid-rows-">
                <div className="flex items-center font-semibold text-3xl place-content-center">
                    E-Paper
                </div>
                <div className="flex text-center w-full place-content-center text-l">
                    E-Paper ist eine Option zur digitalen Zeitung. Diese wird dir nach deinem Kauf in unserem Online-Magazin angezeigt.
                </div>
                <div className="flex items-center font-semibold text-3xl place-content-center">
                    Print-Version
                </div>
                <div className="flex text-center w-full place-content-center text-l">
                    Die Print-Version ist die klassische physische Zeitung. Ihr_e Verkäufer_in wird Ihnen diese nach
                    Abschluss des Kaufes aushändigen.
                </div>
                <div className="flex place-items-center w-full">
                    <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
                        <RouterLink to="/print-digital">Zurück</RouterLink>
                    </button>
                </div>
            </div>
        </template>
    </component></template>
