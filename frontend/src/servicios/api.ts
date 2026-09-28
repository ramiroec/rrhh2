import axios from 'axios';

const api = axios.create({
//  baseURL: 'http://localhost:3001/api',
  baseURL: 'https://vps-aff6ee56.vps.ovh.ca/rrhh2-api/api',
  headers: { 'Content-Type': 'application/json' },
});

// Interceptor: adjuntar token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('teki_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Interceptor: manejar 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('teki_token');
      localStorage.removeItem('teki_usuario');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  }
);

export default api;

// ── Servicios específicos ──────────────────

export const servicioAuth = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }).then((r) => r.data.datos),
  perfil: () =>
    api.get('/auth/perfil').then((r) => r.data.datos),
};

export const servicioEmpleados = {
  listar: (params?: Record<string, unknown>) =>
    api.get('/empleados', { params }).then((r) => r.data.datos),
  obtener: (id: string) =>
    api.get(`/empleados/${id}`).then((r) => r.data.datos),
  crear: (datos: Record<string, unknown>) =>
    api.post('/empleados', datos).then((r) => r.data.datos),
  actualizar: (id: string, datos: Record<string, unknown>) =>
    api.put(`/empleados/${id}`, datos).then((r) => r.data.datos),
  eliminar: (id: string) =>
    api.delete(`/empleados/${id}`).then((r) => r.data),
  departamentos: () =>
    api.get('/empleados/departamentos').then((r) => r.data.datos),
  cargos: () =>
    api.get('/empleados/cargos').then((r) => r.data.datos),
};

export const servicioAsistencia = {
  listar: (params?: Record<string, unknown>) =>
    api.get('/asistencia', { params }).then((r) => r.data.datos),
  registrar: (datos: Record<string, unknown>) =>
    api.post('/asistencia', datos).then((r) => r.data.datos),
  actualizar: (id: string, datos: Record<string, unknown>) =>
    api.put(`/asistencia/${id}`, datos).then((r) => r.data.datos),
  resumen: (params?: Record<string, unknown>) =>
    api.get('/asistencia/resumen', { params }).then((r) => r.data.datos),
};

export const servicioVacaciones = {
  listar: (params?: Record<string, unknown>) =>
    api.get('/vacaciones', { params }).then((r) => r.data.datos),
  obtener: (id: string) =>
    api.get(`/vacaciones/${id}`).then((r) => r.data.datos),
  crear: (datos: Record<string, unknown>) =>
    api.post('/vacaciones', datos).then((r) => r.data.datos),
  gestion: (id: string, accion: 'aprobar' | 'rechazar', notas?: string) =>
    api.post(`/vacaciones/${id}/gestion`, { accion, notas }).then((r) => r.data),
  saldo: (empleadoId: string, anio?: number) =>
    api.get(`/vacaciones/saldo/${empleadoId}`, { params: { anio } }).then((r) => r.data.datos),
};

export const servicioLiquidaciones = {
  listar: (params?: Record<string, unknown>) =>
    api.get('/liquidaciones', { params }).then((r) => r.data.datos),
  obtener: (id: string) =>
    api.get(`/liquidaciones/${id}`).then((r) => r.data.datos),
  preview: (params: Record<string, unknown>) =>
    api.get('/liquidaciones/preview', { params }).then((r) => r.data.datos),
  generar: (datos: Record<string, unknown>) =>
    api.post('/liquidaciones', datos).then((r) => r.data.datos),
  aprobar: (id: string) =>
    api.post(`/liquidaciones/${id}/aprobar`).then((r) => r.data),
};

export const servicioRecibos = {
  listar: (params?: Record<string, unknown>) =>
    api.get('/recibos', { params }).then((r) => r.data.datos),
  obtener: (id: string) =>
    api.get(`/recibos/${id}`).then((r) => r.data.datos),
};

export const servicioDashboard = {
  resumen: () =>
    api.get('/dashboard').then((r) => r.data.datos),
};
