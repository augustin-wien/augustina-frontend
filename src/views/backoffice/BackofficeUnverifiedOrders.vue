<script setup lang="ts">
import { useOrdersStore } from '@/stores/orders'
import { useKeycloakStore } from '@/stores/keycloak'
import { onMounted, computed, watch, ref } from 'vue'
import ToastMessage from '@/components/ToastMessage.vue'

const ordersStore = useOrdersStore()
const keycloakStore = useKeycloakStore()

const authenticated = computed(() => keycloakStore.authenticated)
const toast = ref<{ message: string; type: string } | null>(null)

onMounted(() => {
  if (authenticated.value) {
    ordersStore.getUnverifiedOrders()
  } else {
    watch(authenticated, (newVal) => {
      if (newVal) {
        ordersStore.getUnverifiedOrders()
      }
    })
  }
})

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
    await ordersStore.verifyOrder(orderCode)
    toast.value = { message: 'Order verified successfully', type: 'success' }
    await ordersStore.getUnverifiedOrders()
  } catch (error) {
    console.error('Verification failed', error)
    toast.value = { message: 'Verification failed', type: 'error' }
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <h1 class="font-bold mt-3 pt-3 text-2xl">{{ $t('menuUnverifiedOrders') }}</h1>
    </template>
    <template #main>
      <div class="w-full h-full p-3">
        <ToastMessage :toast="toast" @close="toast = null" />
        <div class="overflow-x-auto relative shadow-md sm:rounded-lg">
          <table class="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead
              class="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400"
            >
              <tr>
                <th scope="col" class="py-3 px-6">Order ID</th>
                <th scope="col" class="py-3 px-6">Vendor License ID</th>
                <th scope="col" class="py-3 px-6">Date</th>
                <th scope="col" class="py-3 px-6">Amount</th>
                <th scope="col" class="py-3 px-6">Customer Email</th>
                <th scope="col" class="py-3 px-6">Action</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="order in unverifiedOrders"
                :key="order.ID"
                class="bg-white border-b dark:bg-gray-800 dark:border-gray-700"
              >
                <td class="py-4 px-6">{{ order.OrderCode }}</td>
                <td class="py-4 px-6">{{ getVendorLicenseId(order) }}</td>
                <td class="py-4 px-6">{{ new Date(order.Timestamp).toLocaleString() }}</td>
                <td class="py-4 px-6">{{ (calculateTotal(order.Entries) / 100).toFixed(2) }} €</td>
                <td class="py-4 px-6">{{ order.CustomerEmail }}</td>
                <td class="py-4 px-6">
                  <button
                    class="font-medium text-blue-600 dark:text-blue-500 hover:underline"
                    @click="handleVerify(order.OrderCode)"
                  >
                    Verify
                  </button>
                </td>
              </tr>
              <tr v-if="unverifiedOrders == null || unverifiedOrders.length === 0">
                <td colspan="6" class="py-4 px-6 text-center">No unverified orders found.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </template>
  </component>
</template>
