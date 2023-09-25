import keycloak from '@/keycloak/keycloak'
import { createRouter, createWebHistory } from 'vue-router'
import { usePaymentStore } from '@/stores/PaymentStore'
import Default from '@/layouts/DefaultLayout.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/:id',
      name: 'Parent',
      meta: {
        layout: Default,
      },
      component: () => import('../views/Parent.vue'),
      children: [
        {
          path: '/:id/landing-page',
          name: 'LandingPage',
          component: () => import('../views/LandingPage.vue'),
        },
        {
          path: '/:id/additionalproducts',
          name: 'Additional Products',
          component: () => import('../views/AdditionalProducts.vue'),
        },
        {
          path: '/:id/print-digital',
          name: 'Version choice',
          component: () => import('../views/PrintDigital.vue'),
        },
        {
          path: '/:id/tipping',
          name: 'Tippingpage',
          component: () => import('../views/TippingPage.vue'),
        },
        {
          path: '/:id/information',
          name: 'InformationPrintEpaper',
          component: () => import('../views/InformationPrintEpaper.vue'),
        },
        {
          path: '/:id/confirmation',
          name: 'Confirmation',
          component: () => import('../views/FinalPurchaseConfirmation.vue'),
        },
        {
          path: '/:id/payment',
          name: 'Payment',
          component: () => import('../views/PaymentVivawallet.vue'),
        },
        {
          path: '/:id/paymentconfirmation',
          name: 'Payment Confirmation',
          component: () => import('../views/PaymentConfirmation.vue'),
        },
        {
          path: '/:id/success',
          name: 'Success',
          component: () => import('../views/WaitingCountdown.vue'),
        },
        {
          path: '/:id/failure',
          name: 'Failure',
          component: () => import('../views/FailureVivawallet.vue'),
        },
        {
          path: '/:id/custom-tip',
          name: 'Custom Tip',
          component: () => import('../views/CustomTip.vue'),
        },
        {
          path: '/:id/shop',
          name: 'Shop',
          component: () => import('../views/ShopPage.vue'),
        }
      ]
    },
    {
      path: '/404',
      name: '404',
      component: () => import('../views/404View.vue'),
      meta: {
        layout: Default,
      },
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
      component: () => import('../views/VendorOverview.vue')
    },
    {
      path: '/qr-code',
      name: 'QR Code',
      component: () => import('../views/QRCode.vue'),
      meta: {
        layout: Default,
      },
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
  // Condition to toggle Lite-Mode
  else if(import.meta.env.VITE_TOGGLE === 'true' && to.name === 'Version choice') {
    return { name: 'Tippingpage'}
  }
})

// Check if the user is authenticated
function isAuthenticated() {
  if (!keycloak.initailizedKeycloak) {
    keycloak.keycloak.init({
      onLoad: 'check-sso',
      flow: 'implicit'
    }).then(() => {
      console.log("keycloak init")
      keycloak.initailizedKeycloak = true
      if (!keycloak.keycloak.authenticated) {
        keycloak.keycloak.login()
      }
      return keycloak.keycloak.authenticated
    }
    ).catch((error) => {
      console.log("init keycloak failed", error)
      console.log(keycloak)
    }
    )
  } else {
    console.log('isAuthenticated', keycloak.keycloak.authenticated)
    if (!keycloak.keycloak.authenticated) {
      keycloak.keycloak.login()
    }
    return keycloak.keycloak.authenticated
  }

}

export default router
