import keycloak, {initKeycloak} from '@/keycloak/keycloak'
import { createRouter, createWebHistory } from 'vue-router'
import Default from '@/layouts/DefaultLayout.vue'
import BackofficeDefault from '@/layouts/BackofficeLayout.vue'
import { useKeycloakStore } from '@/stores/keycloak'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      meta: {
        layout: Default
      },
      component: () => import('../views/HomeView.vue')
    },
    {
      path: '/v/:id',
      name: 'Parent',
      meta: {
        layout: Default,
      },
      component: () => import('../views/ParentPaymentProcess.vue'),
      children: [
        {
          path: '/v/:id/landing-page',
          name: 'LandingPage',
          component: () => import('../views/LandingPage.vue'),
        },
        {
          path: '/v/:id/additionalproducts',
          name: 'Additional Products',
          component: () => import('../views/AdditionalProducts.vue'),
        },
        {
          path: '/v/:id/print-digital',
          name: 'Version choice',
          component: () => import('../views/PrintDigital.vue'),
        },
        {
          path: '/v/:id/tipping',
          name: 'Tippingpage',
          component: () => import('../views/TippingPage.vue'),
        },
        {
          path: '/v/:id/information',
          name: 'InformationPrintEpaper',
          component: () => import('../views/InformationPrintEpaper.vue'),
        },
        {
          path: '/v/:id/confirmation',
          name: 'Confirmation',
          component: () => import('../views/FinalPurchaseConfirmation.vue'),
        },
        {
          path: '/v/:id/payment',
          name: 'Payment',
          component: () => import('../views/PaymentVivawallet.vue'),
        },
        {
          path: '/v/:id/paymentconfirmation',
          name: 'Payment Confirmation',
          component: () => import('../views/PaymentConfirmation.vue'),
        },
        {
          path: '/v/:id/success',
          name: 'Success',
          component: () => import('../views/WaitingCountdown.vue'),
        },
        {
          path: '/v/:id/failure',
          name: 'Failure',
          component: () => import('../views/FailureVivawallet.vue'),
        },
        {
          path: '/v/:id/custom-tip',
          name: 'Custom Tip',
          component: () => import('../views/CustomTip.vue'),
        },
        {
          path: '/v/:id/shop',
          name: 'Shop',
          component: () => import('../views/ShopPage.vue'),
        }
      ]
    },
    {
      path: '/backoffice/credits',
      name: 'Backoffice Credit',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeCredits.vue')
    },

    {
      path: '/backoffice/credits/payout/:ID',
      name: 'Credit Payout',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      props: true,
      component: () => import('../views/backoffice/BackofficeCreditPayout.vue')
    },
    {
      path: '/backoffice/accounting',
      name: 'Backoffice Accounting',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeAccounting.vue')
    },
    {
      path: '/backoffice/logs',
      name: 'Backoffice Logs',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeLogs.vue')
    },
    {
      path: '/backoffice/inbox',
      name: 'Backoffice Inbox',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeInbox.vue')
    },
    {
      path: '/backoffice/vendorsummary',
      name: 'Vendor Summary',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeVendorSummary.vue')
    },
    {
      path: '/backoffice/newvendor',
      name: 'New Vendor',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeNewVendor.vue')
    },
    {
      path: '/backoffice/userprofile/:ID',
      name: 'Vendor Profile',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeUserProfile.vue')
    },
    {
      path: '/backoffice/userprofile/:ID/update',
      name: 'Update Vendor Profile',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeUpdateVendor.vue')
    },
    {
      path: '/backoffice/settings',
      name: 'Backoffice Settings',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeSettings.vue')
    },
    {
      path: '/backoffice/settings/update',
      name: 'Update Backoffice Settings',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeUpdateAugustin.vue')
    },

    {
      path: '/backoffice/productsettings',
      name: 'Backoffice Product Settings',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeProductSettings.vue')
    },
    {
      path: '/backoffice/newproduct',
      name: 'New Product',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeNewProduct.vue')
    },
    {
      path: '/backoffice/productsettings/update/:ID',
      name: 'Update Product',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/backoffice/BackofficeProductUpdate.vue')
    },
    {
      path: '/404',
      name: '404',
      component: () => import('../views/404View.vue'),
      meta: {
        layout: Default
      }
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
      path: '/vendoroverview',
      name: 'Vendor Overview',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/VendorOverview.vue')
    },
    {
      path: '/qr-code',
      name: 'QR Code',
      component: () => import('../views/QRCode.vue'),
      meta: {
        layout: Default
      }
    }
  ]
})

// Check if the user is authenticated
router.beforeEach(async (to: any) => {
  if (
    to.meta.requiresAuth &&
    !isAuthenticated() &&
    // ❗️ Avoid an infinite redirect
    to.name !== '404'
  ) {
    // Redirect happens before the first page load,
    //so we need to wait for the router to be ready
    // redirect the user to the login page
    // return { name: '404' }
  }
  // Condition to toggle Lite-Mode
  else if (import.meta.env.VITE_TOGGLE === 'true' && to.name === 'Version choice') {
    return { name: 'Tippingpage' }
  }
})

// Check if the user is authenticated
async function isAuthenticated() {
  if (!keycloak.initailizedKeycloak) {
    try {
      const resp = await initKeycloak()
    } catch (error) {
      console.log('init keycloak failed', error)
    }
    const keycloakStore = useKeycloakStore()
    keycloakStore.setAuthenticated(keycloak.keycloak.authenticated)
    if (keycloak.keycloak.tokenParsed){
      keycloakStore.setUsername(keycloak.keycloak.tokenParsed.preferred_username)
    }
    return keycloak.keycloak.authenticated
  } else {
    return keycloak.keycloak.authenticated
  }
}

export default router
