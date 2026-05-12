<script lang="ts" setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { vendorsStore } from '@/stores/vendor'
import type { VendorComment } from '@/stores/vendor'
import { useAuthLoad } from '@/composables/useAuthLoad'
import router from '@/router'
import CommentsModal from '@/components/CommentsModal.vue'
import { faArrowLeft, faPen, faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'

const { t } = useI18n()
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
      <div class="flex justify-between items-center mt-3 pt-3">
        <h1 v-if="vendor" class="font-bold text-2xl">
          <button @click="router.back()">
            <font-awesome-icon :icon="faArrowLeft" />
          </button>
          {{ vendor.LicenseID }} {{ vendor.FirstName }} {{ vendor.LastName }} –
          {{ $t('comments') }}
        </h1>
        <router-link
          v-if="vendor"
          :to="`/backoffice/userprofile/${vendor.ID}/update`"
          class="py-2 px-4 rounded-full customcolor"
        >
          {{ $t('change') }}
        </router-link>
      </div>
    </template>

    <template #main>
      <div class="main">
        <div class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div class="flex justify-between items-center mb-4">
            <p class="text-sm text-gray-600 dark:text-gray-400">
              {{ vendorComments?.length ?? 0 }} {{ $t('comments') }}
            </p>
            <button class="py-2 px-4 rounded-full customcolor" @click="addNewComment">
              {{ $t('Add a comment') }}
            </button>
          </div>

          <div v-if="vendorComments && vendorComments.length > 0" class="space-y-3">
            <div
              v-for="comment in vendorComments"
              :key="'comment_' + comment.id"
              class="border border-gray-200 dark:border-gray-600 rounded p-3 bg-gray-50 dark:bg-gray-800 flex justify-between"
              :class="{ 'text-red-600 dark:text-red-400': comment.warning }"
            >
              <div class="w-full">
                <div class="font-bold text-xs mb-1 text-gray-500 dark:text-gray-400">
                  {{ formatDate(comment.created_at) }}
                </div>
                <div class="text-sm break-words">
                  <span v-if="comment.warning" class="font-bold">{{ $t('warning') }}: </span>
                  {{ comment.comment }}
                </div>
                <div
                  v-if="formatDate(comment.resolved_at?.toString()) !== '–'"
                  class="text-xs mt-1 text-gray-500 dark:text-gray-400"
                >
                  <span class="font-bold pr-2">{{ $t('Resolved at') }}:</span>
                  <span>{{ formatDate(comment.resolved_at?.toString()) }}</span>
                </div>
              </div>
              <div class="flex items-center space-x-2 ml-4 shrink-0">
                <button
                  type="button"
                  class="customcolor p-2"
                  :title="$t('edit')"
                  @click="editComment(comment)"
                >
                  <font-awesome-icon :icon="faPen" />
                </button>
                <button
                  type="button"
                  class="text-red-600 hover:text-red-800 p-2"
                  :title="$t('delete')"
                  @click="deleteComment(comment.id)"
                >
                  <font-awesome-icon :icon="faTrash" />
                </button>
              </div>
            </div>
          </div>
          <p v-else class="text-sm text-gray-600 dark:text-gray-400">{{ $t('noComments') }}</p>
        </div>
      </div>

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
