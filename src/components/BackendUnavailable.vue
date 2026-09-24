<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { fetchSettings } from '@/api/api'
import Button from '@/components/ui/Button.vue'

// Waits between attempts grow so a longer outage does not hammer the backend once it comes back.
const RETRY_DELAYS_SECONDS = [3, 5, 10, 20, 30]

const attempt = ref(0)
const secondsLeft = ref(RETRY_DELAYS_SECONDS[0] ?? 3)
const retrying = ref(false)
let timer: ReturnType<typeof setInterval> | undefined

const nextDelay = computed(
  () => RETRY_DELAYS_SECONDS[Math.min(attempt.value, RETRY_DELAYS_SECONDS.length - 1)] ?? 30
)

async function retry() {
  if (retrying.value) return

  retrying.value = true

  try {
    await fetchSettings()
    // Reload rather than resume: the first navigation, Keycloak and every view's own loading
    // all failed, and a fresh start is the only way to run them all again cleanly.
    window.location.reload()
  } catch {
    attempt.value++
    secondsLeft.value = nextDelay.value
    retrying.value = false
  }
}

function tick() {
  if (retrying.value) return

  secondsLeft.value--

  if (secondsLeft.value <= 0) retry()
}

onMounted(() => {
  timer = setInterval(tick, 1000)
  window.addEventListener('online', retry)
})

onBeforeUnmount(() => {
  clearInterval(timer)
  window.removeEventListener('online', retry)
})
</script>

<template>
  <div class="backend-unavailable" role="alert" aria-live="polite">
    <div class="card">
      <h1>{{ $t('backendUnreachableTitle') }}</h1>
      <p>{{ $t('backendUnreachableText') }}</p>
      <p class="status">
        <template v-if="retrying">{{ $t('backendUnreachableRetrying') }}</template>
        <template v-else>{{ $t('backendUnreachableRetryIn', { seconds: secondsLeft }) }}</template>
      </p>
      <Button variant="secondary" :disabled="retrying" @click="retry">{{
        $t('backendUnreachableRetryNow')
      }}</Button>
    </div>
  </div>
</template>

<style scoped>
.backend-unavailable {
  position: fixed;
  inset: 0;
  overflow-y: auto;
  display: grid;
  place-items: center;
  padding: 16px;
  background: var(--color-bg);
  color: var(--color-text);
}

.card {
  max-width: 400px;
  width: 100%;
  padding: 24px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius);
  background: var(--color-surface);
  text-align: center;
}

h1 {
  margin-bottom: 12px;
  font-size: 22px;
  font-weight: 700;
  color: var(--color-danger);
}

p {
  margin-bottom: 12px;
}

.status {
  font-size: 14px;
  color: var(--color-text-muted);
}
</style>
