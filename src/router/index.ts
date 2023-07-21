import keycloak from '@/keycloak/keycloak'
import { createRouter, createWebHistory } from 'vue-router'
import Default from '@/layouts/DefaultLayout.vue'
import BackofficeDefault from '@/layouts/BackofficeLayout.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landingpage',
      meta: {
        layout: Default
      },
      component: () => import('../views/LandingPage.vue')
    },
    {
      path: '/additionalproducts',
      name: 'Additional Products',
      component: () => import('../views/AdditionalProducts.vue')
    },
    {
      path: '/print-digital',
      name: 'Version choice',
      component: () => import('../views/PrintDigital.vue')
    },
    {
      path: '/404',
      name: '404',
      component: () => import('../views/404View.vue')
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      meta: {
        requiresAuth: true
      },
      component: () => import('../views/DashboardView.vue')
    },
    {
      path: '/tipping',
      name: 'Tippingpage',
      component: () => import('../views/TippingPage.vue')
    },
    {
      path: '/paymentconfirmation',
      name: 'Payment Confirmation',
      component: () => import('../views/PaymentConfirmation.vue')
    },
    {
      path: '/vendoroverview',
      name: 'Vendor Overview',
      component: () => import('../views/VendorOverview.vue')
    },
    {
      path: '/backoffice/credits',
      name: 'Backoffice Credit',
      meta: {
        layout: BackofficeDefault
      },
      component: () => import('../views/BackofficeCredits.vue')
    },
    {
      path: '/backoffice/credits/payout',
      name: 'Credit Payout',
      meta: {
        layout: BackofficeDefault
      },
      component: () => import('../views/BackofficeCreditPayout.vue')
    },
    {
      path: '/backoffice/accounting',
      name: 'Backoffice Accounting',
      meta: {
        layout: BackofficeDefault
      },
      component: () => import('../views/BackofficeAccounting.vue')
    },
    {
      path: '/backoffice/logs',
      name: 'Backoffice Logs',
      meta: {
        layout: BackofficeDefault
      },
      component: () => import('../views/BackofficeLogs.vue')
    },
    {
      path: '/backoffice/inbox',
      name: 'Backoffice Inbox',
      meta: {
        layout: BackofficeDefault
      },
      component: () => import('../views/BackofficeInbox.vue')
    },

    {
      path: '/backoffice/logout',
      name: 'Backoffice Logout',
      meta: {
        layout: BackofficeDefault
      },
      component: () => import('../views/BackofficeLogout.vue')
    }
  ]
})

// Check if the user is authenticated
router.beforeEach(async (to) => {
  if (
    to.meta.requiresAuth &&
    !isAuthenticated() &&
    // ❗️ Avoid an infinite redirect
    to.name !== '404'
  ) {
    // redirect the user to the login page
    return { name: '404' }
  }
})

// Check if the user is authenticated
function isAuthenticated() {
  console.log('isAuthenticated', keycloak.authenticated)
  if (!keycloak.authenticated) {
    keycloak.login()
  }
  return keycloak.authenticated
}

export default router
