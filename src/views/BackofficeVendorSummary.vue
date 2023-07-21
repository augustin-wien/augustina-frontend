<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1 className="font-bold underline mt-3 pt-3">Übersicht aller VerkäuferInnen</h1>
          <router-link to="/backoffice/vendorsummary/newvendor">
            <button className="p-3 m-3 rounded-full bg-lime-600 text-white text-sm">
              Neue VerkäuferIn anlegen
            </button>
          </router-link>
          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th className="p-3">Ausweisnummer</th>
                <th className="p-3">Vorname</th>
                <th className="p-3">Name</th>
                <th className="p-3">Aktion</th>
              </tr>
            </thead>
            <tbody className="text-sm  p-3">
              <tr>
                <td className="border-t-2 p-3">BE-202</td>
                <td className="border-t-2 p-3">Alena</td>
                <td className="border-t-2 p-3">Mohsenyar</td>
                <router-link to="/backoffice/pdf">
                  <button className="p-3 rounded-full bg-lime-600 text-white">
                    QR-Code PDF Erstellen
                  </button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">MU-5592</td>
                <td className="border-t-2 p-3">Max</td>
                <td className="border-t-2 p-3">Mustermann</td>
                <router-link to="/backoffice/pdf">
                  <button className="p-3 rounded-full bg-lime-600 text-white">
                    QR-Code PDF Erstellen
                  </button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">LK-373</td>
                <td className="border-t-2 p-3">Leonie</td>
                <td className="border-t-2 p-3">Löwenherz</td>
                <router-link to="/backoffice/pdf">
                  <button className="p-3 rounded-full bg-lime-600 text-white">
                    QR-Code PDF Erstellen
                  </button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">BK-902</td>
                <td className="border-t-2 p-3">Otto</td>
                <td className="border-t-2 p-3">Normalverbraucher</td>
                <router-link to="/backoffice/pdf">
                  <button className="p-3 rounded-full bg-lime-600 text-white">
                    QR-Code PDF Erstellen
                  </button>
                </router-link>
              </tr>
              <tr>
                <td className="border-t-2 p-3">AE-760</td>
                <td className="border-t-2 p-3">Sam</td>
                <td className="border-t-2 p-3">Sample</td>
                <router-link to="/backoffice/pdf">
                  <button className="p-3 rounded-full bg-lime-600 text-white">
                    QR-Code PDF Erstellen
                  </button>
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
