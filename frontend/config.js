// The frontend is served by Nginx, which proxies /api/* to the backend
// container (see frontend/nginx.conf). No need to hardcode a host/port.
<<<<<<< HEAD
// Change this:
const API_URL = "http://localhost:5000/api";

// Change it to your live backend domain:
const API_URL = 'https://your-backend-url.onrender.com/api'; // Keep only this one

// Export it so other files can use it without redeclaring it
export { API_URL };
=======
const API_BASE = '/api';
const API_URL = "https://your-render-url-here.onrender.com/api"; 
export { API_URL };
>>>>>>> bb20785 (Update frontend API URL to live Render backend)
