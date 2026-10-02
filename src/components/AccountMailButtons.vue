<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from '@/components/ui/Button.vue'

// Buttons that let Keycloak mail a vendor or customer a password reset or address
// verification link. The mails go to the saved address, so the parent disables the
// buttons while the email is unsaved or the account has no mailbox of its own.
const props = defineProps<{
  sendPasswordReset: () => Promise<unknown>
  sendVerify: () => Promise<unknown>
  disabled?: boolean
  disabledHint?: string
}>()

const emit = defineEmits<{
  (e: 'result', toast: { type: string; message: string }): void
}>()

const { t } = useI18n()
const sending = ref(false)

async function send(action: () => Promise<unknown>, successMessage: string) {
  sending.value = true

  try {
    await action()
    emit('result', { type: 'success', message: successMessage })
  } catch (error: any) {
    const reason = error?.response?.data?.error?.message ?? error?.message ?? ''
    emit('result', { type: 'error', message: `${t('emailCouldNotBeSent')} ${reason}`.trim() })
  } finally {
    sending.value = false
  }
}
</script>

<template>
  <div class="account-mail">
    <div class="account-mail-buttons">
      <Button
        variant="secondary"
        :disabled="props.disabled || sending"
        @click="send(props.sendPasswordReset, t('passwordResetEmailSent'))"
      >
        {{ t('sendPasswordResetEmail') }}
      </Button>
      <Button
        variant="secondary"
        :disabled="props.disabled || sending"
        @click="send(props.sendVerify, t('verifyEmailSent'))"
      >
        {{ t('sendVerifyEmail') }}
      </Button>
    </div>
    <p v-if="props.disabled && props.disabledHint" class="account-mail-hint">
      {{ props.disabledHint }}
    </p>
  </div>
</template>

<style scoped>
.account-mail-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.account-mail-hint {
  margin-top: 6px;
  font-size: 12px;
  color: var(--color-text-muted);
}
</style>
