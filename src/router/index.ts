import keycloak from '@/keycloak/keycloak'
import { createRouter, createWebHistory } from 'vue-router'
import { usePaymentStore } from '@/stores/PaymentStore'
import Default from '@/layouts/DefaultLayout.vue'


const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landingpage',
      meta: {
        layout: Default,
      },
      component: () => import('../views/LandingPage.vue')
    },
    {
      path: '/additionalproducts',
      name: 'Additional Products',
      component: () => import('../views/AdditionalProducts.vue'),
      meta: { transition: 'slide-left' }
    },
    {
      path: '/print-digital',
      name: 'Version choice',
      component: () => import('../views/PrintDigital.vue'),
      meta: { transition: 'slide-left' }
    },
    {
      path: '/404',
      name: '404',
      component: () => import('../views/404View.vue'),
      meta: { transition: 'slide-left' }
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
      path: '/information',
      name: 'InformationPrintEpaper',
      component: () => import('../views/InformationPrintEpaper.vue')
    },
    {
      path: '/confirmation',
      name: 'Confirmation',
      component: () => import('../views/FinalPurchaseConfirmation.vue'),
      meta: { transition: 'slide-left' }
    },
    {
      path: '/payment',
      name: 'Payment',
      component: () => import('../views/PaymentVivawallet.vue'),
      meta: { transition: 'slide-left' }
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
      path: '/success',
      name: 'Success',
      component: () => import('../views/WaitingCountdown.vue')
    },
    {
      path: '/custom-tip',
      name: 'Custom Tip',
      component: () => import('../views/CustomTip.vue')
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

//Check if AGBs are accepted
router.beforeEach(async (next) => {
  if(next.name == 'Payment' && !usePaymentStore().agbChecked){
    return {}
  }
  //Redirect to vivawallet
  else if(usePaymentStore().paymentservice == 1){
    //router.push(usePaymentStore().url) 
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
