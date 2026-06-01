import axios from 'axios';

// URL del backend — configurable por entorno.
// En desarrollo usa el Laravel local; en producción (build) usa VITE_API_URL.
const baseURL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status;

    // Token expirado o inválido — redirigir al login
    if (status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }

    // Sin permisos — loguear pero NO bloquear la app
    // Cada página maneja el error con try/catch y muestra lista vacía
    if (status === 403) {
      console.warn(`[API 403] Sin permiso: ${err.config?.url}`);
    }

    return Promise.reject(err);
  }
);

export default api;