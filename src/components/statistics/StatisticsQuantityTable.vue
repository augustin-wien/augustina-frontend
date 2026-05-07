<script lang="ts" setup>
import { exportAsCsv } from '@/utils/utils'

type TableItem = {
  id: number
  name: string
  value: number
}

const props = defineProps<{
  data: TableItem[]
}>()

const exportTable = () => {
  if (!props.data.length) {
    return
  }

  const header = ['Produkt', 'Menge']
  const rows = props.data.map((item: TableItem) => [item.name, item.value.toString()])

  exportAsCsv([header, ...rows], 'statistics_quantity')
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between mb-2">
      <h2 class="font-semibold">Verkaufte Menge pro Produkt</h2>
      <button class="py-2 px-3 rounded border bg-white" @click="exportTable">CSV Export</button>
    </div>
    <table class="table-auto w-full border-collapse">
      <thead>
        <tr>
          <th class="text-left border-b p-2">Produkt</th>
          <th class="text-right border-b p-2">Menge</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="`q-${item.id}`">
          <td class="border-b p-2">{{ item.name }}</td>
          <td class="border-b p-2 text-right">{{ item.value }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
