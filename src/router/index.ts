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
      path: '/print-digital',
      name: 'Version choice',
      component: () => import('../views/PrintDigital.vue')
    }
  ]
})

export default router
