<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5">
          <div className="text-center text-2xl space-y-3 space-x-3">
            <h1 className="font-bold underline mt-3 pt-3">VerkäuferInnen Profil</h1>
            <div className="table-auto border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">Vorname</th>
                  <th className="p-3">Nachname</th>
                  <th className="p-3">Nummer</th>
                  <th className="p-3">Letzte Auszahlung</th>
                  <th className="p-3">Aktuelles Guthaben</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border-t-2 p-3">Albert</td>
                  <td className="border-t-2 p-3">Einstein</td>
                  <td className="border-t-2 p-3">BE-202</td>
                  <td className="border-t-2 p-3">07.02.2023</td>
                  <td className="border-t-2 p-3">3,5 €</td>
                  <td class="p-3">
                    <router-link to="#">
                      <button class="p-2 rounded-full bg-lime-600 text-white mr-2">Ändern</button>
                    </router-link>
                  </td>
                </tr>
              </tbody>
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
