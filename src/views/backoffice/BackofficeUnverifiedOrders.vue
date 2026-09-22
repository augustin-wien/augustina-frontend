<script setup lang="ts">
import { useOrdersStore } from '@/stores/orders'
import { useSettingsStore } from '@/stores/settings'
import { computed, ref } from 'vue'
import ToastMessage from '@/components/ToastMessage.vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'

const ordersStore = useOrdersStore()
const settingsStore = useSettingsStore()
const toast = ref<{ message: string; type: string } | null>(null)
const odooEnabled = computed(() => !!settingsStore.settings?.OdooEnabled)

useAuthLoad(() => ordersStore.getUnverifiedOrders())

const unverifiedOrders = computed(() => ordersStore.unverifiedOrders)

const calculateTotal = (entries: any[]) => {
  if (!entries) return 0
  return entries.reduce((sum, entry) => sum + entry.Price * entry.Quantity, 0)
}

const getVendorLicenseId = (order: any) => {
  if (!order.Entries || order.Entries.length === 0) return ''
  const vendorId = order.Vendor
  const entry = order.Entries.find((e: any) => e.Sender === vendorId || e.Receiver === vendorId)

  if (entry) {
    if (entry.Sender === vendorId) return entry.SenderName
    if (entry.Receiver === vendorId) return entry.ReceiverName
  }

  return vendorId
}

const handleVerify = async (orderCode: string) => {
  try {
    await ordersStore.verifyAdminPayment(orderCode)
    toast.value = { message: 'Order verified successfully', type: 'success' }
    await ordersStore.getUnverifiedOrders()
  } catch (error: any) {
    console.error('Verification failed', error)
    const message = error.response?.data?.error?.message || 'Verification failed'
    toast.value = { message: message, type: 'error' }
  }
}

const handleAddTransactionID = async (orderCode: string) => {
  const transactionID = prompt('Please enter the Transaction ID:')

  if (transactionID) {
    try {
      await ordersStore.addTransactionID(orderCode, transactionID)
      toast.value = { message: 'Transaction ID added successfully', type: 'success' }
    } catch (error: any) {
      console.error('Failed to add Transaction ID', error)
      const message = error.response?.data?.error?.message || 'Failed to add Transaction ID'
      toast.value = { message: message, type: 'error' }
    }
  }
}

const handleResendToOdoo = async (orderID: number) => {
  try {
    await ordersStore.resendOdooWebhook(orderID)
    toast.value = { message: 'Transaction resend to Odoo triggered successfully', type: 'success' }
  } catch (error: any) {
    console.error('Resend to Odoo failed', error)
    const message = error.response?.data?.error?.message || 'Failed to resend transaction to Odoo'
    toast.value = { message: message, type: 'error' }
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('menuUnverifiedOrders')" />
    </template>
    <template #main>
      <ToastMessage :toast="toast" @close="toast = null" />
      <Card class="table-section">
        <table class="aug-table">
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Vendor License ID</th>
              <th>Transaction ID</th>
              <th>Date</th>
              <th>Amount</th>
              <th>Customer Email</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in unverifiedOrders" :key="order.ID">
              <td>{{ order.OrderCode }}</td>
              <td>{{ getVendorLicenseId(order) }}</td>
              <td>{{ order.TransactionID || 'N/A' }}</td>
              <td>{{ new Date(order.Timestamp).toLocaleString() }}</td>
              <td>{{ (calculateTotal(order.Entries) / 100).toFixed(2) }} €</td>
              <td>{{ order.CustomerEmail }}</td>
              <td class="entry-actions">
                <button type="button" class="link-btn" @click="handleVerify(order.OrderCode)">
                  Verify
                </button>
                <button
                  type="button"
                  class="link-btn"
                  @click="handleAddTransactionID(order.OrderCode)"
                >
                  Add Transaction ID
                </button>
                <button
                  v-if="odooEnabled"
                  type="button"
                  class="link-btn"
                  @click="handleResendToOdoo(order.ID)"
                >
                  Resend to Odoo
                </button>
              </td>
            </tr>
            <tr v-if="unverifiedOrders == null || unverifiedOrders.length === 0">
              <td colspan="7" class="entry-empty">No unverified orders found.</td>
            </tr>
          </tbody>
        </table>
      </Card>
    </template>
  </component>
</template>

<style scoped>
.table-section {
  overflow-x: auto;
}
.entry-actions {
  display: flex;
  gap: 14px;
}
.entry-empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: 16px;
}
.link-btn {
  border: none;
  background: none;
  padding: 0;
  color: var(--color-accent);
  font-weight: 600;
  cursor: pointer;
}
.link-btn:hover {
  text-decoration: underline;
}
</style>
