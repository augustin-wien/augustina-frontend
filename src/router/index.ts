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
    }
  ]
})

export default router
