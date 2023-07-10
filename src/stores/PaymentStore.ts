import { defineStore } from "pinia";

export const Payment = defineStore('payment',{
    state: () =>{
        return{
            agbChecked: false
        }
    }
})