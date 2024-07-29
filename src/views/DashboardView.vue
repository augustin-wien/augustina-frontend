<script setup lang="ts">
import { getAuthHello } from '@/api/api'
import keycloak from '@/keycloak/keycloak'
import { ref } from 'vue'

function logout() {
  keycloak.keycloak.logout()
}

const message = ref('Press the button to call the backend')

function get() {
  getAuthHello().then((response: any) => {
    message.value = response.data
    console.log(response)
  })
}
</script>

<template>
  <header>
    <img
      alt="Augustin logo"
      className="logo mx-auto my-5"
      src="@/assets/logo.svg"
      width="270"
      height="150"
    />
  </header>
  <main class="text-center text-4xl">
    <h1>Dashboard</h1>
    <p>{{ message }}</p>
    <button
      class="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm"
      @click="get()"
    >
      Call backend
    </button>
    <button
      class="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm"
      @click="logout()"
    >
      Logout
    </button>
  </main>
</template>
