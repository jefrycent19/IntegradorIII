import api from './api';

export interface LoginResponse {
  token: string;
  user: { id: number; nombre: string; apellido: string; email: string; rol: string };
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/login', { email, password }),

  logout: () => api.post('/logout'),

  me: () => api.get('/me'),
};