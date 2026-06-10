const RENDER_API_URL = 'https://dangoimport-server.onrender.com';

const API_BASE_URL = (
  process.env.REACT_APP_API_URL || RENDER_API_URL
).replace(/\/$/, '');

export default API_BASE_URL;
