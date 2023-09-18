<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      TODO: Brauche noch Augustin Api mit korrekten Daten, aktuell ist alles hard gecoded.

      <main>
        <div className="container page-content space-x-2 mt-5">
          <div className="text-center text-2xl space-y-3 space-x-3">
            <h1 className="font-bold text-3xl mt-3 p-3">Einstellungen</h1>

            <div className="table-auto border-spacing-4 border-collapse text-left">
              <tbody className="text-sm">
                <tr>
                  <th className="text-2xl">Thema</th>
                  <th className="text-2xl">Aktuell</th>
                </tr>
                <tr>
                  <th className="p-3">Logo:</th>
                  <td className="p-3">
                    <img
                      src="../assets/logo.svg"
                      alt="Augustin logo"
                      class="logo mx-auto my-5"
                      width="50"
                      height="20"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="p-3">Cover:</th>
                  <td className="p-3">
                    <img
                      src="../assets/logo.svg"
                      alt="Augustin logo"
                      class="logo mx-auto my-5"
                      width="50"
                      height="20"
                    />
                  </td>
                </tr>
                <tr>
                  <th className="p-3">Name:</th>
                  <td className="p-3">Augustin</td>
                </tr>
                <tr>
                  <th className="p-3">Preis:</th>
                  <td className="p-3">3 €</td>
                </tr>
                <tr>
                  <th className="p-3">Beschreibung:</th>
                  <td className="p-3">Hakuna Matata</td>
                </tr>
                <tr>
                  <th className="p-3">Transaktionskosten:</th>
                  <td className="p-3">Redaktion</td>
                </tr>
              </tbody>
            </div>
            <div>
              <router-link to="/backoffice/settings/update">
                <button class="p-2 rounded-full bg-lime-600 text-white mr-2">Ändern</button>
              </router-link>
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
