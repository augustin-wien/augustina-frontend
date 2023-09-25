<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { useVendorStore } from '@/stores/vendor';

const vendorStore = useVendorStore()
const checkid = vendorStore.checkID

//onMounted(()=>checkid($router.params.id))
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
