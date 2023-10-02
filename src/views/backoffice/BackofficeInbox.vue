<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header> <h1 className="font-bold mt-3 pt-3 text-2xl">Eingang</h1></template>

    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th className="p-3">Uhrzeit</th>
                <th className="p-3">User</th>
                <th className="p-3">Einnahme</th>
                <th className="p-3">Abgabe</th>
                <th className="p-3">Zahlart</th>
                <th className="p-3">Ausgabe</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td className="border-t-2 p-3">07.02.2023 11:24:03</td>
                <td className="border-t-2 p-3">Doris</td>
                <td className="border-t-2 p-3">5 €</td>
                <td className="border-t-2 p-3">1,5 €</td>
                <td className="border-t-2 p-3">Paypal</td>
                <td className="border-t-2 p-3">Online</td>
              </tr>
              <tr>
                <td className="border-t-2 p-3">06.02.2023 09:17:16</td>
                <td className="border-t-2 p-3">Sylvia</td>
                <td className="border-t-2 p-3">10 €</td>
                <td className="border-t-2 p-3">0 €</td>
                <td className="border-t-2 p-3">Kreditkarte</td>
                <td className="border-t-2 p-3">Print</td>
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
