<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1 className="font-bold underline mt-3 pt-3">Einstellungen Augustin Zeitung</h1>

          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th className="p-3">Thema</th>
                <th className="p-3">Aktuell</th>
              </tr>
            </thead>
            <tbody className="text-sm  p-3">
              <tr>
                <td className="border-t-2 p-3 font-bold">Logo</td>
                <td className="border-t-2 p-3">
                  <img
                    src="../assets/logo.svg"
                    alt="Augustin logo"
                    className="logo mx-auto my-5"
                    width="50"
                    height="20"
                  />
                </td>
              </tr>
              <tr>
                <td className="border-t-2 p-3 font-bold">Cover</td>
                <td className="border-t-2 p-3">
                  <img
                    src="../assets/logo.svg"
                    alt="Augustin logo"
                    className="logo mx-auto my-5"
                    width="50"
                    height="20"
                  />
                </td>
              </tr>
              <tr>
                <td className="border-t-2 p-3 font-bold">Name</td>
                <td className="border-t-2 p-3">Augustin</td>
              </tr>
              <tr>
                <td className="border-t-2 p-3 font-bold">Preis</td>
                <td className="border-t-2 p-3">3 Euro</td>
              </tr>
              <tr>
                <td className="border-t-2 p-3 font-bold">Beschreibungstext</td>
                <td className="border-t-2 p-3">Hakuna Matata</td>
              </tr>
              <tr>
                <td className="border-t-2 p-3 font-bold">Übernahme Transaktionskosten</td>
                <td className="border-t-2 p-3">Augustin</td>
              </tr>
            </tbody>
            <div>
              <router-link to="/backoffice/settings/update">
                <button className="p-2 rounded-full bg-lime-600 text-white mr-2">Ändern</button>
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
