<script setup lang="ts">
import { settingsStore } from '@/stores/settings';

const settStore = settingsStore()
settStore.getSettingsFromApi
</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full grid grid-rows-5 font-semibold text-2xl">
                <div class="text-center">
                    {{ $t("invalid") }}
                </div>
                <div class="row-span-2">
                    <img alt="Error Alert" className="logo mx-auto my-1" src="@/assets/red-alert-icon.svg" width="180"
                        height="105" />
                </div>
                <div class="text-center text-xl">
                    {{ $t("gotovendor") }}
                </div>
                <a class="w-full" href="https://www.augustin.or.at">
                    <button class="customcolor background-color rounded-full p-5 text-white text-3xl w-full font-semibold">
                        {{ $t("augustin") }}
                    </button>
                </a>
            </div>
        </template>
    </component>
</template>

<style scoped>
.customcolor {
    background-color: v-bind(settStore.settings.Color);
}
</style>

