import keycloak from '@/keycloak/keycloak'
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'Landingpage',
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
