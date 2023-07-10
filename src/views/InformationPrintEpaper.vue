<script setup lang="ts">
    import { RouterLink} from 'vue-router'
</script>

<template>
  <main  className="h-screen px-10 py-16 grid grid-rows-6 place-items-center">
    <header >
        <img alt="Augustin logo" className="logo mx-auto my-5" src="@/assets/logo.svg" width="270" height="150"/>
    </header>
    <div className="text-center font-semibold text-4xl">
        Epaper
    </div>
    <div className="flex place-items-center w-full row-span-3   ">
        E-Paper ist einen digitale Zeitung, diese wird dir nach deinem Kauf in unserem online Store angezeigt
    </div>
    <div>
        Print-Version
    </div>
    <div>
        Die Print-Version ist die klassische physische Zeitung. Ihr_e Verkäufer_in wird Ihnen diese nach Abschluss des Kaufes aushändigen.
    </div>
    <div className="flex place-items-center w-full">
        <button class="bg-green-600 rounded-full p-7 text-white text-4xl font font-semibold w-full">
            <RouterLink to="/print-digital">Zurück</RouterLink>
        </button>
    </div>
  </main>
</template>