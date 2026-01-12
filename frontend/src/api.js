import axios from 'axios';
import keycloak from './keycloak';

const API_GATEWAY = 'http://localhost:8888';

const api = axios.create({
  baseURL: API_GATEWAY,
  timeout: 10000,
});

// Add token to requests automatically
api.interceptors.request.use(
  (config) => {
    if (keycloak && keycloak.token) {
      config.headers.Authorization = `Bearer ${keycloak.token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && keycloak) {
      keycloak.logout();
    }
    return Promise.reject(error);
  }
);

export default api;