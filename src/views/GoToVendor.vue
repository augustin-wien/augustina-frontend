<script setup lang="ts">
import { settingsStore } from '@/stores/settings';

const settStore = settingsStore()
settStore.getSettingsFromApi()
</script>

<template>
    <component :is="$route.meta.layout || 'div'">
        <template #main>
            <div className="h-full font-semibold grid text-xl">
                <div class="text-center">
                    {{ $t("invalid") }}
                </div>
                <div class="p-10">
                    <img alt="Error Alert" className="alert-img mx-auto my-1" src="@/assets/red-alert-icon.svg" />
                </div>
                <div class="text-center mb-5">
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
.alert-img {
    animation: shake 0.5s;
    animation-iteration-count: 2;
    animation-timing-function: linear;
    max-height: 20vh;
}

@keyframes shake {
  0% { transform: translate(1px, 1px) rotate(0deg); }
  10% { transform: translate(-1px, -2px) rotate(-1deg); }
  20% { transform: translate(-3px, 0px) rotate(1deg); }
  30% { transform: translate(3px, 2px) rotate(0deg); }
  40% { transform: translate(1px, -1px) rotate(1deg); }
  50% { transform: translate(-1px, 2px) rotate(-1deg); }
  60% { transform: translate(-3px, 1px) rotate(0deg); }
  70% { transform: translate(3px, 1px) rotate(-1deg); }
  80% { transform: translate(-1px, -1px) rotate(1deg); }
  90% { transform: translate(1px, 2px) rotate(0deg); }
  100% { transform: translate(1px, -2px) rotate(-1deg); }
}
</style>
