<script setup lang="ts">
import type { IconDefinition } from '@fortawesome/fontawesome-svg-core'
import WaitingAnimation from '@/components/WaitingAnimation.vue'
import keycloak from '@/keycloak/keycloak'
import { useKeycloakStore } from '@/stores/keycloak'
import { useSettingsStore } from '@/stores/settings'
import {
  faArrowRightFromBracket,
  faBagShopping,
  faCashRegister,
  faDungeon,
  faFileLines,
  faSliders,
  faSplotch,
  faUserGroup,
  faUsers,
  faMapLocation,
  faAreaChart
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { computed, onMounted, watch, ref } from 'vue'

const keycloakStore = useKeycloakStore()
const settingsStore = useSettingsStore()
settingsStore.getSettingsFromApi()
const settings = computed(() => settingsStore.settings)
const authenticated = computed(() => keycloakStore.authenticated)
// remove the last / from the URL
const apiUrl = import.meta.env.VITE_API_URL.replace(/\/$/, '')

const logo = computed(() => {
  if (settings.value.Logo && settings.value.Logo !== '') {
    // if the logo does not have a / at the beginning, add it
    if (typeof settings.value.Logo === 'string') {
      if (!settings.value.Logo.startsWith('/')) {
        return apiUrl + '/' + settings.value.Logo
      }

      return apiUrl + settings.value.Logo
    } else {
      return apiUrl + '/img/logo.png'
    }
  } else {
    return apiUrl + '/img/logo.png'
  }
})

// mobile sidebar state
const mobileMenuOpen = ref(false)

interface NavItem {
  to: string
  labelKey: string
  icon: IconDefinition
}
interface NavGroup {
  labelKey: string
  items: NavItem[]
}

// Grouped from the flat link list that used to make up the sidebar, matching the sections
// vendors/staff already think in (Vendors, Customers, POS, Accounting, Products, Administration).
const navGroups = computed<NavGroup[]>(() => {
  const groups: NavGroup[] = [
    {
      labelKey: 'navGroupVendors',
      items: [
        { to: '/backoffice/vendorsummary', labelKey: 'menuOverview', icon: faUserGroup },
        { to: '/backoffice/credits', labelKey: 'menuCredits', icon: faBagShopping }
      ]
    }
  ]

  if (settings.value.AbonementEnabled) {
    groups.push({
      labelKey: 'navGroupCustomers',
      items: [{ to: '/backoffice/customers', labelKey: 'menuOverview', icon: faUsers }]
    })
  }

  if (settings.value.POSEnabled) {
    groups.push({
      labelKey: 'navGroupPOS',
      items: [{ to: '/backoffice/pos', labelKey: 'menuPOS', icon: faCashRegister }]
    })
  }

  const accountingItems: NavItem[] = [
    { to: '/backoffice/payments', labelKey: 'menuPayments', icon: faBagShopping },
    { to: '/backoffice/sales', labelKey: 'menuSales', icon: faDungeon },
    { to: '/backoffice/payouts', labelKey: 'menuPayouts', icon: faFileLines },
    { to: '/backoffice/unverified-orders', labelKey: 'menuUnverifiedOrders', icon: faFileLines }
  ]

  if (settings.value.POSEnabled) {
    accountingItems.push({
      to: '/backoffice/pos-accounting',
      labelKey: 'menuPOSAccounting',
      icon: faCashRegister
    })
  }

  groups.push({ labelKey: 'menuAccounting', items: accountingItems })

  groups.push({
    labelKey: 'navGroupProducts',
    items: [{ to: '/backoffice/productsettings', labelKey: 'menuProducts', icon: faSplotch }]
  })

  groups.push({
    labelKey: 'navGroupAdmin',
    items: [
      { to: '/backoffice/settings/update', labelKey: 'menuSettings', icon: faSliders },
      { to: '/backoffice/map', labelKey: 'menuMap', icon: faMapLocation },
      { to: '/backoffice/statistics', labelKey: 'menuStatistics', icon: faAreaChart }
    ]
  })

  return groups
})

onMounted(() => {
  if (authenticated.value) {
    settingsStore.getSettingsFromApi()
  } else {
    watch(authenticated, () => {
      settingsStore.getSettingsFromApi()
    })
  }
})
</script>

<template>
  <div>
    <div v-if="authenticated" class="backoffice-layout">
      <button
        class="mobile-menu-btn md:hidden"
        :aria-expanded="mobileMenuOpen"
        aria-label="Toggle menu"
        @click="mobileMenuOpen = !mobileMenuOpen"
      >
        {{ mobileMenuOpen ? '✖' : '☰' }}
      </button>

      <aside class="sidemenu" :class="{ open: mobileMenuOpen }">
        <div class="sidemenu-inner">
          <div class="logo-container">
            <img :src="logo" alt="Newspaper logo" class="logo" width="auto" />
          </div>

          <nav class="sidenav">
            <div v-for="group in navGroups" :key="group.labelKey" class="nav-group">
              <p class="nav-label">{{ $t(group.labelKey) }}</p>
              <RouterLink
                v-for="item in group.items"
                :key="item.to"
                :to="item.to"
                class="nav-item"
                @click="mobileMenuOpen = false"
              >
                <font-awesome-icon :icon="item.icon" class="nav-item-icon" />
                <span>{{ $t(item.labelKey) }}</span>
              </RouterLink>
            </div>
          </nav>

          <button class="nav-item nav-item-logout" @click="keycloak.keycloak?.logout()">
            <font-awesome-icon :icon="faArrowRightFromBracket" class="nav-item-icon" />
            <span>{{ $t('Logout') }}</span>
          </button>

          <div class="sidemenu-footer">
            <p class="user-loggedin">
              <template v-if="keycloakStore.username">
                {{ keycloakStore.username }} {{ $t('userLoggedIn') }}
              </template>
              <template v-else>{{ $t('userNotLoggedIn') }}</template>
            </p>
            <select v-model="$i18n.locale" class="lang-select">
              <option value="en">EN</option>
              <option value="de">DE</option>
            </select>
          </div>
        </div>
      </aside>

      <!-- overlay for mobile when menu is open -->
      <div
        v-if="mobileMenuOpen"
        class="mobile-overlay md:hidden"
        @click="mobileMenuOpen = false"
      ></div>

      <div class="main-container">
        <div class="header-slot">
          <slot name="header"> </slot>
        </div>
        <div class="main-slot">
          <slot name="main"> </slot>
        </div>
      </div>
      <footer>
        <slot name="footer"></slot>
      </footer>
    </div>
    <div v-else>
      <div
        id="initial-loader"
        style="
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          right: 0;
          z-index: 2000;
          background-color: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
        "
      >
        <WaitingAnimation />
      </div>
    </div>
  </div>
</template>

<style>
.customcolor {
  background-color: var(--color-accent);
  color: var(--color-accent-fg);
}
.customborder {
  border-color: var(--color-accent-fg);
}
</style>

<style scoped>
.backoffice-layout {
  display: flex;
  height: 100vh;
  background: var(--color-bg);
  color: var(--color-text);
}

.mobile-menu-btn {
  position: fixed;
  top: 16px;
  left: 16px;
  z-index: 50;
  padding: 8px 10px;
  border-radius: var(--radius-sm);
  border: 1px solid var(--color-border);
  background: var(--color-surface);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
  cursor: pointer;
}

.sidemenu {
  flex-shrink: 0;
  width: 260px;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid var(--color-border);
  background: var(--color-surface);
}

.sidemenu-inner {
  display: flex;
  flex-direction: column;
  align-items: stretch;
  min-height: 100%;
  padding: 16px 14px 20px;
}

.logo-container {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 10px 4px 18px;
}
.logo-container img {
  max-width: 85%;
  height: auto;
}

.sidenav {
  display: flex;
  flex-direction: column;
  flex: 1;
}

.nav-group {
  margin-bottom: 14px;
}
.nav-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  padding: 0 10px 6px;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 8px 10px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--color-text);
  font-size: 13.5px;
  font-weight: 500;
  text-align: left;
  text-decoration: none;
  cursor: pointer;
}
.nav-item:hover {
  background: var(--color-surface-alt);
}
.nav-item.router-link-active {
  /* --color-accent-fg is calibrated for text on a *solid* --color-accent background (e.g. a
     primary button) - it can be a light color, which would wash out here since this is a pale
     14%-tint background instead. --color-accent itself is always dark/saturated enough to read
     against its own faint tint, regardless of what FontColor an admin configures. */
  background: var(--color-accent-tint);
  color: var(--color-accent);
  font-weight: 600;
}
.nav-item-icon {
  width: 15px;
  flex-shrink: 0;
}
.nav-item-logout {
  margin-top: auto;
  color: var(--color-text-muted);
}

.sidemenu-footer {
  margin-top: 14px;
  padding-top: 14px;
  border-top: 1px solid var(--color-border);
}
.user-loggedin {
  font-size: 12px;
  color: var(--color-text-muted);
  padding: 0 10px 10px;
}
.lang-select {
  margin: 0 10px;
  height: 32px;
  width: 64px;
  border: 1px solid var(--color-border);
  border-radius: var(--radius-sm);
  background: var(--color-surface);
  color: var(--color-text);
  font-size: 12px;
  font-weight: 600;
  text-align: center;
}

.main-container {
  flex: 1;
  min-width: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.header-slot {
  flex: none;
  text-align: left;
  min-height: 80px;
  padding: 20px 20px 16px;
  background: var(--color-surface);
  border-bottom: 1px solid var(--color-border);
}
.main-slot {
  flex: 1;
  min-height: 0;
  text-align: left;
  padding: 20px;
  background: var(--color-bg);
  overflow-y: auto;
}

footer {
  position: fixed;
  bottom: 0;
  width: 100%;
  text-align: left;
  margin-top: 50px;
  padding-top: 50px;
}

@media (max-width: 767.98px) {
  .sidemenu {
    position: fixed;
    top: 0;
    left: 0;
    z-index: 40;
    transform: translateX(-100%);
    transition: transform 0.22s ease-in-out;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  }
  .sidemenu.open {
    transform: translateX(0);
  }
  .header-slot {
    padding-left: 56px;
  }
  .mobile-overlay {
    position: fixed;
    inset: 0;
    z-index: 30;
    background: rgba(0, 0, 0, 0.4);
  }
}
</style>

<style lang="scss">
.backoffice-layout {
  tbody {
    tr:hover {
      background-color: #b3ceb3;
    }
  }
}
</style>
