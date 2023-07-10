<template>
  <div class="vendor-overview container mx-auto mb-8 p-24 space-y-40 pb-3">
    <div class="flex flex-col items-center space-y-8">
      <img class="w-30 inset-12" alt="Augustin logo" src="../assets/logo.svg" />
      <h2 class="text-3xl font-bold">Dein QR-Code</h2>
      <img class="w-30 inset-12" alt="vendor qr code" :src="qrcode" />
    </div>
    <br />
    <div class="my-16 container mt-8 pt-8 space-y-4">
      <h2 class="text-3xl font-bold">Dein Guthaben</h2>
      <div class="vendor-credit text-6xl font-bold">{{ credit }}€</div>
      <div class="vendor-number">Ausweisnummer: {{ idNumber }}</div>
      <div class="vendor-name">Name: Doris</div>
      <button class="bg-green-500 rounded-full py-3 px-6 text-white font-bold">Logout</button>
    </div>
  </div>
</template>

<script lang="ts">
import axios from 'axios'

export default {
  data() {
    return {
      credit: '',
      idNumber: '',
      qrcode: ''
    }
  },
  mounted() {
    axios
      .get('http://localhost:3000/api/vendor/')
      .then((response) => {
        const { credit, idnumber, qrcode } = response.data

        this.credit = credit
        this.idNumber = idnumber
        this.qrcode = 'http://localhost:3000' + qrcode
      })

      .catch((error) => {
        console.error('Fehler beim API-Aufruf:', error)
      })
  }
}
</script>

<style>
.vendor-overview {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  margin-bottom: 20rem;
  padding-bottom: 16rem;
}

.my-16 {
  margin-top: 30rem;
  margin-bottom: 4rem;
  padding-top: 30rem;
}

h2 {
  font-size: large;
}
</style>
