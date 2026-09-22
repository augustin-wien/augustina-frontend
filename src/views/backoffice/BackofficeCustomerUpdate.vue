<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import router from '@/router'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { useCustomerStore } from '@/stores/customer'
import type { Customer, Abonement } from '@/stores/customer'
import { useItemsStore } from '@/stores/items'
import { fetchLicenseGroups } from '@/api/api'
import Toast from '@/components/ToastMessage.vue'
import { faTrash, faPen, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import Card from '@/components/ui/Card.vue'
import Button from '@/components/ui/Button.vue'
import Badge from '@/components/ui/Badge.vue'
import FormField from '@/components/ui/FormField.vue'
import Modal from '@/components/ui/Modal.vue'
import PageHeader from '@/components/ui/PageHeader.vue'

const route = useRoute()
const store = useCustomerStore()
const itemsStore = useItemsStore()

const isNew = computed(() => route.params.ID === 'new')
const customerId = computed(() => (isNew.value ? null : parseInt(route.params.ID as string)))

const form = ref<Partial<Customer>>({
  keycloakid: '',
  email: '',
  firstname: '',
  lastname: '',
  licensegroups: []
})

const abonements = computed(() => store.abonements)
const items = computed(() => itemsStore.itemsBackoffice)
const availableLicenseGroups = ref<string[]>([])
const selectedLicenseGroup = ref('')

const toast = ref<{ type: string; message: string } | null>(null)
const showDeleteCustomerModal = ref(false)
const showAbonementModal = ref(false)
const editingAbonement = ref<Partial<Abonement> | null>(null)
const showDeleteAbonementId = ref<number | null>(null)

function showToast(type: string, message: string) {
  toast.value = { type, message }
  setTimeout(() => (toast.value = null), 5000)
}

function addLicenseGroup() {
  if (!selectedLicenseGroup.value) return
  const groups = form.value.licensegroups ?? []

  if (!groups.includes(selectedLicenseGroup.value)) {
    form.value.licensegroups = [...groups, selectedLicenseGroup.value]
  }

  selectedLicenseGroup.value = ''
}

function removeLicenseGroup(group: string) {
  form.value.licensegroups = (form.value.licensegroups ?? []).filter((g) => g !== group)
}

useAuthLoad(async () => {
  const response = await fetchLicenseGroups()
  availableLicenseGroups.value = response.data ?? []
  await itemsStore.getItemsBackoffice()

  if (!isNew.value && customerId.value) {
    await store.getCustomerById(customerId.value)

    if (store.customer) {
      form.value = { ...store.customer }
    }

    await store.getAbonementsByCustomer(customerId.value)
  }
})

async function save() {
  try {
    if (isNew.value) {
      await store.createCustomer(form.value)
      showToast('success', 'Customer created')
      router.push('/backoffice/customers')
    } else if (customerId.value) {
      await store.updateCustomer(customerId.value, form.value)
      showToast('success', 'Customer updated')
    }
  } catch {
    showToast('error', 'Could not save customer')
  }
}

async function confirmDeleteCustomer() {
  if (!customerId.value) return

  try {
    await store.deleteCustomer(customerId.value)
    router.push('/backoffice/customers')
  } catch {
    showToast('error', 'Could not delete customer')
  }
}

function openNewAbonement() {
  const firstItem = items.value[0]
  if (!firstItem) return

  editingAbonement.value = {
    customer_id: customerId.value ?? 0,
    item_id: firstItem.ID,
    from_date: new Date().toISOString().slice(0, 10),
    to_date: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString().slice(0, 10),
    status: 'active'
  }

  showAbonementModal.value = true
}

function openEditAbonement(a: Abonement) {
  editingAbonement.value = {
    ...a,
    from_date: a.from_date.slice(0, 10),
    to_date: a.to_date.slice(0, 10)
  }

  showAbonementModal.value = true
}

async function saveAbonement() {
  if (!editingAbonement.value || !customerId.value) return

  try {
    if (editingAbonement.value.id) {
      await store.updateAbonement(editingAbonement.value.id, editingAbonement.value)
      showToast('success', 'Abonement updated')
    } else {
      await store.createAbonement(editingAbonement.value)
      showToast('success', 'Abonement created')
    }

    await store.getAbonementsByCustomer(customerId.value)
    showAbonementModal.value = false
  } catch {
    showToast('error', 'Could not save abonement')
  }
}

async function confirmDeleteAbonement(id: number) {
  if (!customerId.value) return

  try {
    await store.deleteAbonement(id)
    await store.getAbonementsByCustomer(customerId.value)
    showDeleteAbonementId.value = null
    showToast('success', 'Abonement deleted')
  } catch {
    showToast('error', 'Could not delete abonement')
  }
}

function formatDate(dateStr: string) {
  return dateStr ? dateStr.slice(0, 10) : ''
}

function abonementBadgeVariant(status: string) {
  if (status === 'active') return 'success'
  if (status === 'cancelled') return 'danger'
  return 'neutral'
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader
        :title="isNew ? $t('newCustomer') : `${form.firstname} ${form.lastname}`"
        show-back
        @back="router.push('/backoffice/customers')"
      />
    </template>

    <template #main>
      <Toast v-if="toast" :toast="toast" @close="toast = null" />

      <!-- Customer form -->
      <Card class="section">
        <h2 class="section-title">{{ $t('customerDetails') }}</h2>
        <div class="field-grid">
          <FormField :label="$t('firstName')" for="firstname">
            <input id="firstname" v-model="form.firstname" type="text" class="aug-input" />
          </FormField>
          <FormField :label="$t('lastName')" for="lastname">
            <input id="lastname" v-model="form.lastname" type="text" class="aug-input" />
          </FormField>
          <FormField :label="$t('email')" for="email">
            <input id="email" v-model="form.email" type="email" class="aug-input" />
          </FormField>
          <FormField label="Keycloak ID" for="keycloakid">
            <input id="keycloakid" v-model="form.keycloakid" type="text" class="aug-input" />
          </FormField>
          <FormField :label="$t('licenseGroups')" class="field-span-2">
            <div class="license-chips">
              <Badge v-for="group in form.licensegroups" :key="group" variant="neutral">
                {{ group }}
                <button
                  type="button"
                  class="license-chip-remove"
                  @click="removeLicenseGroup(group)"
                >
                  <font-awesome-icon :icon="faTimes" />
                </button>
              </Badge>
              <span v-if="!form.licensegroups?.length" class="license-chips-empty">–</span>
            </div>
            <div class="license-add-row">
              <select v-model="selectedLicenseGroup" class="aug-input">
                <option value="">{{ $t('select') }}…</option>
                <option
                  v-for="group in availableLicenseGroups"
                  :key="group"
                  :value="group"
                  :disabled="form.licensegroups?.includes(group)"
                >
                  {{ group }}
                </option>
              </select>
              <Button
                variant="secondary"
                :disabled="!selectedLicenseGroup"
                @click="addLicenseGroup"
              >
                {{ $t('add') }}
              </Button>
            </div>
          </FormField>
        </div>

        <div class="form-actions">
          <Button variant="primary" @click="save">{{ $t('save') }}</Button>
          <Button v-if="!isNew" variant="danger" @click="showDeleteCustomerModal = true">
            {{ $t('delete') }}
          </Button>
        </div>
      </Card>

      <!-- Abonements section (only for existing customers) -->
      <Card v-if="!isNew" class="section">
        <div class="section-header">
          <h2 class="section-title">{{ $t('abonements') }}</h2>
          <Button variant="secondary" @click="openNewAbonement">+ {{ $t('newAbonement') }}</Button>
        </div>

        <table class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('item') }}</th>
              <th>{{ $t('fromDate') }}</th>
              <th>{{ $t('toDate') }}</th>
              <th>{{ $t('status') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="a in abonements" :key="a.id">
              <td>{{ items.find((i) => i.ID === a.item_id)?.Name ?? a.item_id }}</td>
              <td>{{ formatDate(a.from_date) }}</td>
              <td>{{ formatDate(a.to_date) }}</td>
              <td>
                <Badge :variant="abonementBadgeVariant(a.status)">{{ a.status }}</Badge>
              </td>
              <td class="entry-actions">
                <button type="button" class="aug-icon-btn" @click="openEditAbonement(a)">
                  <font-awesome-icon :icon="faPen" />
                </button>
                <button
                  type="button"
                  class="aug-icon-btn aug-icon-btn-danger"
                  @click="showDeleteAbonementId = a.id"
                >
                  <font-awesome-icon :icon="faTrash" />
                </button>
              </td>
            </tr>
            <tr v-if="abonements.length === 0">
              <td colspan="5" class="entry-empty">{{ $t('noAbonements') }}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Modal
        :open="showAbonementModal"
        :title="editingAbonement?.id ? $t('editAbonement') : $t('newAbonement')"
        @close="showAbonementModal = false"
      >
        <div v-if="editingAbonement" class="abonement-form">
          <FormField :label="$t('item')">
            <select v-model="editingAbonement.item_id" class="aug-input">
              <option v-for="i in items" :key="i.ID" :value="i.ID">{{ i.Name }}</option>
            </select>
          </FormField>
          <div class="abonement-dates">
            <FormField :label="$t('fromDate')">
              <input v-model="editingAbonement.from_date" type="date" class="aug-input" />
            </FormField>
            <FormField :label="$t('toDate')">
              <input v-model="editingAbonement.to_date" type="date" class="aug-input" />
            </FormField>
          </div>
          <FormField :label="$t('status')">
            <select v-model="editingAbonement.status" class="aug-input">
              <option value="active">active</option>
              <option value="inactive">inactive</option>
              <option value="cancelled">cancelled</option>
            </select>
          </FormField>
        </div>
        <template #footer>
          <Button variant="ghost" @click="showAbonementModal = false">{{ $t('cancel') }}</Button>
          <Button variant="primary" @click="saveAbonement">{{ $t('save') }}</Button>
        </template>
      </Modal>

      <Modal
        :open="!!showDeleteAbonementId"
        size="sm"
        :title="$t('delete')"
        @close="showDeleteAbonementId = null"
      >
        <p>{{ $t('deleteAbonementConfirmation') }}</p>
        <template #footer>
          <Button variant="ghost" @click="showDeleteAbonementId = null">{{ $t('cancel') }}</Button>
          <Button variant="danger" @click="confirmDeleteAbonement(showDeleteAbonementId!)">
            {{ $t('delete') }}
          </Button>
        </template>
      </Modal>

      <Modal
        :open="showDeleteCustomerModal"
        size="sm"
        :title="$t('delete')"
        @close="showDeleteCustomerModal = false"
      >
        <p>{{ $t('deleteCustomerConfirmation') }}</p>
        <template #footer>
          <Button variant="ghost" @click="showDeleteCustomerModal = false">
            {{ $t('cancel') }}
          </Button>
          <Button variant="danger" @click="confirmDeleteCustomer">{{ $t('delete') }}</Button>
        </template>
      </Modal>
    </template>
  </component>
</template>

<style scoped>
.section {
  margin-bottom: 20px;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}
.section-title {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
}
.section-header .section-title {
  margin-bottom: 0;
}
.field-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}
.field-span-2 {
  grid-column: span 2;
}
.license-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 10px;
}
.license-chips-empty {
  font-size: 13px;
  color: var(--color-text-muted);
}
.license-chip-remove {
  border: none;
  background: none;
  color: inherit;
  cursor: pointer;
  margin-left: 4px;
  padding: 0;
}
.license-add-row {
  display: flex;
  gap: 8px;
}
.license-add-row .aug-input {
  flex: 1;
}
.form-actions {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}
.entry-actions {
  display: flex;
  gap: 2px;
}
.entry-empty {
  text-align: center;
  color: var(--color-text-muted);
  padding: 16px;
}
.abonement-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.abonement-dates {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}

@media (max-width: 640px) {
  .field-grid,
  .abonement-dates {
    grid-template-columns: 1fr;
  }
  .field-span-2 {
    grid-column: span 1;
  }
}
</style>
