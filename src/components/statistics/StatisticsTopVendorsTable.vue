<script lang="ts" setup>
import { exportAsCsv } from '@/utils/utils'
import { faFileCsv } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Button from '@/components/ui/Button.vue'
import type { VendorSalesStatistics } from '@/stores/statistics'

const props = defineProps<{
  data: VendorSalesStatistics[]
  title: string
  filename: string
}>()

const euro = (cents: number) =>
  (cents / 100).toLocaleString('de-AT', { style: 'currency', currency: 'EUR' })

const exportTable = () => {
  if (!props.data.length) {
    return
  }

  const header = ['Platz', 'Ausweisnummer', 'Name', 'Menge', 'Betrag (€)']

  const rows = props.data.map((vendor, i) => [
    (i + 1).toString(),
    vendor.LicenseID,
    vendor.Name,
    vendor.SumQuantity.toString(),
    (vendor.SumAmount / 100).toFixed(2)
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
    <table class="aug-table">
      <thead>
        <tr>
          <th class="text-right">#</th>
          <th>Ausweisnummer</th>
          <th>Name</th>
          <th class="text-right">Menge</th>
          <th class="text-right">Betrag</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(vendor, i) in data" :key="vendor.VendorID">
          <td class="text-right">{{ i + 1 }}</td>
          <td>{{ vendor.LicenseID }}</td>
          <td>{{ vendor.Name }}</td>
          <td class="text-right">{{ vendor.SumQuantity }}</td>
          <td class="text-right">{{ euro(vendor.SumAmount) }}</td>
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
