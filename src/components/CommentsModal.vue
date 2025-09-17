<script setup lang="ts">
import type { VendorComment } from '@/stores/vendor'
import { onMounted, ref } from 'vue'

const props = defineProps(['vendor', 'comment'])
const updatedVendor = ref(props.vendor)
const emit = defineEmits(['close', 'update'])
const updatedComment = ref<VendorComment | null>(null)

const created_at = ref(new Date().toISOString().split('T')[0])
const resolved_at = ref<string | null>(null)

const updateComment = () => {
  if (!updatedComment.value) return

  if (resolved_at.value) updatedComment.value.resolved_at = new Date(resolved_at.value)
  emit('update', updatedComment.value)
}

onMounted(() => {
  if (props.comment) {
    updatedComment.value = props.comment
    if (!updatedComment.value) return
    created_at.value = new Date(updatedComment.value.created_at).toLocaleDateString('de-DE')
    if (
      updatedComment.value.resolved_at &&
      new Date(updatedComment.value.resolved_at).toISOString().split('T')[0] !== '0001-01-01'
    )
      resolved_at.value = new Date(updatedComment.value.resolved_at).toISOString().split('T')[0] || null
  }
})
</script>

<template>
  <!-- Comment modal -->
  <div
    v-if="updatedVendor && updatedComment"
    id="commentModal"
    tabindex="-1"
    aria-hidden="false"
    class="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden flex items-center justify-center overflow-y-auto md:inset-0 h-[calc(100%-1rem)] max-h-full"
  >
    <div class="relative w-full max-h-full max-w-md max-h-full">
      <!-- Modal content -->
      <div class="relative bg-white rounded-lg shadow dark:bg-gray-700">
        <!-- Modal header -->
        <div class="flex items-start justify-between p-4 border-b rounded-t dark:border-gray-600">
          <h3 class="text-xl font-semibold text-gray-900 dark:text-white">
            {{ updatedVendor.LicenseID }} {{ updatedVendor.FirstName }} {{ $t('comment') }}
            {{ $t('edit') }}
          </h3>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 ml-auto inline-flex justify-center items-center dark:hover:bg-gray-600 dark:hover:text-white"
            data-modal-hide="addressModal"
            @click="emit('close')"
          >
            <svg
              class="w-3 h-3"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 14 14"
            >
              <path
                stroke="currentColor"
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="m1 1 6 6m0 0 6 6M7 7l6-6M7 7l-6 6"
              />
            </svg>
            <span class="sr-only">Close modal</span>
          </button>
        </div>
        <!-- Modal body -->
        <div class="modal-body p-2 flex flex-col">
          <label>{{ $t('Created at') }}</label>
          <div class="flex flex-col w-full space-y-2 p-2">
            <div>{{ created_at }}</div>
          </div>
          <label>{{ $t('Comment') }}</label>
          <div class="flex flex-col w-full space-y-2 p-2">
            <textarea
              v-model="updatedComment.comment"
              class="w-full p-4 border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              :placeholder="$t('Enter your comment here')"
            ></textarea>
          </div>
          <label>{{ $t('Resolved at') }}</label>
          <div class="flex flex-col w-full space-y-2 p-2">
            <input
              v-model="resolved_at"
              class="w-full p-4 border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
              type="date"
            />
          </div>
          <div class="flex flex-row justify-between p-2">
            <label class="w-full">{{ $t('Warning') }}</label>
            <input
              v-model="updatedComment.warning"
              type="checkbox"
              class="p-4 me-2 border border-gray-200 rounded-lg dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
            />
          </div>
        </div>
        <!-- Modal footer -->
        <div
          class="flex justify-between w-full p-6 space-x-2 border-t border-gray-200 rounded-b dark:border-gray-600"
        >
          <button
            data-modal-hide="defaultModal"
            type="button"
            class="text-white bg-red-500 hover:bg-red-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-500 dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-gray-600"
            @click="emit('close')"
          >
            {{ $t('cancel') }}
          </button>
          <button
            data-modal-hide="defaultModal"
            type="submit"
            class="text-white bg-green-700 hover:bg-green-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            @click="updateComment"
          >
            {{ $t('save') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#commentModal {
  background-color: #cacacab2;
  z-index: 1000;
}
.modal-body {
  display: flex;
}
label {
  font-weight: bold;
}
</style>
