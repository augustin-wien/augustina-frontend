<script setup lang="ts">
import keycloak from '@/keycloak/keycloak';
import axios from 'axios';

function logout() {
    keycloak.logout();
}
const instance = axios.create({
  withCredentials: true
})
console.log(keycloak);

instance.interceptors.request.use(
    config => {
        config.headers.Authorization = `Bearer ${keycloak.token}`;
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

function get(){
    instance.get('http://localhost:3000/hello')
    .then(response => {
        console.log(response);
    })
    .catch(error => {
        console.log(error);
    });

}


</script>
<template>
    <header>
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <main class="text-center font-semibold text-4xl">
        <h1>Dashboard</h1>
        <p>Coming soon...</p>
        <button class="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm" @click="get()">Call backend</button>
        <button class="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm" @click="logout()">Logout</button>
    </main>

</template>