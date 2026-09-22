<script setup lang="ts">
import type { VendorComment } from '@/stores/vendor'
import { onMounted, ref } from 'vue'
import Modal from '@/components/ui/Modal.vue'
import Button from '@/components/ui/Button.vue'
import FormField from '@/components/ui/FormField.vue'

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
      resolved_at.value =
        new Date(updatedComment.value.resolved_at).toISOString().split('T')[0] || null
  }
})
</script>

<template>
  <Modal
    v-if="updatedVendor && updatedComment"
    open
    :title="`${updatedVendor.LicenseID} ${updatedVendor.FirstName} ${$t('comment')} ${$t('edit')}`"
    @close="emit('close')"
  >
    <FormField :label="$t('Created at')">
      <div>{{ created_at }}</div>
    </FormField>
    <FormField :label="$t('Comment')" for="comment-text" class="mt-3">
      <textarea
        id="comment-text"
        v-model="updatedComment.comment"
        class="aug-input"
        rows="4"
        :placeholder="$t('Enter your comment here')"
      ></textarea>
    </FormField>
    <FormField :label="$t('Resolved at')" for="comment-resolved" class="mt-3">
      <input id="comment-resolved" v-model="resolved_at" class="aug-input" type="date" />
    </FormField>
    <label class="comment-warning">
      <input v-model="updatedComment.warning" type="checkbox" />
      {{ $t('Warning') }}
    </label>

    <template #footer>
      <Button variant="ghost" @click="emit('close')">{{ $t('cancel') }}</Button>
      <Button variant="primary" @click="updateComment">{{ $t('save') }}</Button>
    </template>
  </Modal>
</template>

<style scoped>
.comment-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 14px;
  font-size: 14px;
  font-weight: 600;
}
</style>
