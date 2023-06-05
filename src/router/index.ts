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
      path: '/vendor/overview',
      name: 'VendorOverview',
      component: () => import('../views/VendorOverview.vue')
    },
    {
      path: '/vendor/qrcode',
      name: 'VendorQRCode',
      component: () => import('../views/QRView.vue')
    }
  ]
})

export default router
