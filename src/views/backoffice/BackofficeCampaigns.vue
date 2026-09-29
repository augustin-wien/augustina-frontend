<script lang="ts" setup>
import { computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { faPen, faPlus, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useAuthLoad } from '@/composables/useAuthLoad'
import {
  campaignStatus,
  toCampaignInput,
  useCampaignsStore,
  type Campaign,
  type CampaignInput,
  type CampaignStatus
} from '@/stores/campaigns'
import { useItemsStore } from '@/stores/items'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Badge from '@/components/ui/Badge.vue'
import Modal from '@/components/ui/Modal.vue'
import FormField from '@/components/ui/FormField.vue'

const { t, locale } = useI18n()
const store = useCampaignsStore()
const itemsStore = useItemsStore()

const loading = ref(false)
const loadFailed = ref(false)

useAuthLoad(async () => {
  loading.value = true
  loadFailed.value = false

  try {
    await Promise.all([store.getCampaigns(), itemsStore.getItemsWithArchived()])
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Loading campaigns failed:', error)
    loadFailed.value = true
  } finally {
    loading.value = false
  }
})

// Only things the shop sells make sense to advertise. The item a campaign already points at stays
// in the list, so editing it doesn't silently blank the selection.
const nonProductTypes = ['donation', 'transaction_costs', 'license_item']

const productOptions = computed(() =>
  itemsStore.itemsWithArchived.filter(
    (i) =>
      (!nonProductTypes.includes(i.Type) && !i.Archived && !i.Disabled) ||
      i.ID === form.value?.item_id
  )
)

const itemName = (id: number) =>
  itemsStore.itemsWithArchived.find((i) => i.ID === id)?.Name ??
  `#${id} (${t('campaignItemMissing')})`

const statusVariant: Record<CampaignStatus, 'success' | 'info' | 'neutral' | 'danger'> = {
  running: 'success',
  scheduled: 'info',
  ended: 'neutral',
  off: 'neutral'
}

const formatDate = (iso: string | null) =>
  iso ? new Date(iso).toLocaleString(locale.value, { dateStyle: 'short', timeStyle: 'short' }) : ''

const period = (c: Campaign) => {
  if (!c.starts_at && !c.ends_at) return t('campaignNoLimit')

  if (!c.starts_at) return `${t('campaignUntil')} ${formatDate(c.ends_at)}`

  if (!c.ends_at) return `${t('campaignFrom')} ${formatDate(c.starts_at)}`

  return `${formatDate(c.starts_at)} – ${formatDate(c.ends_at)}`
}

const clickRate = (c: Campaign) =>
  c.views ? `${((c.clicks / c.views) * 100).toFixed(1).replace('.', ',')} %` : '–'

const toggle = async (c: Campaign) => {
  try {
    await store.updateCampaign(c.id, { ...toCampaignInput(c), enabled: !c.enabled })
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Toggling campaign failed:', error)
    alert(t('campaignSaveFailed'))
  }
}

// Edit dialog -----------------------------------------------------------------

const emptyCampaign = (): CampaignInput => ({
  name: '',
  item_id: 0,
  title: '',
  text: '',
  starts_at: null,
  ends_at: null,
  enabled: true
})

const editedId = ref<number | null>(null)
const form = ref<CampaignInput | null>(null)
const saving = ref(false)

const openNew = () => {
  editedId.value = null
  form.value = emptyCampaign()
}

const openEdit = (c: Campaign) => {
  editedId.value = c.id
  form.value = toCampaignInput(c)
}

const closeForm = () => {
  form.value = null
}

// <input type="datetime-local"> works in local time without a zone, the backend stores
// RFC3339 timestamps - convert in both directions.
const toLocalInput = (iso: string | null) => {
  if (!iso) return ''

  const d = new Date(iso)

  if (isNaN(d.getTime())) return ''

  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}

const fromLocalInput = (value: string) => (value ? new Date(value).toISOString() : null)

const startsAt = computed({
  get: () => toLocalInput(form.value?.starts_at ?? null),
  set: (v: string) => {
    if (form.value) form.value.starts_at = fromLocalInput(v)
  }
})

const endsAt = computed({
  get: () => toLocalInput(form.value?.ends_at ?? null),
  set: (v: string) => {
    if (form.value) form.value.ends_at = fromLocalInput(v)
  }
})

const periodInvalid = computed(
  () =>
    !!form.value?.starts_at &&
    !!form.value?.ends_at &&
    new Date(form.value.ends_at) <= new Date(form.value.starts_at)
)

const formValid = computed(
  () => !!form.value && !!form.value.name.trim() && form.value.item_id > 0 && !periodInvalid.value
)

const save = async () => {
  if (!form.value || !formValid.value) return

  saving.value = true

  try {
    if (editedId.value === null) await store.createCampaign(form.value)
    else await store.updateCampaign(editedId.value, form.value)

    closeForm()
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Saving campaign failed:', error)
    alert(t('campaignSaveFailed'))
  } finally {
    saving.value = false
  }
}

const remove = async (c: Campaign) => {
  if (!confirm(t('campaignDeleteConfirm', { name: c.name }))) return

  try {
    await store.removeCampaign(c.id)
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Deleting campaign failed:', error)
    alert(t('campaignDeleteFailed'))
  }
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('menuCampaigns')">
        <Button variant="primary" @click="openNew">
          <font-awesome-icon :icon="faPlus" /> {{ $t('campaignNew') }}
        </Button>
      </PageHeader>
    </template>

    <template #main>
      <Card class="section">
        <p class="campaigns-hint">{{ $t('campaignsHint') }}</p>
        <p v-if="loadFailed" class="campaigns-empty">{{ $t('campaignsLoadFailed') }}</p>
        <table v-else class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('campaignActive') }}</th>
              <th>{{ $t('name') }}</th>
              <th>{{ $t('campaignProduct') }}</th>
              <th>{{ $t('campaignPeriod') }}</th>
              <th>{{ $t('campaignStatus') }}</th>
              <th class="num">{{ $t('campaignViews') }}</th>
              <th class="num">{{ $t('campaignClicks') }}</th>
              <th class="num">{{ $t('campaignClickRate') }}</th>
              <th>{{ $t('measure') }}</th>
            </tr>
          </thead>
          <tbody :aria-busy="loading">
            <template v-if="loading && !store.campaigns.length">
              <tr v-for="n in 3" :key="`skeleton-${n}`" aria-hidden="true">
                <td v-for="col in 9" :key="col">
                  <span class="aug-skeleton" style="width: 60px" />
                </td>
              </tr>
            </template>
            <tr v-else-if="!store.campaigns.length">
              <td colspan="9" class="campaigns-empty">{{ $t('noCampaigns') }}</td>
            </tr>
            <tr v-for="c in store.campaigns" :key="c.id">
              <td>
                <label class="aug-toggle" :title="$t('campaignActive')">
                  <input type="checkbox" :checked="c.enabled" @change="toggle(c)" />
                  <span class="aug-toggle-track"></span>
                </label>
              </td>
              <td>
                <div class="campaign-name">{{ c.name }}</div>
                <div v-if="c.title" class="campaign-title">{{ c.title }}</div>
              </td>
              <td>{{ itemName(c.item_id) }}</td>
              <td class="campaign-period">{{ period(c) }}</td>
              <td>
                <Badge :variant="statusVariant[campaignStatus(c)]">
                  {{ $t(`campaignStatus_${campaignStatus(c)}`) }}
                </Badge>
              </td>
              <td class="num">{{ c.views }}</td>
              <td class="num">{{ c.clicks }}</td>
              <td class="num">{{ clickRate(c) }}</td>
              <td>
                <div class="campaign-actions">
                  <button
                    type="button"
                    class="aug-icon-btn"
                    :aria-label="$t('edit')"
                    :title="$t('edit')"
                    @click="openEdit(c)"
                  >
                    <font-awesome-icon :icon="faPen" />
                  </button>
                  <button
                    type="button"
                    class="aug-icon-btn aug-icon-btn-danger"
                    :aria-label="$t('delete')"
                    :title="$t('delete')"
                    @click="remove(c)"
                  >
                    <font-awesome-icon :icon="faTrash" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </Card>

      <Modal
        :open="!!form"
        :title="editedId === null ? $t('campaignNew') : $t('campaignEdit')"
        size="lg"
        @close="closeForm"
      >
        <form v-if="form" id="campaign-form" class="campaign-form" @submit.prevent="save">
          <FormField :label="$t('name')" :hint="$t('campaignNameHint')" class="span-2" required>
            <input v-model="form.name" type="text" class="aug-input" required />
          </FormField>
          <FormField :label="$t('campaignProduct')" class="span-2" required>
            <select v-model.number="form.item_id" class="aug-input" required>
              <option :value="0" disabled>{{ $t('campaignChooseProduct') }}</option>
              <option v-for="item in productOptions" :key="item.ID" :value="item.ID">
                {{ item.Name }}
              </option>
            </select>
          </FormField>
          <FormField :label="$t('campaignStart')" :hint="$t('campaignOpenHint')">
            <input v-model="startsAt" type="datetime-local" class="aug-input" />
          </FormField>
          <FormField
            :label="$t('campaignEnd')"
            :error="periodInvalid ? $t('campaignEndBeforeStart') : undefined"
            :hint="$t('campaignOpenHint')"
          >
            <input v-model="endsAt" type="datetime-local" class="aug-input" />
          </FormField>
          <FormField :label="$t('campaignHeadline')" class="span-2">
            <input v-model="form.title" type="text" class="aug-input" />
          </FormField>
          <FormField :label="$t('campaignText')" class="span-2">
            <textarea v-model="form.text" rows="4" class="aug-input"></textarea>
          </FormField>
          <label class="aug-toggle span-2">
            <input v-model="form.enabled" type="checkbox" />
            <span class="aug-toggle-track"></span>
            <span>{{ $t('campaignActive') }}</span>
          </label>
        </form>
        <template #footer>
          <Button variant="secondary" @click="closeForm">{{ $t('cancel') }}</Button>
          <Button
            variant="primary"
            type="submit"
            form="campaign-form"
            :disabled="!formValid || saving"
          >
            {{ $t('save') }}
          </Button>
        </template>
      </Modal>
    </template>
  </component>
</template>

<style scoped>
.campaigns-hint {
  font-size: 13px;
  color: var(--color-text-muted);
  margin-bottom: 14px;
}
.campaigns-empty {
  font-size: 13px;
  color: var(--color-text-muted);
  text-align: center;
  padding: 24px 0;
}
.campaign-name {
  font-weight: 600;
}
.campaign-title {
  font-size: 12px;
  color: var(--color-text-muted);
}
.campaign-period {
  font-size: 12.5px;
  white-space: nowrap;
}
.campaign-actions {
  display: flex;
  gap: 2px;
}
.num {
  text-align: right;
  font-variant-numeric: tabular-nums;
}
.campaign-form {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px 16px;
}
.span-2 {
  grid-column: span 2;
}
@media (max-width: 640px) {
  .campaign-form {
    grid-template-columns: 1fr;
  }
  .span-2 {
    grid-column: span 1;
  }
}
</style>
