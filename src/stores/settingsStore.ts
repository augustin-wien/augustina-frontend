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
    actions: {
        async fetchSettings() {
            try{ 
                const data = await agent.SettingsConfiguration.current()
                this.settings = []
                this.settings.push(data)
                console.log(this.settings[0])
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