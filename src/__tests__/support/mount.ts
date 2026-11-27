import { enableAutoUnmount, flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { createPinia, setActivePinia, type Pinia } from 'pinia'
import { afterEach, beforeEach, vi } from 'vitest'
import type { Component } from 'vue'
import keycloak from '@/keycloak/keycloak'
import i18n from '@/locales/i18n'
import router from '@/router'
import App from '@/App.vue'
import { useKeycloakStore } from '@/stores/keycloak'
import { installBackend } from './backend'

enableAutoUnmount(afterEach)
afterEach(() => vi.useRealTimers())
beforeEach(() => installBackend())

export const stubs = {
  FontAwesomeIcon: true,
  VueDatePicker: true,
  LMap: true,
  LTileLayer: true,
  LMarker: true,
  LPopup: true,
  LIcon: true,
  LControl: true,
  LMarkerClusterGroup: true
}

/** Errors Vue caught while rendering or in lifecycle hooks of the last mounted tree. */
export const renderErrors: unknown[] = []

const config = { errorHandler: (e: unknown) => void renderErrors.push(e) }

export const keycloakLogin = vi.fn()
export const keycloakLogout = vi.fn()

/** Logs a fake user with the given roles into the keycloak singleton the app uses. */
export function signIn(roles: string[] = ['backoffice', 'vendor']) {
  keycloak.initailizedKeycloak = true

  keycloak.keycloak = {
    authenticated: roles.length > 0,
    token: 'token',
    tokenParsed: { groups: roles, preferred_username: 'tester', email: 'tester@example.org' },
    updateToken: vi.fn().mockResolvedValue(true),
    login: keycloakLogin,
    logout: keycloakLogout
  } as never
}

export interface Harness {
  pinia: Pinia
  wrapper: VueWrapper
}

function freshPinia(authenticated: boolean) {
  const pinia = createPinia()
  setActivePinia(pinia)
  useKeycloakStore().authenticated = authenticated
  return pinia
}

type AsyncLayout = { __asyncLoader?: () => Promise<unknown> }

// The backoffice layouts are async components; loading them first keeps the first test of a
// file from looking at a page whose layout is still being imported
async function loadLayout() {
  const layout = router.currentRoute.value.meta.layout as AsyncLayout | undefined
  await layout?.__asyncLoader?.()
}

/** Mounts the whole app at the given path, against the fake backend. */
export async function mountRoute(
  path: string,
  {
    roles = ['backoffice', 'vendor'],
    before
  }: {
    roles?: string[]
    // Runs with the fresh pinia active, before navigating, to prepare stores
    before?: () => void | Promise<void>
  } = {}
): Promise<Harness> {
  renderErrors.length = 0
  signIn(roles)
  const pinia = freshPinia(roles.length > 0)
  await before?.()

  await router.push(path).catch(() => {})
  await router.isReady().catch(() => {})
  await loadLayout()

  const wrapper = mount(App, {
    attachTo: document.body,
    global: { plugins: [pinia, router, i18n], stubs, config }
  })

  await settle(150)

  return { pinia, wrapper }
}

/** Mounts one component inside the app's router, pinia and i18n, against the fake backend. */
export async function mountComponent(
  component: Component,
  {
    props = {},
    path = '/',
    authenticated = true,
    slots,
    before
  }: {
    props?: Record<string, unknown>
    path?: string
    authenticated?: boolean
    slots?: Record<string, string>
    // Runs with the fresh pinia active, before mounting, to prepare stores
    before?: () => void | Promise<void>
  } = {}
): Promise<Harness> {
  renderErrors.length = 0
  signIn()
  const pinia = freshPinia(authenticated)

  await router.push(path).catch(() => {})
  await before?.()

  const wrapper = mount(component as never, {
    props: props as never,
    slots,
    attachTo: document.body,
    global: { plugins: [pinia, router, i18n], stubs, config }
  })

  await settle()

  return { pinia, wrapper }
}

/** Lets pending requests, timers of the fake backend and re-renders finish. */
export async function settle(ms = 0) {
  for (let i = 0; i < 5; i++) {
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 0))
  }

  if (ms > 0) {
    await new Promise((resolve) => setTimeout(resolve, ms))
    await settle()
  }
}
