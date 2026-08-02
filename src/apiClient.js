import axios from 'axios';

const API_BASE_URL = (process.env.REACT_APP_API_URL || 'https://dangoimport-server.onrender.com').replace(/\/$/, '');

const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  timeout: 10000,
});

export default apiClient;
