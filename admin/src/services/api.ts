import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api/v1',
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