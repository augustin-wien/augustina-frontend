import { defineStore } from 'pinia'

export interface KeycloakState {
    authenticated: boolean
    username: string
}

export const useKeycloakStore = defineStore('keycloakStore', {
    state: (): KeycloakState => {
        return {
            authenticated: false,
            username: ''
        }
    },
    getters: {
        isAuthenticated(state: any) {
            return state.authenticated
        },
        getUsername(state: any) {
            return state.username
        }
    },

    actions: {
        setAuthenticated(authenticated: boolean) {
            this.authenticated = authenticated
        },
        setUsername(username: string) {
            this.username = username
        }

    }
})
