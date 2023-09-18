<template>
  <component :is="$route.meta.layout || 'div'">
    <template #main>
      <main>
        <div className="page-content space-x-2 mt-5"></div>
        <div className="text-center text-2xl space-y-3 space-x-3">
          <h1 className="font-bold text-3xl mt-3 pt-3">Logbuch</h1>
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
