<template>
    <div class="base-layout">
        <main class="h-screen px-8 py-8 place-items-center base-layout">
            <header class="place-items-center h-1/6">
            <slot name="header">
                <img alt="Augustin logo" className="logo mx-auto my-2" src="@/assets/logo.svg" width="243" height="135" />

                </slot>
            </header>
            <div class="h-5/6">
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

<style lang="scss">
.main-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
}

</style>