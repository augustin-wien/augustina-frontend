<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'
import { fetchPublicVendorSteckbrief } from '@/api/api'
import SteckbriefSheet, { type SteckbriefSheetData } from '@/components/SteckbriefSheet.vue'
import IconCross from '@/components/icons/IconCross.vue'

const route = useRoute()
const router = useRouter()
const settStore = useSettingsStore()

const vendorId = String(Array.isArray(route.params.id) ? route.params.id[0] : route.params.id)
const steckbrief = ref<SteckbriefSheetData | null>(null)

const back = () => {
  if (window.history.state?.back) router.back()
  else router.push({ name: 'LandingPage', params: { id: vendorId } })
}

onMounted(async () => {
  settStore.getSettingsFromApi()

  try {
    const res = await fetchPublicVendorSteckbrief(vendorId)
    steckbrief.value = res.data
  } catch {
    router.replace({ name: 'LandingPage', params: { id: vendorId } })
  }
})
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <div class="shop-steckbrief">
        <div class="close-row">
          <button
            type="button"
            class="close-btn"
            :style="{ background: settStore.settings.Color || '#000' }"
            :aria-label="$t('back')"
            @click="back"
          >
            <IconCross aria-hidden="true" />
          </button>
        </div>
        <SteckbriefSheet v-if="steckbrief" :steckbrief="steckbrief" />
        <div v-else class="loading" aria-busy="true" />
      </div>
    </template>
  </component>
</template>

<style scoped>
.shop-steckbrief {
  width: min(560px, calc(100vw - 32px));
  margin: 0 auto;
  padding: 8px 0 24px;
}
.close-row {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 8px;
}
.close-btn {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
}
.loading {
  height: 360px;
}
</style>
