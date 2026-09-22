<script lang="ts" setup>
import { exportAsCsv } from '@/utils/utils'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Button from '@/components/ui/Button.vue'

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
    <div class="table-header">
      <h2 class="section-title">Verkaufte Menge pro Produkt</h2>
      <Button variant="secondary" @click="exportTable">
        <font-awesome-icon :icon="faFileCsv" /> CSV Export
      </Button>
    </div>
    <table class="aug-table">
      <thead>
        <tr>
          <th>Produkt</th>
          <th class="text-right">Menge</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in data" :key="`q-${item.id}`">
          <td>{{ item.name }}</td>
          <td class="text-right">{{ item.value }}</td>
        </tr>
      </tbody>
    </table>
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
</style>
