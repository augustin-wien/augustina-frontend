<script lang="ts" setup>
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { vendorsStore } from '@/stores/vendor'
import type { Vendor, VendorComment, VendorLocation } from '@/stores/vendor'
import { formatWorkingTimeSummary } from '@/utils/workingTime'
import { useRoute } from 'vue-router'
import Toast from '@/components/ToastMessage.vue'
import router from '@/router'
import VendorMapView from '@/components/VendorMapView.vue'
import AddressModal from '@/components/AddressModal.vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import FormField from '@/components/ui/FormField.vue'
import Modal from '@/components/ui/Modal.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const { t } = useI18n()

import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import CommentsModal from '@/components/CommentsModal.vue'

const store = vendorsStore()

const updatedVendor = ref<Vendor | null>(store.vendor)

const route = useRoute()

const vendorLocations = computed(() => store.vendorLocations)
const vendorComments = computed(() => store.vendorComments)

useAuthLoad(() => {
  if (!route?.params?.ID) return
  const vendorId = parseInt(route.params.ID.toString())

  store.getVendor(vendorId).then(() => {
    updatedVendor.value = store.vendor
  })

  store.getVendorLocations(vendorId)
  store.getVendorComments(vendorId)
})

watch(
  () => store.vendor,
  (newVal: Vendor | null) => {
    if (newVal && newVal !== null) {
      updatedVendor.value = newVal
    }
  }
)

const toast = ref<{ type: string; message: string } | null>(null)

const updateVendor = async () => {
  const newVendor = updatedVendor.value

  if (!newVendor) {
    return
  }

  if (newVendor.IsBlocked && !newVendor.BlockedNote?.trim()) {
    showToast('error', t('blockedNoteRequired'))
    return
  }

  try {
    const response = await store.updateVendor(newVendor as Vendor)

    if (response) {
      // eslint-disable-next-line no-console
      console.error('Error creating vendor:', response)
      showToast('error', t('The vendor could not be updated'))
    } else {
      showToast('success', t('The vendor has been updated'))
    }
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error updating vendor:', error)
    showToast('error', t('The vendor could not be updated'))
  }
}

const deleteVendor = async () => {
  if (!updatedVendor.value) {
    return
  }

  // check if vendor has still a balance
  if (updatedVendor.value.Balance > 0) {
    showToast('error', t('The vendor still has a balance and cannot be deleted'))
    return
  }

  try {
    store
      .deleteVendor(updatedVendor.value.ID)
      .catch((error: any) => {
        // eslint-disable-next-line no-console
        console.error('Error deleting vendor:', error)
        showToast('error', t('The vendor could not be deleted'))
      })
      .then(() => {
        router.push('/backoffice/vendorsummary')
      })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Error deleting vendor:', error)
    showToast('error', 'VerkäuferIn konnte nicht gelöscht werden')
  }
}

const showDeleteModal = ref(false)
const showAddressModal = ref(false)

const showToast = (type: string, message: string) => {
  // Set the toast message
  toast.value = { type, message }

  // Clear the toast after a delay (e.g., 5 seconds)
  setTimeout(() => {
    toast.value = null
  }, 5000)
}

const isEditLocation = ref(false)

const updateLocation = (newLocation: VendorLocation) => {
  const vendorId = updatedVendor.value?.ID

  if (vendorId) {
    if (isEditLocation.value && newLocation.id) {
      store.updateVendorLocation(newLocation, vendorId)
    } else {
      store.createVendorLocation(newLocation, vendorId)
    }
  }

  closeAddressModal()
}

const addLocation = () => {
  selectedLocation.value = null
  isEditLocation.value = false
  showAddressModal.value = true
}

const closeAddressModal = () => {
  selectedLocation.value = null
  isEditLocation.value = false
  showAddressModal.value = false
}

const editLocation = (location: VendorLocation) => {
  selectedLocation.value = [location]
  showAddressModal.value = true
  isEditLocation.value = true
}

const selectedLocation = ref<Array<VendorLocation> | null>(null)

const editComment = (comment: any) => {
  selectedComment.value = comment
  isNewComment.value = false
  showCommentsDialog.value = true
}

const showCommentsDialog = ref(false)
const selectedComment = ref<VendorComment | null>(null)
const isNewComment = ref(false)

const addNewComment = () => {
  selectedComment.value = {
    id: 0,
    comment: '',
    created_at: new Date(),
    warning: false,
    resolved_at: null,
    vendorid: updatedVendor.value?.ID || 0
  }

  isNewComment.value = true

  showCommentsDialog.value = true
}

const saveComment = (comment: VendorComment) => {
  if (updatedVendor.value && updatedVendor.value !== null) {
    if (isNewComment.value) {
      store.createVendorComment(comment, updatedVendor.value.ID).then(() => {
        //@ts-expect-error this is already checked
        store.getVendorComments(updatedVendor.value.ID)
      })
    } else {
      store.updateVendorComment(comment, updatedVendor.value.ID).then(() => {
        //@ts-expect-error this is already checked
        store.getVendorComments(updatedVendor.value.ID)
      })
    }
  }

  isNewComment.value = false
  showCommentsDialog.value = false
}

const cancelEditComment = () => {
  isNewComment.value = false
  showCommentsDialog.value = false
  selectedComment.value = null
}

const formatWorkingTime = (workingTime: VendorLocation['working_time']) =>
  formatWorkingTimeSummary(workingTime, t)
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader
        v-if="updatedVendor"
        :title="`${$t('vendorSingular')} ${updatedVendor.LicenseID} ${$t('change')}`"
        show-back
        @back="router.push('/backoffice/vendorsummary')"
      />
    </template>
    <template v-if="updatedVendor !== null" #main>
      <div class="main">
        <Card>
          <form @submit.prevent="updateVendor">
            <!-- Top row: form fields (left) + map (right) -->
            <div class="form-top-grid">
              <div class="field-grid">
                <FormField :label="`${$t('firstName')}:`" for="firstName">
                  <input
                    id="firstName"
                    v-model="updatedVendor.FirstName"
                    class="aug-input"
                    type="text"
                    required
                  />
                </FormField>
                <FormField :label="`${$t('lastName')}:`" for="lastName">
                  <input
                    id="lastName"
                    v-model="updatedVendor.LastName"
                    class="aug-input"
                    type="text"
                    required
                  />
                </FormField>
                <FormField :label="`${$t('E-Mail')}:`" for="email">
                  <input
                    id="email"
                    v-model="updatedVendor.Email"
                    class="aug-input"
                    type="email"
                    required
                  />
                </FormField>
                <FormField :label="`${$t('licenseId')}:`" for="licenseID">
                  <input
                    id="licenseID"
                    v-model="updatedVendor.LicenseID"
                    class="aug-input"
                    type="text"
                    required
                  />
                </FormField>
                <FormField :label="`${$t('telephone')}:`" for="telephone">
                  <input
                    id="telephone"
                    v-model="updatedVendor.Telephone"
                    class="aug-input"
                    type="text"
                  />
                </FormField>
                <FormField :label="`${$t('language')}:`" for="language">
                  <input
                    id="language"
                    v-model="updatedVendor.Language"
                    class="aug-input"
                    type="text"
                  />
                </FormField>
                <FormField :label="`${$t('registrationDate')}:`" for="registrationDate">
                  <input
                    id="registrationDate"
                    v-model="updatedVendor.RegistrationDate"
                    class="aug-input"
                    type="text"
                  />
                </FormField>
                <FormField :label="`${$t('vendorSince')}:`" for="vendorSince">
                  <input
                    id="vendorSince"
                    v-model="updatedVendor.VendorSince"
                    class="aug-input"
                    type="text"
                  />
                </FormField>
                <FormField :label="`${$t('deactivated')}:`" for="isDisabled">
                  <select id="isDisabled" v-model="updatedVendor.IsDisabled" class="aug-input">
                    <option :value="true">{{ $t('yes') }}</option>
                    <option :value="false">{{ $t('no') }}</option>
                  </select>
                </FormField>
                <FormField :label="`${$t('blocked')}:`" for="isBlocked">
                  <select id="isBlocked" v-model="updatedVendor.IsBlocked" class="aug-input">
                    <option :value="true">{{ $t('yes') }}</option>
                    <option :value="false">{{ $t('no') }}</option>
                  </select>
                </FormField>
                <FormField
                  v-if="updatedVendor.IsBlocked"
                  :label="`${$t('blockedNote')}:`"
                  for="blockedNote"
                  class="field-span-2"
                >
                  <textarea
                    id="blockedNote"
                    v-model="updatedVendor.BlockedNote"
                    class="aug-input"
                    rows="2"
                    required
                    :placeholder="$t('blockedNotePlaceholder')"
                  />
                </FormField>
                <FormField :label="`${$t('Has a smartphone')}:`" for="hasSmartphone">
                  <select
                    id="hasSmartphone"
                    v-model="updatedVendor.HasSmartphone"
                    class="aug-input"
                  >
                    <option :value="true">{{ $t('yes') }}</option>
                    <option :value="false">{{ $t('no') }}</option>
                  </select>
                </FormField>
                <FormField :label="`${$t('bankAccount')}:`" for="bankAccount">
                  <select id="bankAccount" v-model="updatedVendor.HasBankAccount" class="aug-input">
                    <option :value="true">{{ $t('yes') }}</option>
                    <option :value="false">{{ $t('no') }}</option>
                  </select>
                </FormField>
                <FormField :label="`${$t('verificationLink')}:`" for="verification">
                  <input
                    id="verification"
                    v-model="updatedVendor.AccountProofUrl"
                    class="aug-input"
                    type="url"
                  />
                </FormField>
                <FormField :label="`${$t('debt')}:`" for="debt" class="field-span-2">
                  <input id="debt" v-model="updatedVendor.Debt" class="aug-input" type="text" />
                </FormField>
              </div>

              <div class="vendor-map">
                <VendorMapView
                  v-if="vendorLocations && vendorLocations.length > 0"
                  :locations="vendorLocations"
                />
              </div>
            </div>

            <!-- Bottom row: locations (left) + comments (right) -->
            <div class="form-bottom-grid">
              <div>
                <div class="section-header">
                  <h2 class="section-title">{{ $t('vendor locations') }}</h2>
                  <Button type="button" variant="secondary" @click="addLocation">
                    {{ $t('New Location') }}
                  </Button>
                </div>
                <div v-if="vendorLocations && vendorLocations.length > 0" class="entry-list">
                  <div
                    v-for="location in vendorLocations"
                    :key="'location_' + location.id"
                    class="entry-row"
                  >
                    <div>
                      <div class="entry-title">{{ location.name }}</div>
                      <div class="entry-sub">{{ location.address }} {{ location.zip }}</div>
                      <div v-if="location.telephone" class="entry-sub">
                        {{ $t('telephone') }}: {{ location.telephone }}
                      </div>
                      <div v-if="location.working_time" class="entry-detail">
                        <span class="entry-detail-label">{{ $t('workingTime') }}:</span>
                        <span>{{ formatWorkingTime(location.working_time) }}</span>
                      </div>
                    </div>
                    <div class="entry-actions">
                      <button
                        type="button"
                        class="aug-icon-btn"
                        :title="$t('edit')"
                        @click.prevent="editLocation(location)"
                      >
                        <font-awesome-icon :icon="faPen" />
                      </button>
                      <button
                        type="button"
                        class="aug-icon-btn aug-icon-btn-danger"
                        :title="$t('delete')"
                        @click.prevent="store.deleteVendorLocation(updatedVendor.ID, location.id)"
                      >
                        <font-awesome-icon :icon="faTrash" />
                      </button>
                    </div>
                  </div>
                </div>
                <p v-else class="entry-empty">{{ $t('Vendor has no locations yet') }}</p>
              </div>

              <div>
                <div class="section-header">
                  <router-link
                    :to="`/backoffice/userprofile/${updatedVendor.ID}/comments`"
                    class="section-title-link"
                  >
                    {{ $t('comments') }} →
                  </router-link>
                  <Button type="button" variant="secondary" @click="addNewComment()">
                    {{ $t('Add a comment') }}
                  </Button>
                </div>
                <div v-if="vendorComments && vendorComments.length > 0" class="entry-list">
                  <div
                    v-for="comment in vendorComments"
                    :key="'comment_' + comment.id"
                    class="entry-row"
                    :class="{ 'entry-row-warning': comment.warning }"
                  >
                    <div class="entry-comment-body">
                      <div class="entry-date">
                        {{ new Date(comment.created_at).toLocaleDateString() }}
                      </div>
                      <div class="entry-comment-text">
                        <span v-if="comment.warning" class="entry-detail-label"
                          >{{ $t('warning') }}:
                        </span>
                        {{ comment.comment }}
                      </div>
                      <div
                        v-if="
                          comment.resolved_at && new Date(comment.resolved_at).getFullYear() > 1
                        "
                        class="entry-detail"
                      >
                        <span class="entry-detail-label">{{ $t('Resolved at') }}:</span>
                        <span>{{ new Date(comment.resolved_at).toLocaleDateString() }}</span>
                      </div>
                    </div>
                    <div class="entry-actions">
                      <button
                        type="button"
                        class="aug-icon-btn"
                        :title="$t('edit')"
                        @click.prevent="editComment(comment)"
                      >
                        <font-awesome-icon :icon="faPen" />
                      </button>
                      <button
                        id="delete-vendor-comment"
                        type="button"
                        class="aug-icon-btn aug-icon-btn-danger"
                        :title="$t('delete')"
                        @click.prevent="store.deleteVendorComment(updatedVendor.ID, comment.id)"
                      >
                        <font-awesome-icon :icon="faTrash" />
                      </button>
                    </div>
                  </div>
                </div>
                <p v-else class="entry-empty">{{ $t('noComments') }}</p>
              </div>
            </div>

            <div class="form-actions">
              <Button
                id="delete-vendor"
                type="button"
                variant="danger"
                @click="showDeleteModal = true"
              >
                {{ $t('delete') }}
              </Button>
              <Button type="submit" variant="primary">{{ $t('confirmation') }}</Button>
            </div>
          </form>
        </Card>
        <Toast v-if="toast" :toast="toast" @close="toast = null" />

        <Modal
          :open="showDeleteModal"
          :title="`${updatedVendor.LicenseID} ${updatedVendor.FirstName} ${$t('delete')}`"
          @close="showDeleteModal = false"
        >
          <p>{{ $t('vendordeletionConfirmation') }}</p>
          <template #footer>
            <Button variant="ghost" @click="showDeleteModal = false">{{ $t('cancel') }}</Button>
            <Button id="delete-vendor-confirm" variant="danger" @click="deleteVendor">
              {{ $t('delete') }}
            </Button>
          </template>
        </Modal>

        <AddressModal
          v-if="showAddressModal"
          :vendor="updatedVendor"
          :locations="selectedLocation"
          @close="closeAddressModal"
          @update="updateLocation"
        ></AddressModal>
        <CommentsModal
          v-if="showCommentsDialog"
          :comment="selectedComment"
          :vendor="updatedVendor"
          @close="cancelEditComment"
          @update="saveComment"
        ></CommentsModal>
      </div>
    </template>
  </component>
</template>

<style scoped>
.form-top-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
  align-content: start;
}
.field-span-2 {
  grid-column: span 2;
}
.vendor-map {
  min-height: 190px;
  overflow: hidden;
  border-radius: var(--radius-sm);
}
.form-bottom-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}
.section-title {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-muted);
}
.section-title-link {
  font-size: 13px;
  font-weight: 700;
  color: var(--color-text-muted);
}
.section-title-link:hover {
  text-decoration: underline;
}
.entry-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-height: 190px;
  overflow-y: auto;
  padding-right: 4px;
}
.entry-row {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface-alt);
  padding: 10px 12px;
}
.entry-row-warning {
  color: var(--color-danger);
}
.entry-comment-body {
  width: 100%;
}
.entry-title {
  font-size: 13px;
  font-weight: 700;
}
.entry-sub {
  font-size: 12px;
  color: var(--color-text-muted);
}
.entry-detail {
  font-size: 11px;
  color: var(--color-text-muted);
  margin-top: 4px;
}
.entry-detail-label {
  font-weight: 700;
  margin-right: 4px;
}
.entry-date {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: 2px;
}
.entry-comment-text {
  font-size: 13px;
  word-break: break-word;
}
.entry-actions {
  display: flex;
  align-items: flex-start;
  gap: 2px;
  flex-shrink: 0;
}
.entry-empty {
  font-size: 13px;
  color: var(--color-text-muted);
}
.form-actions {
  display: flex;
  justify-content: space-between;
}

@media (max-width: 900px) {
  .form-top-grid,
  .form-bottom-grid,
  .field-grid {
    grid-template-columns: 1fr;
  }
  .field-span-2 {
    grid-column: span 1;
  }
}
</style>
