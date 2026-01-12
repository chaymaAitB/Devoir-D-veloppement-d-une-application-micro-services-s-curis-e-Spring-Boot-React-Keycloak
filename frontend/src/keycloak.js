import Keycloak from 'keycloak-js';

const keycloakConfig = {
  url: 'http://localhost:8081',
  realm: 'microservices-realm',
  clientId: 'frontend-client'
};

const keycloak = new Keycloak(keycloakConfig);

export default keycloak;