import axios from 'axios';
import keycloak from '@/keycloak/keycloak';


const instance = axios.create({
    withCredentials: true
})


instance.interceptors.request.use(
    config => {
        if (keycloak.authenticated) {
            config.headers.Authorization = `Bearer ${keycloak.token}`;
        }
        return config;
    },
    error => {
        return Promise.reject(error);
    }
);

export function getAuthHello() {
    return instance.get('http://localhost:3000/api/auth/hello/');
}

