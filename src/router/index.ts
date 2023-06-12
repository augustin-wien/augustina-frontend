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
      path: '/login',
      name: 'Login',
      component: () => import('../views/Login.vue')
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      meta: {
        requiresAuth: true
      },
      component: () => import('../views/Dashboard.vue')
    }

  ]
})


// Check if the user is authenticated
router.beforeEach(async (to, from) => {
  if (
    to.meta.requiresAuth &&
    !isAuthenticated() &&
    // ❗️ Avoid an infinite redirect
    to.name !== 'Login'
  ) {
    // redirect the user to the login page
    return { name: 'Login' }
  }
})

// Check if the user is authenticated
function isAuthenticated() {
  console.log("isAuthenticated", keycloak.authenticated)
  if (!keycloak.authenticated) {
    keycloak.login();
  }
  return keycloak.authenticated
}


export default router
