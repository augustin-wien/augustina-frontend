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
import { faArrowLeft, faTrash, faPen, faTimes } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

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
  editingAbonement.value = {
    customer_id: customerId.value ?? 0,
    item_id: items.value[0]?.ID ?? 0,
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
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <div class="flex items-center gap-3 pt-3">
        <button class="p-2 rounded-full customcolor h-10 w-10" @click="router.push('/backoffice/customers')">
          <font-awesome-icon :icon="faArrowLeft" />
        </button>
        <h1 class="font-bold text-2xl">
          {{ isNew ? $t('newCustomer') : `${form.firstname} ${form.lastname}` }}
        </h1>
      </div>
    </template>

    <template #main>
      <Toast v-if="toast" :toast="toast" @close="toast = null" />

      <!-- Customer form -->
      <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-6">
        <h2 class="font-semibold text-lg mb-4">{{ $t('customerDetails') }}</h2>
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1" for="firstname">{{ $t('firstName') }}</label>
            <input id="firstname" v-model="form.firstname" type="text" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="lastname">{{ $t('lastName') }}</label>
            <input id="lastname" v-model="form.lastname" type="text" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="email">{{ $t('email') }}</label>
            <input id="email" v-model="form.email" type="email" class="border rounded p-2 w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1" for="keycloakid">Keycloak ID</label>
            <input id="keycloakid" v-model="form.keycloakid" type="text" class="border rounded p-2 w-full" />
          </div>
          <div class="col-span-2">
            <label class="block text-sm font-medium mb-1">{{ $t('licenseGroups') }}</label>
            <div class="flex flex-wrap gap-2 mb-2">
              <span
                v-for="group in form.licensegroups"
                :key="group"
                class="inline-flex items-center gap-1 rounded-full bg-slate-900 text-white text-xs px-3 py-1"
              >
                {{ group }}
                <button type="button" class="hover:text-red-300" @click="removeLicenseGroup(group)">
                  <font-awesome-icon :icon="faTimes" />
                </button>
              </span>
              <span v-if="!form.licensegroups?.length" class="text-sm text-gray-400">–</span>
            </div>
            <div class="flex gap-2">
              <select v-model="selectedLicenseGroup" class="border rounded p-2 flex-1">
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
              <button
                type="button"
                class="py-2 px-4 rounded-full customcolor"
                :disabled="!selectedLicenseGroup"
                @click="addLicenseGroup"
              >
                {{ $t('add') }}
              </button>
            </div>
          </div>
        </div>

        <div class="flex justify-between mt-6">
          <button class="py-2 px-6 rounded-full customcolor" @click="save">
            {{ $t('save') }}
          </button>
          <button
            v-if="!isNew"
            class="py-2 px-6 rounded-full bg-red-600 text-white"
            @click="showDeleteCustomerModal = true"
          >
            {{ $t('delete') }}
          </button>
        </div>
      </div>

      <!-- Abonements section (only for existing customers) -->
      <div v-if="!isNew" class="bg-white shadow-md rounded px-8 pt-6 pb-8">
        <div class="flex justify-between items-center mb-4">
          <h2 class="font-semibold text-lg">{{ $t('abonements') }}</h2>
          <button class="py-1 px-4 rounded-full customcolor" @click="openNewAbonement">
            + {{ $t('newAbonement') }}
          </button>
        </div>

        <table class="table-auto w-full border-collapse">
          <thead>
            <tr>
              <th class="p-3 text-left">{{ $t('item') }}</th>
              <th class="p-3 text-left">{{ $t('fromDate') }}</th>
              <th class="p-3 text-left">{{ $t('toDate') }}</th>
              <th class="p-3 text-left">{{ $t('status') }}</th>
              <th class="p-3"></th>
            </tr>
          </thead>
          <tbody class="text-sm">
            <tr v-for="a in abonements" :key="a.id" class="border-t-2">
              <td class="p-3">
                {{ items.find((i) => i.ID === a.item_id)?.Name ?? a.item_id }}
              </td>
              <td class="p-3">{{ formatDate(a.from_date) }}</td>
              <td class="p-3">{{ formatDate(a.to_date) }}</td>
              <td class="p-3">
                <span
                  :class="a.status === 'active' ? 'text-green-700 font-semibold' : 'text-gray-500'"
                >
                  {{ a.status }}
                </span>
              </td>
              <td class="p-3 flex gap-2">
                <button class="p-2 rounded-full customcolor h-8 w-8" @click="openEditAbonement(a)">
                  <font-awesome-icon :icon="faPen" />
                </button>
                <button
                  class="p-2 rounded-full bg-red-500 text-white h-8 w-8"
                  @click="showDeleteAbonementId = a.id"
                >
                  <font-awesome-icon :icon="faTrash" />
                </button>
              </td>
            </tr>
            <tr v-if="abonements.length === 0">
              <td colspan="5" class="p-4 text-center text-gray-500">{{ $t('noAbonements') }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Abonement modal -->
      <div v-if="showAbonementModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
          <h3 class="font-bold text-lg mb-4">
            {{ editingAbonement?.id ? $t('editAbonement') : $t('newAbonement') }}
          </h3>
          <div class="space-y-3" v-if="editingAbonement">
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('item') }}</label>
              <select v-model="editingAbonement.item_id" class="border rounded p-2 w-full">
                <option v-for="i in items" :key="i.ID" :value="i.ID">{{ i.Name }}</option>
              </select>
            </div>
            <div class="grid grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('fromDate') }}</label>
                <input v-model="editingAbonement.from_date" type="date" class="border rounded p-2 w-full" />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">{{ $t('toDate') }}</label>
                <input v-model="editingAbonement.to_date" type="date" class="border rounded p-2 w-full" />
              </div>
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">{{ $t('status') }}</label>
              <select v-model="editingAbonement.status" class="border rounded p-2 w-full">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>
          <div class="flex justify-end gap-3 mt-5">
            <button class="py-2 px-4 rounded-full border" @click="showAbonementModal = false">
              {{ $t('cancel') }}
            </button>
            <button class="py-2 px-4 rounded-full customcolor" @click="saveAbonement">
              {{ $t('save') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete abonement confirmation -->
      <div v-if="showDeleteAbonementId" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
          <p class="mb-4">{{ $t('deleteAbonementConfirmation') }}</p>
          <div class="flex justify-end gap-3">
            <button class="py-2 px-4 rounded-full border" @click="showDeleteAbonementId = null">
              {{ $t('cancel') }}
            </button>
            <button
              class="py-2 px-4 rounded-full bg-red-600 text-white"
              @click="confirmDeleteAbonement(showDeleteAbonementId!)"
            >
              {{ $t('delete') }}
            </button>
          </div>
        </div>
      </div>

      <!-- Delete customer confirmation -->
      <div v-if="showDeleteCustomerModal" class="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div class="bg-white rounded-lg p-6 w-full max-w-sm shadow-xl">
          <p class="mb-4">{{ $t('deleteCustomerConfirmation') }}</p>
          <div class="flex justify-end gap-3">
            <button class="py-2 px-4 rounded-full border" @click="showDeleteCustomerModal = false">
              {{ $t('cancel') }}
            </button>
            <button class="py-2 px-4 rounded-full bg-red-600 text-white" @click="confirmDeleteCustomer">
              {{ $t('delete') }}
            </button>
          </div>
        </div>
      </div>
    </template>
  </component>
</template>

<style scoped>
td {
  padding: 10px;
}
</style>
