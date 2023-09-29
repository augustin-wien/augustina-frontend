<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted } from 'vue';
import { useVendorStore } from '@/stores/vendor';
import { useRoute } from 'vue-router';

const vendorStore = useVendorStore()
const checkid = vendorStore.checkID
const route = useRoute()
const id = route.params.id

onMounted(() => checkid(id))
</script>

<template>
    <div>
        <RouterView />
    </div>
</template>
