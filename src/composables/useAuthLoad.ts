import { computed, watch } from 'vue'
import { useKeycloakStore } from '@/stores/keycloak'

/**
 * Calls `load` immediately if the user is already authenticated, or as soon
 * as authentication completes. Replaces the scattered if/onAuthSuccess/watch
 * boilerplate that was spread across every backoffice view.
 */
export function useAuthLoad(load: () => void | Promise<void>) {
  const keycloakStore = useKeycloakStore()
  const authenticated = computed(() => keycloakStore.authenticated)
  watch(
    authenticated,
    (val) => {
      if (val) load()
    },
    { immediate: true }
  )
}
