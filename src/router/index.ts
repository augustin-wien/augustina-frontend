import { createRouter, createWebHistory } from 'vue-router'
import Default from '@/layouts/Default.vue'

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
    }
  ]
})

export default router
