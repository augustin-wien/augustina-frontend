import Keycloak from "keycloak-js";

const keycloak = new Keycloak({
    url: import.meta.env.VITE_KEYCLOAK_URL as string,
    realm: 'augustin',
    clientId: 'frontend'
});


export default keycloak;