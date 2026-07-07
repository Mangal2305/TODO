// The frontend is served by Nginx, which proxies /api/* to the backend
// container (see frontend/nginx.conf). No need to hardcode a host/port.
const API_BASE = '/api';
const API_URL = "https://your-render-url-here.onrender.com/api"; 
export { API_URL };