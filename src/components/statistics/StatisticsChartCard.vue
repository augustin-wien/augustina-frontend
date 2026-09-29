<script lang="ts" setup>
import { faImage } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { ref } from 'vue'
import Card from '@/components/ui/Card.vue'
import { exportChartPng } from '@/utils/chartPng'

const props = defineProps<{
  title: string
  // Period printed on the exported image, e.g. "24.09.2026 – 26.09.2026"
  range: string
}>()

const bodyRef = ref<HTMLElement | null>(null)

const exportPng = () => {
  const canvas = bodyRef.value?.querySelector('canvas')

  if (canvas) {
    exportChartPng(canvas, props.title, props.range)
  }
}
</script>

<template>
  <Card>
    <div class="chart-card-header">
      <h2 class="chart-card-title">{{ title }}</h2>
      <button
        type="button"
        class="aug-icon-btn"
        title="Als PNG exportieren"
        aria-label="Als PNG exportieren"
        @click="exportPng"
      >
        <font-awesome-icon :icon="faImage" />
      </button>
    </div>
    <div ref="bodyRef">
      <slot />
    </div>
  </Card>
</template>

<style scoped>
.chart-card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 12px;
}
.chart-card-title {
  font-size: 15px;
  font-weight: 700;
}
</style>
