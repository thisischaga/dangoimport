const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:8000'
  : 'https://dangoimport-server.onrender.com';

console.log('🌐 Dango API Base URL:', API_BASE_URL);

export default API_BASE_URL;
