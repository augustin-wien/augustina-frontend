<script setup lang="ts">

</script>
<template>
    <header>
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <main class="text-center">
        <h1>Login</h1>
        <form class="flex items-center flex-col">
            <label for="email">Email</label>
            <input class="rounded" type="email" id="email" name="email" placeholder="Email" required>
            <label for="password">Password</label>
            <input class="rounded" type="password" id="password" name="password" placeholder="Password" required>
            <button class="px-4 py-2 font-semibold text-sm bg-cyan-500 text-white rounded-full shadow-sm" type="submit">Login</button>
        </form>

    </main>

</template>