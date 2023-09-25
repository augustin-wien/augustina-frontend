<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center  space-y-3 space-x-3">
          <h1 className="font-bold mt-3 pt-3 text-2xl">Umsätze</h1>
          <p className="text-lg">Zeitraum eingeben:</p>
          <VueDatePicker
            v-model="date"
            range
            :enable-time-picker="false"
            placeholder="Zeitraum wählen"
            @range-start="onRangeStart"
            @range-end="onRangeEnd"
          />
          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th className="p-3">Datum</th>
                <th className="p-3">Betrag</th>
                <th className="p-3">Nummer</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr v-for="(payment, id) in payments" :key="id">
                <td className="border-t-2 p-3">{{ payment.orderEntry }}</td>
                <td className="border-t-2 p-3">{{ payment.amount }} €</td>
                <td className="border-t-2 p-3">{{ payment.receiver }}</td>
              </tr>
            </tbody>
          </div>
        </div>
      </main>
    </template>
  </component>
</template>

<script lang="ts" setup>
import VueDatePicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { ref, onMounted, computed } from 'vue'
import { paymentlist } from '../stores/paymentdata'

const date = ref()
const startDate = ref('')
const endDate = ref('')

// For demo purposes assign range from the current date
onMounted(() => {
  const startDate = new Date()
  const endDate = new Date(new Date().setDate(startDate.getDate() + 7))
  date.value = [startDate, endDate]
})

const store = paymentlist()
//fetch paymentlist data once component is mounted

const onRangeStart = (value: any) => {
  startDate.value = value.toISOString() // Update the startDate variable
  store.getPayments(startDate.value, endDate.value)
}

const onRangeEnd = (value: any) => {
  endDate.value = value.toISOString() // Update the endDate variable
  store.getPayments(startDate.value, endDate.value)
}

const payments = computed(() => store.paymentlist)
</script>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>
