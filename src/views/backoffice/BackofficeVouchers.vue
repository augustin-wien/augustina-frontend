<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { fetchVouchers, fetchVoucherPDF, resendVoucher, setVoucherDisabled } from '@/api/api'
import type { AbonementVoucher } from '@/api/api'
import { maskEmail } from '@/utils/maskEmail'
import { useAuthLoad } from '@/composables/useAuthLoad'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import Toast from '@/components/ToastMessage.vue'

const { t, locale } = useI18n()

const vouchers = ref<AbonementVoucher[]>([])
const searchQuery = ref('')
const toast = ref<{ type: string; message: string } | null>(null)

const load = async () => {
  try {
    vouchers.value = (await fetchVouchers()).data ?? []
  } catch {
    showToast('error', t('voucherLoadFailed'))
  }
}

useAuthLoad(load)

const showToast = (type: string, message: string) => {
  toast.value = { type, message }

  setTimeout(() => {
    toast.value = null
  }, 5000)
}

const formatDate = (date?: string | null) =>
  date ? new Date(date).toLocaleDateString(locale.value) : '–'

const displayVouchers = computed(() => {
  const q = searchQuery.value.trim().toLowerCase()
  if (!q) return vouchers.value
  return vouchers.value.filter(
    (v) =>
      v.Code.toLowerCase().includes(q) ||
      v.BuyerEmail.toLowerCase().includes(q) ||
      (v.RedeemedEmail ?? '').toLowerCase().includes(q) ||
      v.RecipientName.toLowerCase().includes(q)
  )
})

const statusVariants: Record<string, 'info' | 'success' | 'danger'> = {
  active: 'info',
  redeemed: 'success',
  disabled: 'danger'
}

const statusVariant = (status: string) => statusVariants[status] ?? 'info'

const openPDF = async (v: AbonementVoucher) => {
  try {
    const res = await fetchVoucherPDF(v.ID)
    const url = URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
    window.open(url, '_blank')
    setTimeout(() => URL.revokeObjectURL(url), 60000)
  } catch {
    showToast('error', t('voucherPdfFailed'))
  }
}

const resend = async (v: AbonementVoucher) => {
  const email = window.prompt(t('voucherResendPrompt'), v.BuyerEmail)
  if (email === null) return

  try {
    await resendVoucher(v.ID, email.trim() === v.BuyerEmail ? '' : email.trim())
    showToast('success', t('voucherResent'))
  } catch (err: any) {
    showToast('error', t('voucherResendFailed') + ' ' + (err?.response?.data?.error?.message ?? ''))
  }
}

const toggleDisabled = async (v: AbonementVoucher) => {
  const disable = v.Status === 'active'
  if (disable && !window.confirm(t('voucherDisableConfirm', { code: v.Code }))) return

  try {
    const updated = (await setVoucherDisabled(v.ID, disable)).data
    const idx = vouchers.value.findIndex((x) => x.ID === v.ID)
    if (idx >= 0) vouchers.value[idx] = { ...vouchers.value[idx], ...updated }
  } catch (err: any) {
    showToast('error', err?.response?.data?.error?.message ?? String(err))
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('menuVouchers')">
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="$t('voucherSearchPlaceholder')"
          class="aug-input"
          style="width: auto"
        />
      </PageHeader>
    </template>

    <template #main>
      <div class="main">
        <Card>
          <table class="aug-table">
            <thead>
              <tr>
                <th>{{ $t('voucherCode') }}</th>
                <th>{{ $t('voucherProduct') }}</th>
                <th>{{ $t('voucherBoughtAt') }}</th>
                <th>{{ $t('voucherBuyer') }}</th>
                <th>{{ $t('voucherRecipientName') }}</th>
                <th>{{ $t('voucherStatusHeader') }}</th>
                <th>{{ $t('voucherRedeemedBy') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="v in displayVouchers" :key="v.ID">
                <td class="font-mono whitespace-nowrap">{{ v.Code }}</td>
                <td>{{ v.ItemName }} ({{ v.DurationMonths }} M.)</td>
                <td>{{ formatDate(v.CreatedAt) }}</td>
                <td>{{ maskEmail(v.BuyerEmail) }}</td>
                <td>{{ v.RecipientName || '–' }}</td>
                <td>
                  <Badge :variant="statusVariant(v.Status)">
                    {{ $t('voucherStatus_' + v.Status) }}
                  </Badge>
                </td>
                <td>
                  <template v-if="v.RedeemedEmail">
                    {{ maskEmail(v.RedeemedEmail) }}<br />
                    <span class="text-xs">{{ formatDate(v.RedeemedAt) }}</span>
                  </template>
                  <template v-else>–</template>
                </td>
                <td>
                  <div class="actions">
                    <Button variant="secondary" @click="openPDF(v)">PDF</Button>
                    <Button variant="secondary" @click="resend(v)">
                      {{ $t('voucherResend') }}
                    </Button>
                    <Button
                      v-if="v.Status !== 'redeemed'"
                      :variant="v.Status === 'active' ? 'danger' : 'secondary'"
                      @click="toggleDisabled(v)"
                    >
                      {{ v.Status === 'active' ? $t('voucherDisable') : $t('voucherEnable') }}
                    </Button>
                  </div>
                </td>
              </tr>
              <tr v-if="displayVouchers.length === 0">
                <td colspan="8" class="p-4 text-center text-gray-500">
                  {{ $t('noVouchers') }}
                </td>
              </tr>
            </tbody>
          </table>
        </Card>
      </div>
      <Toast v-if="toast" :toast="toast" @close="toast = null" />
    </template>
  </component>
</template>

<style scoped>
.actions {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: flex-end;
}
</style>
