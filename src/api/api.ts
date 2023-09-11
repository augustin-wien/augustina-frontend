import axios from 'axios';
import keycloak from '@/keycloak/keycloak';


export const apiInstance = axios.create({
    withCredentials: true
})


apiInstance.interceptors.request.use(
    config => {
        if (keycloak && keycloak.keycloak.authenticated) {
            config.headers.Authorization = `Bearer ${keycloak.keycloak.token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export function getAuthHello() {
    return apiInstance.get('http://localhost:3000/api/auth/hello/');
}

