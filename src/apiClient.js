import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://dangoimport-server.onrender.com').replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 60000,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('dangoToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
