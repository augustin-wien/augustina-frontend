import { defineStore } from 'pinia'
import type { Settings } from '@/models/settings'
import agent from '@/api/agent'



export const settingsStore = defineStore('settings',{
    state: () =>{
        return{
            settings: [] as Settings[],
            loaded: false
        }
    },

    getters: {
        getSettings(state){
            return state.settings
          }
      },

    actions: {
        async fetchSettings() {
            try{ 
                const data = await agent.SettingsConfiguration.current()
                this.settings.push(data)
                console.log(this.settings)
                console.log('Settings fetched from database')
                this.loaded = true
            }
            catch (error) {
                alert(error);
                console.log(error);
            }
        }
    }
}

)