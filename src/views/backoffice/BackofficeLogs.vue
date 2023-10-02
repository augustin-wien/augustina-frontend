<template>
  <component :is="$route.meta.layout || 'div'">
    <template #header> <h1 className="font-bold mt-3 pt-3 text-2xl">Logbuch</h1></template>

    <template #main>
      <div class="main">
        <div class="w-full max-w-md mx-auto mt-4 bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
          <div className="text-center text-2xl space-y-3 space-x-3">
            <div className="table-auto border-spacing-4 border-collapse">
              <thead>
                <tr>
                  <th className="p-3">Uhrzeit</th>
                  <th className="p-3">User</th>
                  <th className="p-3">Aktion</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr>
                  <td className="border-t-2 p-3">07.02.2023 12:51:03</td>
                  <td className="border-t-2 p-3">Claudia</td>
                  <td className="border-t-2 p-3">Hat 3,5€ ausgezahlt an Doris</td>
                </tr>
                <tr>
                  <td className="border-t-2 p-3">07.02.2023 12:15:03</td>
                  <td className="border-t-2 p-3">Matthias</td>
                  <td className="border-t-2 p-3">Hat 10€ ausgezahlt an Sylvia</td>
                </tr>
              </tbody>
            </div>
          </div>
        </div>
      </div>
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
