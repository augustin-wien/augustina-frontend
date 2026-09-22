<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { vendorsStore } from '@/stores/vendor'
import type { VendorComment } from '@/stores/vendor'
import { useAuthLoad } from '@/composables/useAuthLoad'
import router from '@/router'
import CommentsModal from '@/components/CommentsModal.vue'
import { faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import PageHeader from '@/components/ui/PageHeader.vue'
import Button from '@/components/ui/Button.vue'
import Card from '@/components/ui/Card.vue'

const route = useRoute()
const store = vendorsStore()

const vendor = computed(() => store.vendor)
const vendorComments = computed(() => store.vendorComments)

useAuthLoad(() => {
  if (!route?.params?.ID) return
  const vendorId = parseInt(route.params.ID.toString())
  store.getVendor(vendorId)
  store.getVendorComments(vendorId)
})

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
    vendorid: vendor.value?.ID || 0
  }

  isNewComment.value = true
  showCommentsDialog.value = true
}

const editComment = (comment: VendorComment) => {
  selectedComment.value = comment
  isNewComment.value = false
  showCommentsDialog.value = true
}

const saveComment = (comment: VendorComment) => {
  if (!vendor.value) return
  const vendorId = vendor.value.ID

  if (isNewComment.value) {
    store.createVendorComment(comment, vendorId).then(() => {
      store.getVendorComments(vendorId)
    })
  } else {
    store.updateVendorComment(comment, vendorId).then(() => {
      store.getVendorComments(vendorId)
    })
  }

  isNewComment.value = false
  showCommentsDialog.value = false
}

const cancelEdit = () => {
  isNewComment.value = false
  showCommentsDialog.value = false
  selectedComment.value = null
}

const deleteComment = (commentId: number) => {
  if (!vendor.value) return
  store.deleteVendorComment(vendor.value.ID, commentId)
}

const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '–'
  const d = new Date(date.toString())
  if (isNaN(d.getTime()) || d.getFullYear() <= 1) return '–'
  return d.toLocaleDateString()
}
</script>

<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header>
      <PageHeader
        v-if="vendor"
        :title="`${vendor.LicenseID} ${vendor.FirstName} ${vendor.LastName} – ${$t('comments')}`"
        show-back
        @back="router.back()"
      >
        <router-link :to="`/backoffice/userprofile/${vendor.ID}/update`">
          <Button variant="secondary">{{ $t('change') }}</Button>
        </router-link>
      </PageHeader>
    </template>

    <template #main>
      <Card class="section">
        <div class="section-header">
          <p class="comment-count">{{ vendorComments?.length ?? 0 }} {{ $t('comments') }}</p>
          <Button variant="primary" @click="addNewComment">{{ $t('Add a comment') }}</Button>
        </div>

        <div v-if="vendorComments && vendorComments.length > 0" class="comment-list">
          <div
            v-for="comment in vendorComments"
            :key="'comment_' + comment.id"
            class="comment-card"
            :class="{ 'comment-card-warning': comment.warning }"
          >
            <div class="comment-body">
              <div class="comment-date">{{ formatDate(comment.created_at) }}</div>
              <div class="comment-text">
                <span v-if="comment.warning" class="comment-warning-label"
                  >{{ $t('warning') }}:
                </span>
                {{ comment.comment }}
              </div>
              <div
                v-if="formatDate(comment.resolved_at?.toString()) !== '–'"
                class="comment-resolved"
              >
                <span class="font-bold">{{ $t('Resolved at') }}:</span>
                <span>{{ formatDate(comment.resolved_at?.toString()) }}</span>
              </div>
            </div>
            <div class="comment-actions">
              <button
                type="button"
                class="aug-icon-btn"
                :title="$t('edit')"
                @click="editComment(comment)"
              >
                <font-awesome-icon :icon="faPen" />
              </button>
              <button
                type="button"
                class="aug-icon-btn aug-icon-btn-danger"
                :title="$t('delete')"
                @click="deleteComment(comment.id)"
              >
                <font-awesome-icon :icon="faTrash" />
              </button>
            </div>
          </div>
        </div>
        <p v-else class="empty-text">{{ $t('noComments') }}</p>
      </Card>

      <CommentsModal
        v-if="showCommentsDialog && vendor"
        :comment="selectedComment"
        :vendor="vendor"
        @close="cancelEdit"
        @update="saveComment"
      />
    </template>
  </component>
</template>

<style scoped>
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}
.comment-count {
  font-size: 13px;
  color: var(--color-text-muted);
}
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.comment-card {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  padding: 12px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-bg);
}
.comment-card-warning {
  color: var(--color-danger);
}
.comment-date {
  font-size: 11px;
  font-weight: 700;
  color: var(--color-text-muted);
  margin-bottom: 4px;
}
.comment-text {
  font-size: 13.5px;
  word-break: break-word;
}
.comment-warning-label {
  font-weight: 700;
}
.comment-resolved {
  font-size: 12px;
  color: var(--color-text-muted);
  margin-top: 4px;
}
.comment-actions {
  display: flex;
  align-items: center;
  gap: 2px;
  flex-shrink: 0;
}
.empty-text {
  font-size: 13.5px;
  color: var(--color-text-muted);
}
</style>
