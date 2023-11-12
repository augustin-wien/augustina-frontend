<script setup lang="ts">
import { RouterView } from 'vue-router';
import { onMounted } from 'vue'
import { useRoute } from 'vue-router';
import { useVendorStore } from '@/stores/vendor';

const vendorStore = useVendorStore()
const route = useRoute()
const checkID = vendorStore.checkID
const id = route.params.id

//onMounted(()=> checkID(id))
</script>

<template>
    <div>
        <RouterView />
    </div>
</template>
