const RENDER_API_URL = 'https://dangoimport-server.onrender.com';
const LOCAL_API_URL = 'http://localhost:8000';

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || LOCAL_API_URL
).replace(/\/$/, '');

export default API_BASE_URL;
