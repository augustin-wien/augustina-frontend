<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1>Ausweisnummer eingeben</h1>
          <p className="border-solid border-2 italic text-sm">Eingabefeld</p>
          <h2 className="font-bold underline mt-3 pt-3">Offene Beträge</h2>
          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th className="p-3">Ausweisnummer</th>
                <th className="p-3">Betrag</th>
                <th className="p-3">Zuletzt beglichen</th>
                <th className="p-3">Aktion</th>
              </tr>
            </thead>
            <tbody className="text-sm  p-3">
              <tr>
                <td className="border-t-2 p-3">BE-202</td>
                <td className="border-t-2 p-3">20 €</td>
                <td className="border-t-2 p-3">20.01.2023</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">MU-5592</td>
                <td className="border-t-2 p-3">5 €</td>
                <td className="border-t-2 p-3">23.03.2023</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">LK-373</td>
                <td className="border-t-2 p-3">3 €</td>
                <td className="border-t-2 p-3">17.05.2022</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">BK-902</td>
                <td className="border-t-2 p-3">7 €</td>
                <td className="border-t-2 p-3">07.02.2023</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">AE-760</td>
                <td className="border-t-2 p-3">10 €</td>
                <td className="border-t-2 p-3">02.03.2023</td>
                <router-link to="/backoffice/credits/payout">
                  <button className="p-3 rounded-full bg-lime-600 text-white">Auszahlen</button>
                </router-link>
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
