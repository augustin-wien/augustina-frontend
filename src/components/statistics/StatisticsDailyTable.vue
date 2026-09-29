<script lang="ts" setup>
import { exportAsCsv } from '@/utils/utils'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Button from '@/components/ui/Button.vue'
import type { DailyStatistics } from '@/utils/dailyStatistics'

const props = withDefaults(
  defineProps<{
    data: DailyStatistics
    title: string
    filename: string
    format?: (value: number) => string
  }>(),
  { format: (value: number) => value.toLocaleString('de-AT') }
)

const formatDate = (label: string) => label.split('-').reverse().join('.')

const exportTable = () => {
  if (!props.data.series.length) {
    return
  }

  const header = ['Datum', ...props.data.series.map((s) => s.name)]

  const rows = props.data.labels.map((label, i) => [
    formatDate(label),
    ...props.data.series.map((s) => (s.values[i] ?? 0).toString())
  ])

  exportAsCsv([header, ...rows], props.filename)
}
</script>

<template>
  <div>
    <div class="table-header">
      <h2 class="section-title">{{ title }}</h2>
      <Button variant="secondary" @click="exportTable">
        <font-awesome-icon :icon="faFileCsv" /> CSV Export
      </Button>
    </div>
    <div class="table-scroll">
      <table class="aug-table">
        <thead>
          <tr>
            <th>Datum</th>
            <th v-for="series in data.series" :key="series.key" class="text-right">
              {{ series.name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(label, i) in data.labels" :key="label">
            <td>{{ formatDate(label) }}</td>
            <td v-for="series in data.series" :key="series.key" class="text-right">
              {{ format(series.values[i] ?? 0) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
}
.table-scroll {
  overflow-x: auto;
}
</style>
