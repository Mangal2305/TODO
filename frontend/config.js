// The frontend is served by Nginx, which proxies /api/* to the backend
// container (see frontend/nginx.conf). No need to hardcode a host/port.
// Change this:
const API_URL = "http://localhost:5000/api";
