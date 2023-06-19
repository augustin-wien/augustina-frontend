<template>
    <div class="base-layout">
        <header>
            <slot name="header">
                <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150" />

                </slot>
        </header>
        <main class="main-container">
            <slot>
                <h1>Default Content</h1>
            </slot>
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