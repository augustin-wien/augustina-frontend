<script lang="ts" setup>
import { vendorsStore } from '@/stores/vendor'
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import { faCashRegister } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useAuthLoad } from '@/composables/useAuthLoad'
import PageHeader from '@/components/ui/PageHeader.vue'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'

const vendorStore = vendorsStore()
const route = useRoute()
const vendor = computed(() => vendorStore.vendor)

useAuthLoad(() => {
  if (!route?.params?.ID) return
  vendorStore.getVendor(parseInt(route.params.ID.toString()))
})

const formatCredit = (credit: number) => {
  return (credit / 100).toFixed(2)
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader
        :title="`${$t('vendorSingular')} Profil ${vendor?.LicenseID ?? ''}`"
        show-back
        @back="router.push('/backoffice/vendorsummary')"
      />
    </template>
    <template #main>
      <Card v-if="vendor" class="section">
        <div class="detail-grid">
          <div class="detail-item">
            <span class="detail-label">{{ $t('firstName') }}</span>
            <span class="detail-value">{{ vendor.FirstName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('lastName') }}</span>
            <span class="detail-value">{{ vendor.LastName }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('LicenseId') }}</span>
            <span class="detail-value">{{ vendor.LicenseID }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('accountDeactivation') }}</span>
            <span class="detail-value">{{ $t(vendor.IsDisabled ? 'yes' : 'no') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('lastPayout') }}</span>
            <span class="detail-value">{{ vendor.LastPayout }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('currentCredit') }}</span>
            <span class="detail-value">{{ formatCredit(vendor.Balance) }} €</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">E-Mail</span>
            <span class="detail-value">{{ vendor.Email }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('telephone') }}</span>
            <span class="detail-value">{{ vendor.Telephone }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('vendorSince') }}</span>
            <span class="detail-value">{{ vendor.VendorSince }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('registrationDate') }}</span>
            <span class="detail-value">{{ vendor.RegistrationDate }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('language') }}</span>
            <span class="detail-value">{{ vendor.Language }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Online Karte</span>
            <span class="detail-value">{{ $t(vendor.OnlineMap ? 'yes' : 'no') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">Smartphone</span>
            <span class="detail-value">{{ $t(vendor.HasSmartphone ? 'yes' : 'no') }}</span>
          </div>
          <div class="detail-item">
            <span class="detail-label">{{ $t('bankAccount') }}</span>
            <span class="detail-value">{{ $t(vendor.HasBankAccount ? 'yes' : 'no') }}</span>
          </div>
          <div class="detail-item detail-span-2">
            <span class="detail-label">{{ $t('verificationLink') }}</span>
            <span class="detail-value">{{ vendor.AccountProofUrl }}</span>
          </div>
          <div class="detail-item detail-span-2">
            <span class="detail-label">{{ $t('comment') }}</span>
            <div class="detail-value">
              <div v-for="(comment, index) in vendor.Comments" :key="index">
                {{ comment }}
              </div>
            </div>
          </div>
        </div>

        <div class="profile-actions">
          <router-link :to="`/backoffice/userprofile/${vendor.ID}/update`">
            <Button variant="secondary">{{ $t('change') }}</Button>
          </router-link>
          <router-link :to="`/backoffice/pos/${vendor.LicenseID}`">
            <Button variant="secondary">
              <font-awesome-icon :icon="faCashRegister" /> {{ $t('posOpenPOS') }}
            </Button>
          </router-link>
        </div>
      </Card>
    </template>
  </component>
</template>

<style scoped>
.section {
  max-width: 640px;
  margin: 0 auto;
}
.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 24px;
}
.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-span-2 {
  grid-column: span 2;
}
.detail-label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.03em;
  color: var(--color-text-muted);
}
.detail-value {
  font-size: 14px;
  color: var(--color-text);
}
.profile-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
  margin-top: 24px;
}

@media (max-width: 640px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
  .detail-span-2 {
    grid-column: span 1;
  }
}
</style>
