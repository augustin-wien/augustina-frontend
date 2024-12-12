import keycloak, { initKeycloak } from '@/keycloak/keycloak'
import BackofficeDefault from '@/layouts/BackofficeLayout.vue'
import Default from '@/layouts/DefaultLayout.vue'
import VendorLayoutVue from '@/layouts/VendorLayout.vue'
import { useKeycloakStore } from '@/stores/keycloak'
import { createRouter, createWebHistory, type RouteLocationNormalized } from 'vue-router'
import { useSettingsStore } from '@/stores/settings'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Home',
      meta: {
        layout: Default
      },
      component: () => import('@/views/ParentPaymentProcess.vue')
    },
    {
      path: '/v/:id',
      name: 'Parent',
      meta: {
        layout: Default
      },
      component: () => import('@/views/ParentPaymentProcess.vue'),
      children: [
        {
          path: '/v/:id/check-id',
          name: 'Check ID',
          component: () => import('@/views/CheckVendorID.vue')
        },
        {
          path: '/v/:id/landing-page',
          name: 'LandingPage',
          component: () => import('@/views/LandingPage.vue')
        },
        {
          path: '/v/:id/additionalproducts',
          name: 'Additional Products',
          component: () => import('@/views/AdditionalProducts.vue')
        },
        {
          path: '/v/:id/print-digital',
          name: 'Version choice',
          component: () => import('@/views/PrintDigital.vue')
        },
        {
          path: '/v/:id/tipping',
          name: 'Tippingpage',
          component: () => import('@/views/TippingPage.vue')
        },
        {
          path: '/v/:id/information',
          name: 'InformationPrintEpaper',
          component: () => import('@/views/InformationPrintEpaper.vue')
        },
        {
          path: '/v/:id/confirmation',
          name: 'Confirmation',
          component: () => import('@/views/FinalPurchaseConfirmation.vue')
        },
        {
          path: '/v/:id/payment',
          name: 'Payment',
          component: () => import('@/views/PaymentVivawallet.vue')
        },
        {
          path: '/v/:id/custom-tip',
          name: 'Custom Tip',
          component: () => import('@/views/CustomTip.vue')
        },
        {
          path: '/v/:id/shop',
          name: 'Shop',
          component: () => import('@/views/ShopPage.vue')
        },
        {
          path: '/v/:id/item-available',
          name: 'Item Available',
          component: () => import('@/views/ItemAvailable.vue')
        },
        {
          path: '/v/:id/items',
          name: 'Items',
          component: () => import('@/views/SelectedItems.vue')
        }
      ]
    },
    {
      path: '/go-to-vendor',
      name: 'Go to Vendor',
      component: () => import('@/views/GoToVendor.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/paymentconfirmation',
      name: 'Payment Confirmation',
      component: () => import('@/views/PaymentConfirmation.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/success',
      name: 'Success',
      component: () => import('@/views/WaitingCountdown.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/failure',
      name: 'Failure',
      component: () => import('@/views/FailureVivawallet.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/backoffice',
      name: 'Backoffice',
      redirect: '/backoffice/vendorsummary'
    },
    {
      path: '/backoffice/credits',
      name: 'Backoffice Credit',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Credits'
      },
      component: () => import('@/views/backoffice/BackofficeVendorsCredits.vue')
    },

    {
      path: '/backoffice/credits/payout/:ID',
      name: 'Credit Payout',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Payout'
      },
      props: true,
      component: () => import('@/views/backoffice/BackofficeVendorCreditPayout.vue')
    },
    {
      path: '/backoffice/payments',
      name: 'Backoffice Accounting',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Accounting'
      },
      component: () => import('@/views/backoffice/BackofficeAccountingPayments.vue')
    },
    {
      path: '/backoffice/payouts',
      name: 'Backoffice Logs',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Payouts'
      },
      component: () => import('@/views/backoffice/BackofficeAccountingPayouts.vue')
    },
    {
      path: '/backoffice/sales',
      name: 'Backoffice Inbox',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Sales'
      },
      component: () => import('@/views/backoffice/BackofficeAccountingSales.vue')
    },
    {
      path: '/backoffice/vendorsummary',
      name: 'Vendor Summary',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Vendors'
      },
      component: () => import('@/views/backoffice/BackofficeVendorsSummary.vue')
    },
    {
      path: '/backoffice/newvendor',
      name: 'New Vendor',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'New Vendor'
      },
      component: () => import('@/views/backoffice/BackofficeVendorNew.vue')
    },
    {
      path: '/backoffice/userprofile/:ID',
      name: 'Vendor Profile',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Vendor Profile'
      },
      component: () => import('@/views/backoffice/BackofficeVendorProfile.vue')
    },
    {
      path: '/backoffice/userprofile/:ID/update',
      name: 'Update Vendor Profile',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Update Vendor Profile'
      },
      component: () => import('@/views/backoffice/BackofficeVendorUpdate.vue')
    },
    {
      path: '/backoffice/settings/update',
      name: 'Update Backoffice Settings',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Update Settings'
      },
      component: () => import('@/views/backoffice/SettingsUpdate.vue')
    },

    {
      path: '/backoffice/productsettings',
      name: 'Backoffice Product Settings',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Products'
      },
      component: () => import('@/views/backoffice/BackofficeProductSettings.vue')
    },
    {
      path: '/backoffice/newproduct',
      name: 'New Product',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'New Product'
      },
      component: () => import('@/views/backoffice/BackofficeProductNew.vue')
    },
    {
      path: '/backoffice/map',
      name: 'Map',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Map'
      },
      component: () => import('@/views/backoffice/MapView.vue')
    },
    {
      path: '/backoffice/statistics',
      name: 'Statistics',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Settings'
      },
      component: () => import('@/views/backoffice/Statistics.vue')
    },
    {
      path: '/backoffice/productsettings/update/:ID',
      name: 'Update Product',
      meta: {
        layout: BackofficeDefault,
        requiresAuth: true,
        title: 'Product Settings'
      },
      component: () => import('@/views/backoffice/BackofficeProductUpdate.vue')
    },
    {
      path: '/404',
      name: '404',
      component: () => import('@/views/404View.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/error',
      name: 'Error',
      component: () => import('@/views/ErrorPage.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/error-invalid-link',
      name: 'Error invalid link',
      component: () => import('@/views/ErrorPageInvalidLink.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/pdf/:id',
      name: 'pdf download link',
      component: () => import('@/views/PDFDownload.vue'),
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
      component: () => import('@/views/DashboardView.vue')
    },
    {
      path: '/me',
      name: 'My Info',
      meta: {
        layout: Default,
        requiresAuth: true
      },
      component: () => import('@/views/VendorOverview.vue')
    },
    {
      path: '/me/qrcode',
      name: 'My QR Code',
      meta: {
        layout: VendorLayoutVue,
        requiresAuth: true
      },
      component: () => import('@/views/VendorViewQRCode.vue')
    },
    {
      path: '/me/profile',
      name: 'My Profile',
      meta: {
        layout: VendorLayoutVue,
        requiresAuth: true
      },
      component: () => import('@/views/VendorViewProfil.vue')
    },
    {
      path: '/:pathMatch(.*)*',
      name: 'all',
      component: () => import('@/views/GoToVendor.vue'),
      meta: {
        layout: Default
      }
    },
    {
      path: '/maintenance',
      name: 'Maintenance',
      component: () => import('@/views/MaintenanceWork.vue'),
      meta: {
        layout: Default
      }
    }
  ]
})

//Change tab names
router.afterEach((to) => {
  const settingsStore = useSettingsStore()

  // Use next tick to handle router history correctly
  // see: https://github.com/vuejs/vue-router/issues/914#issuecomment-384477609
  if (settingsStore.settings.NewspaperName == undefined) {
    document.title = 'Augustina'
  } else if (to.meta.title == undefined) {
    document.title = settingsStore.settings.NewspaperName
  } else {
    document.title = settingsStore.settings.NewspaperName + ' | ' + to.meta?.title
  }
})

// Check if the user is authenticated
router.beforeEach(async (to: RouteLocationNormalized) => {
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
})

// Check if the user is authenticated
async function isAuthenticated() {
  if (!keycloak.initailizedKeycloak) {
    try {
      await initKeycloak()
    } catch (error) {
      // eslint-disable-next-line no-console
      console.log('init keycloak failed', error)
    }

    const keycloakStore = useKeycloakStore()

    keycloakStore.setAuthenticated(
      keycloak.keycloak?.authenticated ? keycloak.keycloak.authenticated : false
    )

    if (keycloak.keycloak?.tokenParsed) {
      keycloakStore.setUsername(keycloak.keycloak.tokenParsed.preferred_username)
    }

    return keycloak.keycloak?.authenticated
  } else {
    return keycloak.keycloak?.authenticated
  }
}

export default router
