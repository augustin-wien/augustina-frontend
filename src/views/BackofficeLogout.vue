<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1>Bis zum nächsten Mal!</h1>
          <h2 className="font-bold underline mt-3 pt-3">Du bist ausgelogged.</h2>
        </div>
      </main>
    </template>
  </component>
</template>
