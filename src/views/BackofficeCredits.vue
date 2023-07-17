<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1>Ausweisnummer eingeben</h1>
          <p className="border-solid border-2 italic text-sm">Eingabefeld</p>
          <h2 className="font-bold underline mt-3 pt-3">Offene Beträge</h2>
          <div className="table-auto border-spacing-4">
            <thead>
              <tr>
                <th>Ausweisnummer</th>
                <th>Betrag</th>
                <th>Zuletzt beglichen</th>
                <th>Aktion</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td>BE-202</td>
                <td>20 €</td>
                <td>20.01.2023</td>
                <td className="rounded-full bg-lime-600 text-white">Auszahlen</td>
              </tr>
              <tr>
                <td>MU-5592</td>
                <td>5 €</td>
                <td>23.03.2023</td>
                <td className="rounded-full bg-lime-600 text-white">Auszahlen</td>
              </tr>
              <tr>
                <td>LK-373</td>
                <td>3 €</td>
                <td>17.05.2022</td>
                <td className="rounded-full bg-lime-600 text-white">Auszahlen</td>
              </tr>
              <tr>
                <td>BK-902</td>
                <td>7 €</td>
                <td>07.02.2023</td>
                <td className="rounded-full bg-lime-600 text-white">Auszahlen</td>
              </tr>
              <tr>
                <td>AE-760</td>
                <td>10 €</td>
                <td>02.03.2023</td>
                <td className="rounded-full bg-lime-600 text-white">Auszahlen</td>
              </tr>
            </tbody>
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
