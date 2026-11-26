<script setup lang="ts">
import { apiErrorMessage } from '@/utils/apiError'
import {
  fetchMailTask,
  fetchMailTasks,
  retryFailedMailTasks,
  retryMailTask,
  type MailTaskFilter
} from '@/api/api'
import ToastMessage from '@/components/ToastMessage.vue'
import Badge from '@/components/ui/Badge.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'
import Modal from '@/components/ui/Modal.vue'
import PageHeader from '@/components/ui/PageHeader.vue'
import { useAuthLoad } from '@/composables/useAuthLoad'
import { computed, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

export type MailTask = {
  ID: number
  Kind: string
  Recipients: string[]
  Subject: string
  Body?: string
  HasAttachments: boolean
  Status: 'pending' | 'sending' | 'sent' | 'failed'
  Attempts: number
  LastError: string
  NextAttemptAt: string
  CreatedAt: string
  UpdatedAt: string
  SentAt: string | null
  OrderID: number | null
  ItemID: number | null
}

const PAGE_SIZE = 50
const STATUSES = ['pending', 'sending', 'sent', 'failed'] as const

const KINDS = [
  'online_issue',
  'digital_licence',
  'pdf_licence',
  'welcome',
  'abonement_confirmation',
  'accounting_report',
  'feedback',
  'template_test',
  'keycloak_update_password',
  'keycloak_verify_email'
] as const

const { t, te } = useI18n()
const route = useRoute()
const router = useRouter()

const queryString = (value: unknown) => (typeof value === 'string' ? value : '')

const queryNumber = (value: unknown) => {
  const n = Number(queryString(value))
  return Number.isInteger(n) && n > 0 ? n : undefined
}

// The filter lives in the URL, so a link (e.g. from an online issue) opens it pre-filtered
const filter = computed<MailTaskFilter>(() => ({
  status: queryString(route.query.status),
  kind: queryString(route.query.kind),
  search: queryString(route.query.search),
  item_id: queryNumber(route.query.item_id),
  order_id: queryNumber(route.query.order_id),
  limit: PAGE_SIZE,
  offset: (queryNumber(route.query.page) ? queryNumber(route.query.page)! - 1 : 0) * PAGE_SIZE
}))

const page = computed(() => queryNumber(route.query.page) ?? 1)

const searchInput = ref(queryString(route.query.search))

const setQuery = (changes: Record<string, string | undefined>) => {
  const query: Record<string, string> = {}

  Object.entries({ ...route.query, ...changes }).forEach(([key, value]) => {
    if (typeof value === 'string' && value !== '') query[key] = value
  })

  if (!('page' in changes)) delete query.page
  router.replace({ query })
}

const tasks = ref<MailTask[]>([])
const total = ref(0)
const counts = ref<Record<string, number>>({})
const loading = ref(false)
const toast = ref<{ message: string; type: string } | null>(null)

const load = async () => {
  loading.value = true

  try {
    const res = await fetchMailTasks(filter.value)
    tasks.value = res.data?.Tasks ?? []
    total.value = res.data?.Total ?? 0
    counts.value = res.data?.Counts ?? {}
  } catch (error) {
    toast.value = {
      message: `${t('mailTasksLoadFailed')} ${apiErrorMessage(error)}`,
      type: 'error'
    }
  } finally {
    loading.value = false
  }
}

useAuthLoad(load)
watch(filter, load)

const pageCount = computed(() => Math.max(1, Math.ceil(total.value / PAGE_SIZE)))

const kindLabel = (kind: string) => (te(`mailKind_${kind}`) ? t(`mailKind_${kind}`) : kind)

// Keycloak builds these mails itself, the task only records the request
const isKeycloak = (task: MailTask) => task.Kind.startsWith('keycloak_')

const subjectLabel = (task: MailTask) =>
  isKeycloak(task) ? kindLabel(task.Kind) : task.Subject || '—'

const statusLabel = (status: string) => t(`mailStatus_${status}`)

const STATUS_VARIANTS: Record<string, 'success' | 'danger' | 'info'> = {
  sent: 'success',
  failed: 'danger'
}

const statusVariant = (status: string) => STATUS_VARIANTS[status] ?? 'info'

const formatDateTime = (value: string | null) => (value ? new Date(value).toLocaleString() : '')

// Detail ---------------------------------------------------------------------

const detail = ref<MailTask | null>(null)

const openDetail = async (task: MailTask) => {
  try {
    detail.value = (await fetchMailTask(task.ID)).data
  } catch (error) {
    toast.value = {
      message: `${t('mailTasksLoadFailed')} ${apiErrorMessage(error)}`,
      type: 'error'
    }
  }
}

// Retrying -------------------------------------------------------------------

const retrying = ref<number | null>(null)

const retry = async (task: MailTask) => {
  if (task.Status === 'sent' && !window.confirm(t('mailTaskResendConfirm'))) return
  retrying.value = task.ID

  try {
    await retryMailTask(task.ID)
    toast.value = { message: t('mailTaskRetryQueued'), type: 'success' }
    detail.value = null
    setTimeout(load, 1500)
  } catch (error) {
    toast.value = {
      message: `${t('mailTaskRetryFailed')} ${apiErrorMessage(error)}`,
      type: 'error'
    }
  } finally {
    retrying.value = null
  }
}

const retryingAll = ref(false)

const retryAllFailed = async () => {
  if (!window.confirm(t('mailTasksRetryFailedConfirm', { count: counts.value.failed ?? 0 }))) return
  retryingAll.value = true

  try {
    const { status: _status, limit: _limit, offset: _offset, ...rest } = filter.value
    const res = await retryFailedMailTasks(rest)

    toast.value = {
      message: t('mailTasksRetryFailedQueued', { count: res.data?.Queued ?? 0 }),
      type: 'success'
    }

    setTimeout(load, 1500)
  } catch (error) {
    toast.value = {
      message: `${t('mailTaskRetryFailed')} ${apiErrorMessage(error)}`,
      type: 'error'
    }
  } finally {
    retryingAll.value = false
  }
}

const canRetry = (task: MailTask) => task.Status !== 'sending'

const retryLabel = (task: MailTask) =>
  task.Status === 'sent' ? t('mailTaskResend') : t('mailTaskRetry')
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader :title="$t('menuMailTasks')" />
    </template>
    <template #main>
      <ToastMessage :toast="toast" @close="toast = null" />

      <Card class="mail-filters">
        <div class="status-tabs" role="tablist">
          <button
            type="button"
            role="tab"
            class="status-tab"
            :class="{ active: !filter.status }"
            :aria-selected="!filter.status"
            @click="setQuery({ status: undefined })"
          >
            {{ $t('mailStatusAll') }}
          </button>
          <button
            v-for="status in STATUSES"
            :key="status"
            type="button"
            role="tab"
            class="status-tab"
            :class="{ active: filter.status === status }"
            :aria-selected="filter.status === status"
            :data-test="`status-${status}`"
            @click="setQuery({ status })"
          >
            {{ statusLabel(status) }}
            <span class="status-count">{{ counts[status] ?? 0 }}</span>
          </button>
        </div>

        <div class="filter-row">
          <select
            class="aug-input"
            :value="filter.kind"
            :aria-label="$t('mailTaskKind')"
            @change="setQuery({ kind: ($event.target as HTMLSelectElement).value })"
          >
            <option value="">{{ $t('mailKindAll') }}</option>
            <option v-for="kind in KINDS" :key="kind" :value="kind">{{ kindLabel(kind) }}</option>
          </select>
          <form class="search-form" @submit.prevent="setQuery({ search: searchInput })">
            <input
              v-model="searchInput"
              class="aug-input"
              type="search"
              :placeholder="$t('mailTasksSearch')"
              :aria-label="$t('mailTasksSearch')"
            />
            <Button type="submit" variant="secondary">{{ $t('search') }}</Button>
          </form>
          <span v-if="filter.item_id" class="filter-chip">
            {{ $t('mailTasksItemFilter', { id: filter.item_id }) }}
            <button
              type="button"
              :aria-label="$t('mailTasksClearFilter')"
              @click="setQuery({ item_id: undefined })"
            >
              ✕
            </button>
          </span>
          <span v-if="filter.order_id" class="filter-chip">
            {{ $t('mailTasksOrderFilter', { id: filter.order_id }) }}
            <button
              type="button"
              :aria-label="$t('mailTasksClearFilter')"
              @click="setQuery({ order_id: undefined })"
            >
              ✕
            </button>
          </span>
          <Button
            v-if="(counts.failed ?? 0) > 0"
            variant="danger"
            class="retry-all"
            :disabled="retryingAll"
            data-test="retry-all-failed"
            @click="retryAllFailed"
          >
            {{ $t('mailTasksRetryFailed', { count: counts.failed }) }}
          </Button>
        </div>
      </Card>

      <Card class="table-section">
        <table class="aug-table">
          <thead>
            <tr>
              <th>{{ $t('mailTaskStatus') }}</th>
              <th>{{ $t('mailTaskKind') }}</th>
              <th>{{ $t('mailTaskRecipients') }}</th>
              <th>{{ $t('mailTaskSubject') }}</th>
              <th>{{ $t('mailTaskCreated') }}</th>
              <th>{{ $t('mailTaskSent') }}</th>
              <th>{{ $t('mailTaskAttempts') }}</th>
              <th>{{ $t('mailTaskError') }}</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="task in tasks" :key="task.ID" data-test="mail-task-row">
              <td>
                <Badge :variant="statusVariant(task.Status)">{{ statusLabel(task.Status) }}</Badge>
                <div v-if="task.Status === 'pending' && task.Attempts > 0" class="next-attempt">
                  {{ $t('mailTaskNextAttempt', { date: formatDateTime(task.NextAttemptAt) }) }}
                </div>
              </td>
              <td>
                <Badge
                  v-if="isKeycloak(task)"
                  variant="neutral"
                  class="kind-badge"
                  data-test="keycloak-badge"
                >
                  {{ $t('mailKeycloakBadge') }}
                </Badge>
                {{ kindLabel(task.Kind) }}
              </td>
              <td class="recipients">{{ task.Recipients.join(', ') }}</td>
              <td>
                <button type="button" class="link-btn" @click="openDetail(task)">
                  {{ subjectLabel(task) }}
                </button>
                <span v-if="task.HasAttachments" :title="$t('mailTaskAttachments')"> 📎</span>
              </td>
              <td>{{ formatDateTime(task.CreatedAt) }}</td>
              <td>{{ formatDateTime(task.SentAt) }}</td>
              <td>{{ task.Attempts }}</td>
              <td class="error-cell" :title="task.LastError">{{ task.LastError }}</td>
              <td>
                <button
                  v-if="canRetry(task)"
                  type="button"
                  class="link-btn"
                  :disabled="retrying === task.ID"
                  :data-test="`retry-${task.ID}`"
                  @click="retry(task)"
                >
                  {{ retryLabel(task) }}
                </button>
              </td>
            </tr>
            <tr v-if="!loading && tasks.length === 0">
              <td colspan="9" class="entry-empty">{{ $t('mailTasksEmpty') }}</td>
            </tr>
          </tbody>
        </table>
        <div v-if="pageCount > 1" class="pagination">
          <Button
            variant="ghost"
            :disabled="page <= 1"
            @click="setQuery({ page: String(page - 1) })"
          >
            ‹
          </Button>
          <span>{{ $t('mailTasksPage', { page, pages: pageCount, total }) }}</span>
          <Button
            variant="ghost"
            :disabled="page >= pageCount"
            @click="setQuery({ page: String(page + 1) })"
          >
            ›
          </Button>
        </div>
      </Card>

      <Modal
        :open="!!detail"
        size="lg"
        :title="detail ? subjectLabel(detail) : ''"
        @close="detail = null"
      >
        <template v-if="detail">
          <dl class="detail-meta">
            <dt>{{ $t('mailTaskRecipients') }}</dt>
            <dd>{{ detail.Recipients.join(', ') }}</dd>
            <dt>{{ $t('mailTaskStatus') }}</dt>
            <dd>
              <Badge :variant="statusVariant(detail.Status)">{{
                statusLabel(detail.Status)
              }}</Badge>
            </dd>
            <dt>{{ $t('mailTaskKind') }}</dt>
            <dd>
              <Badge v-if="isKeycloak(detail)" variant="neutral" class="kind-badge">
                {{ $t('mailKeycloakBadge') }}
              </Badge>
              {{ kindLabel(detail.Kind) }}
            </dd>
            <template v-if="detail.OrderID">
              <dt>{{ $t('mailTaskOrder') }}</dt>
              <dd>{{ detail.OrderID }}</dd>
            </template>
            <template v-if="detail.LastError">
              <dt>{{ $t('mailTaskError') }}</dt>
              <dd class="error-text">{{ detail.LastError }}</dd>
            </template>
          </dl>
          <p v-if="isKeycloak(detail)" class="entry-empty" data-test="keycloak-hint">
            {{ $t('mailKeycloakHint') }}
          </p>
          <iframe
            v-else-if="detail.Body"
            class="mail-body"
            sandbox=""
            :srcdoc="detail.Body"
            :title="$t('mailTaskBody')"
          ></iframe>
          <p v-else class="entry-empty">{{ $t('mailTaskBodyRemoved') }}</p>
        </template>
        <template #footer>
          <Button variant="ghost" @click="detail = null">{{ $t('mailTaskClose') }}</Button>
          <Button
            v-if="
              detail &&
              canRetry(detail) &&
              (detail.Status !== 'sent' || detail.Body || isKeycloak(detail))
            "
            variant="primary"
            :disabled="retrying === detail.ID"
            @click="retry(detail)"
          >
            {{ retryLabel(detail) }}
          </Button>
        </template>
      </Modal>
    </template>
  </component>
</template>

<style scoped>
.mail-filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 16px;
}
.status-tabs {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}
.status-tab {
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  color: var(--color-text);
  border-radius: 999px;
  padding: 4px 12px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
}
.status-tab.active {
  background: var(--color-accent);
  border-color: var(--color-accent);
  color: var(--color-on-accent, #fff);
}
.status-count {
  margin-left: 6px;
  opacity: 0.8;
}
.filter-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}
.filter-row select {
  width: auto;
}
.search-form {
  display: flex;
  gap: 6px;
}
.filter-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  padding: 3px 10px;
  border-radius: 999px;
  background: var(--color-surface-alt);
  border: 1px solid var(--color-border);
}
.filter-chip button {
  border: none;
  background: none;
  cursor: pointer;
  color: var(--color-text-muted);
}
.retry-all {
  margin-left: auto;
}
.table-section {
  overflow-x: auto;
}
.kind-badge {
  margin-right: 4px;
}
.recipients {
  max-width: 240px;
  word-break: break-all;
}
.error-cell {
  max-width: 260px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: var(--color-danger);
}
.next-attempt {
  font-size: 11.5px;
  color: var(--color-text-muted);
  margin-top: 2px;
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
  text-align: left;
}
.link-btn:hover {
  text-decoration: underline;
}
.link-btn:disabled {
  opacity: 0.5;
  cursor: default;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding-top: 12px;
  font-size: 13px;
}
.detail-meta {
  display: grid;
  grid-template-columns: max-content 1fr;
  gap: 4px 12px;
  margin-bottom: 12px;
  font-size: 13px;
}
.detail-meta dt {
  color: var(--color-text-muted);
}
.error-text {
  color: var(--color-danger);
  word-break: break-word;
}
.mail-body {
  width: 100%;
  min-height: 360px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: #fff;
}
</style>
