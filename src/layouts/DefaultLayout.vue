<template>
    <div class="base-layout">
        <main class="h-screen px-10 py-16 place-items-center base-layout">
            <header class="place-items-center h-1/6">
            <slot name="header">
                <img alt="Augustin logo" className="logo mx-auto my-2" src="@/assets/logo.svg" width="270" height="150" />

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