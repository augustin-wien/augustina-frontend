import { defineStore } from "pinia";

export const AGBStore = defineStore('agb',{
    state: () =>{
        return{
            checked: false
        }
    }
})