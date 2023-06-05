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
      path: '/paymentconfirmation',
      name: 'Payment Confirmation',
      component: () => import('../views/PaymentConfirmation.vue')
    }
  ]
})

export default router
