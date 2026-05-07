<script lang="ts" setup>
import { computed } from 'vue'
import { exportAsCsv } from '@/utils/utils'
import type { VendorUsageStatistics } from '@/stores/statistics'

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
    <div class="flex items-center justify-between mb-2">
      <h2 class="font-semibold">Anteil nutzender Verkäufer</h2>
      <button class="py-2 px-3 rounded border bg-white" @click="exportTable">CSV Export</button>
    </div>
    <table class="table-auto w-full border-collapse">
      <thead>
        <tr>
          <th class="text-left border-b p-2">Kategorie</th>
          <th class="text-right border-b p-2">Anzahl</th>
          <th class="text-right border-b p-2">Prozent</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="row in rows" :key="row.label">
          <td class="border-b p-2">{{ row.label }}</td>
          <td class="border-b p-2 text-right">{{ row.count }}</td>
          <td class="border-b p-2 text-right">{{ row.percentage.toFixed(2) }}%</td>
        </tr>
      </tbody>
    </table>
    <p v-if="data" class="text-sm text-gray-600 mt-2">
      Gesamtanzahl Verkäufer: {{ data.TotalVendors }}
    </p>
  </div>
</template>
