<template>
    <div class="base-layout">
        <main class="absolute inset-0 px-8 pt-4 pb-16 place-items-center base-layout">
            <header class="place-items-center h-1/6">
                <slot name="header">
                    <img alt="Augustin logo" className="logo mx-auto my-1" :src="apiUrl + 'img/logo.png'" width="213"
                        height="105" />

                </slot>
            </header>
            <div class="h-5/6 main-container">
                <slot name="main">
                    <h1>Default Content</h1>
                </slot>
            </div>
        </main>
        <footer>
            <slot name="footer" />
        </footer>
    </div>
</template>
<script setup lang="ts">
const apiUrl = import.meta.env.VITE_API_URL
</script>
<style lang="scss" scoped>
.main-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: 10px;
}

.logo {
    max-height: 80px;
    width: auto;
}
</style>
<style>
main {
    max-width: 400px;
    left: 0;
    right: 0;
    margin: auto;
}
</style>