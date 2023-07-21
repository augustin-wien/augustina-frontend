<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1>Auszahlung</h1>
          <h3 className="text-md border rounded">Ausweisnummer</h3>
          <div className="container">
            <div className="row mx-3">
              <div className="col text-lg underline">Gesamtbetrag</div>
              <br />
              <div className="col text-md">20 Euro</div>
              <button className="p-3 m-3 rounded-full bg-lime-600 text-white">Bestätigen</button>
            </div>
            <div className="row mx-3">
              <div className="col text-lg underline">Individuellen Betrag</div>
              <div className="col">
                <p>Auszuzahlender Betrag: {{ betrag }} Euro</p>
                <input
                  className="text-center border"
                  v-model="betrag"
                  type="number"
                  placeholder="5"
                />
                <button className="p-3 m-3 rounded-full bg-lime-600 text-white">Bestätigen</button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </template>
  </component>
</template>

<style>
tr {
  padding: 10px;
}
td {
  padding: 10px;
}
</style>

<script lang="ts">
export default {
  data() {
    return {
      betrag: ''
    }
  }
}
</script>
