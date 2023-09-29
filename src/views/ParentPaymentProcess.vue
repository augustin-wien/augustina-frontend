<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted } from 'vue'
import { useRoute } from 'vue-router';
import { settingsStore } from '@/stores/settings';
import { useVendorStore } from '@/stores/vendor';

const settStore = settingsStore()
const vendorStore = useVendorStore()
const fetch = settStore.getSettingsFromApi
const route = useRoute()
const checkID = vendorStore.checkID
const id = route.params.id

onMounted(()=> checkID(id))
</script>

<template>
    <div>
        <RouterView />
    </div>
</template>
