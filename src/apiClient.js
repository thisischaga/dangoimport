import axios from 'axios';
import API_BASE_URL from './apiConfig';

const apiClient = axios.create({
  baseURL: 'http://localhost:8000/api',
  timeout: 60000,
});

const AUTH_PATHS = ['/auth/login', '/auth/signup', '/auth/google', '/auth/send-otp', '/auth/oauth-exchange'];

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dangoToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = String(error.config?.url || '');
    const isAuthRequest = AUTH_PATHS.some((path) => requestUrl.includes(path));

    if (status === 401 && !isAuthRequest) {
      localStorage.removeItem('dangoToken');
      localStorage.removeItem('dangoUser');
      window.dispatchEvent(new Event('authChange'));
      if (!window.location.pathname.startsWith('/login') && !window.location.pathname.startsWith('/register')) {
        window.location.href = '/login?session=expired';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
