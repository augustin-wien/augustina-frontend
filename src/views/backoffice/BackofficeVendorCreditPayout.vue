<script lang="ts" setup>
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import { useItemsStore } from '@/stores/items'
import { useAuthLoad } from '@/composables/useAuthLoad'
import type { Payment } from '@/stores/payments'
import { usePayoutStore } from '@/stores/payout'
import { vendorsStore, type Vendor } from '@/stores/vendor'
import { formatCredit, formatDate } from '@/utils/utils'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const store = vendorsStore()
const payoutStore = usePayoutStore()
const itemsStore = useItemsStore()

const paymentsForPayout = computed(() => payoutStore.paymentsForPayout)

// Compute a reactive property for vendors
const vendors = computed(() => store.vendors)

// Get the current route
const route = useRoute()
const idparams = route.params.ID
const vendorID = Number(idparams) // Convert the string to a number or NaN
const items = computed(() => itemsStore.itemsBackoffice)

const setVendor = () => {
  if (store.vendors.length === 0) return null

  if (!isNaN(vendorID)) {
    // Find the vendor in the 'vendors' array that matches the 'ID' parameter
    const val = store.vendors.find((vend: Vendor) => {
      return vend.ID === vendorID
    })

    if (!val) {
      // Return null if the 'ID' parameter is not a valid number
      return null
    }

    if (items?.value.length === 0) itemsStore.getItemsBackoffice()
    payoutStore.getPaymentsForPayout(val.LicenseID)
    return val
  } else {
    // Return null if the 'ID' parameter is not a valid number
    return null
  }
}

// Compute the 'vendor' property based on the 'ID' parameter
const vendor = ref<Vendor | null>(setVendor())

watch(vendor, (val: Vendor | null) => {
  if (val) {
    amount.value = val.Balance / 100
    payoutStore.getPaymentsForPayout(val.LicenseID)
  }
})

watch(store.vendors, () => {
  itemsStore.getItemsBackoffice()
  if (vendor.value) payoutStore.getPaymentsForPayout(vendor.value.LicenseID)
})

// Initialize a reactive property 'amount' for input data
const amount = ref<number>(0.0)

useAuthLoad(() => {
  itemsStore.getItemsBackoffice()

  if (route?.params?.ID) {
    store.getVendor(parseInt(route.params.ID.toString()))
  }

  if (vendor.value) {
    amount.value = vendor.value.Balance / 100
  }

  if (vendors.value.length === 0) {
    store.getVendors().then(() => {
      vendor.value = setVendor()
    })
  }
})

// post the amount with the licenseID to the payout store
const payoutVendor = async () => {
  if (!vendor.value) return

  const data = {
    VendorLicenseID: vendor.value.LicenseID,
    From: null,
    To: null
  }

  payoutStore
    .postPayout(data)
    .then(() => {
      router.push('/backoffice/credits')
    })
    .catch((error) => {
      // eslint-disable-next-line no-console
      console.log(error)

      if (error?.message && error?.response?.data?.error?.message) {
        showToast('error', error.message + ' ' + error.response.data.error.message)
      } else if (error) {
        showToast('error', JSON.stringify(error))
      } else {
        showToast('error', 'unknown error')
      }
    })
}

const toast = ref<{ type: string; message: string } | null>(null)

const showToast = (type: string, message: string) => {
  toast.value = { type, message }

  setTimeout(() => {
    toast.value = null
  }, 5000)
}

const formatReceiver = (payment: Payment) => {
  const amount = formatCredit(payment.Amount)

  if (payment.ReceiverName === vendor.value?.LicenseID) {
    return `+${amount}`
  } else {
    return `-${amount}`
  }
}

const getItemName = (itemID: number) => {
  const item = items.value.find((item) => item.ID === itemID)

  if (item) {
    return item.Name
  } else {
    return 'Unbekannt'
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader
        :title="
          vendor ? `${vendor.LicenseID} ${vendor.FirstName} ${vendor.LastName}` : $t('menuPayouts')
        "
        show-back
        @back="router.push('/backoffice/credits')"
      />
    </template>

    <template #main>
      <Card v-if="vendor" class="section">
        <div class="balance-row">
          <span class="balance-label">{{ $t('menuCredits') }}</span>
          <span class="balance-value">{{ formatCredit(paymentsForPayout.balance) }} €</span>
        </div>

        <template v-if="vendor.Balance > 0">
          <h2 class="section-title">{{ $t('payout') }}</h2>
          <table class="aug-table">
            <tbody>
              <tr v-for="payment in paymentsForPayout.payments" :key="payment.ID">
                <td>{{ formatDate(payment.Timestamp) }}</td>
                <td v-if="items.length > 0">{{ getItemName(payment.Item) }}</td>
                <td>{{ formatReceiver(payment) }} €</td>
              </tr>
            </tbody>
          </table>
        </template>

        <div class="form-actions">
          <Button variant="primary" :disabled="vendor.Balance === 0" @click="payoutVendor">
            {{ vendor.Balance > 0 ? $t('confirmPayout') : $t('noCredits') }}
          </Button>
        </div>
      </Card>
      <Toast v-if="toast" :toast="toast" @close="toast = null" />
    </template>
  </component>
</template>

<style scoped>
.section {
  max-width: 480px;
  margin: 0 auto;
}
.balance-row {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  padding-bottom: 14px;
  margin-bottom: 16px;
  border-bottom: 1px solid var(--color-border);
}
.balance-label {
  font-size: 13px;
  color: var(--color-text-muted);
}
.balance-value {
  font-size: 20px;
  font-weight: 700;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 10px;
}
.form-actions {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
