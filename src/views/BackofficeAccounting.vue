<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center  space-y-3 space-x-3">
          <h1 className="font-bold mt-3 pt-3 text-2xl">Umsätze</h1>
          <p className="text-lg">Zeitraum eingeben:</p>
          <p className="border-solid border-2 italic text-sm">01.02.2023 - 28.02.2023</p>
          <button className="p-2 rounded-full bg-lime-600 text-white text-sm">Download.csv</button>
          <div className="table-auto border-spacing-4 border-collapse">
            <thead>
              <tr>
                <th className="p-3">Datum</th>
                <th className="p-3">Betrag</th>
                <th className="p-3">Nummer</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <tr>
                <td className="border-t-2 p-3">07.02.2023</td>
                <td className="border-t-2 p-3">3,5 €</td>
                <td className="border-t-2 p-3">BE-202</td>
              </tr>
              <tr>
                <td className="border-t-2 p-3">07.02.2023</td>
                <td className="border-t-2 p-3">1,5 €</td>
                <td className="border-t-2 p-3">AU-777</td>
              </tr>
              <tr>
                <td className="border-t-2 p-3">06.02.2023</td>
                <td className="border-t-2 p-3">10 €</td>
                <td className="border-t-2 p-3">LK-373</td>
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
