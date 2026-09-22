<script lang="ts" setup>
import { computed } from 'vue'
import { exportAsCsv } from '@/utils/utils'
import type { VendorUsageStatistics } from '@/stores/statistics'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Button from '@/components/ui/Button.vue'

type VendorUsageRow = {
  label: string
  count: number
  percentage: number
}

const props = defineProps<{
  data: VendorUsageStatistics | null
}>()

const rows = computed<VendorUsageRow[]>(() => {
  if (!props.data) {
    return []
  }

  return [
    {
      label: 'Nutzende Verkäufer',
      count: props.data.UsedVendors,
      percentage: props.data.UsedPercentage
    },
    {
      label: 'Nicht Nutzende Verkäufer',
      count: props.data.UnusedVendors,
      percentage: props.data.UnusedPercentage
    }
  ]
})

const exportTable = () => {
  if (!props.data) {
    return
  }

  const header = ['Kategorie', 'Anzahl', 'Prozent']

  const body = rows.value.map((row: VendorUsageRow) => [
    row.label,
    row.count.toString(),
    `${row.percentage.toFixed(2)}%`
  ])

  const totalRow = ['Gesamtanzahl Verkäufer', props.data.TotalVendors.toString(), '']

  exportAsCsv([header, ...body, totalRow], 'statistics_vendor_usage')
}
</script>

<template>
  <div>
    <div class="table-header">
      <h2 class="section-title">Anteil nutzender Verkäufer</h2>
      <Button variant="secondary" @click="exportTable">
        <font-awesome-icon :icon="faFileCsv" /> CSV Export
      </Button>
    </div>
    <table class="aug-table">
      <thead>
        <tr>
          <th>Kategorie</th>
          <th class="text-right">Anzahl</th>
          <th class="text-right">Prozent</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.label">
          <td>{{ row.label }}</td>
          <td class="text-right">{{ row.count }}</td>
          <td class="text-right">{{ row.percentage.toFixed(2) }}%</td>
        </tr>
      </tbody>
    </table>
    <p v-if="data" class="total-hint">Gesamtanzahl Verkäufer: {{ data.TotalVendors }}</p>
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
.total-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-top: 10px;
}
</style>
