import keycloak from '@/keycloak/keycloak'
import { createRouter, createWebHistory } from 'vue-router'
import { usePaymentStore } from '@/stores/PaymentStore'
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
      component: () => import('../views/AdditionalProducts.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/print-digital',
      name: 'Version choice',
      component: () => import('../views/PrintDigital.vue'),
      meta: {
        layout: Default
      }
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
      path: '/tipping',
      name: 'Tippingpage',
      component: () => import('../views/TippingPage.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/information',
      name: 'InformationPrintEpaper',
      component: () => import('../views/InformationPrintEpaper.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/confirmation',
      name: 'Confirmation',
      component: () => import('../views/FinalPurchaseConfirmation.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/payment',
      name: 'payment',
      component: () => import('../views/PaymentVivawallet.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/paymentconfirmation',
      name: 'Payment Confirmation',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/PaymentConfirmation.vue')
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
      path: '/backoffice/credits',
      name: 'Backoffice Credit',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeCredits.vue')
    },

    {
      path: '/backoffice/credits/payout/:ID',
      name: 'Credit Payout',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      props: true,
      component: () => import('../views/BackofficeCreditPayout.vue')
    },
    {
      path: '/backoffice/accounting',
      name: 'Backoffice Accounting',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeAccounting.vue')
    },
    {
      path: '/backoffice/logs',
      name: 'Backoffice Logs',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeLogs.vue')
    },
    {
      path: '/backoffice/inbox',
      name: 'Backoffice Inbox',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeInbox.vue')
    },
    {
      path: '/backoffice/vendorsummary',
      name: 'Vendor Summary',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeVendorSummary.vue')
    },
    {
      path: '/backoffice/newvendor',
      name: 'New Vendor',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeNewVendor.vue')
    },
    {
      path: '/backoffice/userprofile/:ID',
      name: 'Vendor Profile',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeUserProfile.vue')
    },
    {
      path: '/backoffice/userprofile/:ID/update',
      name: 'Update Vendor Profile',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeUpdateVendor.vue')
    },
    {
      path: '/backoffice/settings',
      name: 'Backoffice Settings',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeSettings.vue')
    },
    {
      path: '/backoffice/settings/update',
      name: 'Update Backoffice Settings',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeUpdateAugustin.vue')
    },

    {
      path: '/backoffice/productsettings',
      name: 'Backoffice Product Settings',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeProductSettings.vue')
    },
    {
      path: '/backoffice/newproduct',
      name: 'New Product',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeNewProduct.vue')
    },
    {
      path: '/backoffice/productsettings/update/:ID',
      name: 'Update Product',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeProductUpdate.vue')
    },
    {
      path: '/backoffice/logout',
      name: 'Backoffice Logout',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true
      },
      component: () => import('../views/BackofficeLogout.vue')
    },
    {
      path: '/success',
      name: 'Success',
      component: () => import('../views/WaitingCountdown.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/custom-tip',
      name: 'Custom Tip',
      component: () => import('../views/CustomTip.vue'),
      meta: {
        layout: Default
      }
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

//Check if AGBs are accepted
router.beforeEach(async (next: any) => {
  if (next.name == 'Payment' && !usePaymentStore().agbChecked) {
    return {}
  }
  //Redirect to vivawallet
  else if (usePaymentStore().paymentservice == 1) {
    //router.push(usePaymentStore().url)
  }
})

// Check if the user is authenticated
function isAuthenticated() {
  if (!keycloak.initailizedKeycloak) {
    keycloak.keycloak
      .init({
        onLoad: 'check-sso',
        flow: 'implicit'
      })
      .then(() => {
        console.log('keycloak init')
        keycloak.initailizedKeycloak = true
        if (!keycloak.keycloak.authenticated) {
          keycloak.keycloak.login()
        }
        return keycloak.keycloak.authenticated
      })
      .catch((error: any) => {
        console.log('init keycloak failed', error)
        console.log(keycloak)
      })
  } else {
    if (!keycloak.keycloak.authenticated) {
      keycloak.keycloak.login()
    }
    return keycloak.keycloak.authenticated
  }
}

export default router
