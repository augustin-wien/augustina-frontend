<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1 className="font-bold underline mt-3 pt-3">Übersicht andere Produkte</h1>
          <router-link to="/backoffice/newproduct">
            <button className="p-3 mt-2 rounded-full bg-lime-600 text-white">
              Neues Produkt anlegen
            </button>
          </router-link>
          <div class="overflow-x-auto">
            <table class="table-auto border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th class="p-3"></th>
                  <th class="p-3">Name</th>
                  <th class="p-3">Logo</th>
                  <th class="p-3">Preis</th>
                </tr>
              </thead>
              <tbody class="text-sm p-3">
                <tr>
                  <td class="p-3 font-bold">Kalender</td>
                  <td class="p-3 font-light">Augustin Kalender</td>
                  <td class="p-3">
                    <img
                      src="../assets/logo.svg"
                      alt="Augustin logo"
                      class="logo mx-auto my-5"
                      width="50"
                      height="20"
                    />
                  </td>
                  <td class="p-3 font-light">12 Euro</td>

                  <td class="p-3">
                    <router-link to="#">
                      <button class="p-2 rounded-full bg-lime-600 text-white mr-2">Ändern</button>
                    </router-link>
                  </td>
                </tr>
                <tr>
                  <td class="p-3 font-bold">Schnapskarten</td>
                  <td class="p-3 font-light">Schnapsis</td>
                  <td class="p-3">
                    <img
                      src="../assets/logo.svg"
                      alt="Augustin logo"
                      class="logo mx-auto my-5"
                      width="50"
                      height="20"
                    />
                  </td>
                  <td class="p-3 font-light">7 Euro</td>
                  <td class="p-3">
                    <router-link to="#">
                      <button class="p-2 rounded-full bg-lime-600 text-white mr-2">Ändern</button>
                    </router-link>
                  </td>
                </tr>
              </tbody>
            </table>
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
