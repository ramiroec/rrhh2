import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { inicializarBD } from './modelos/baseDatos';

dotenv.config();

import rutasAuth from './rutas/autenticacion';
import rutasEmpleados from './rutas/empleados';
import rutasAsistencia from './rutas/asistencia';
import rutasVacaciones from './rutas/vacaciones';
import rutasLiquidaciones from './rutas/liquidaciones';
import rutasRecibos from './rutas/recibos';
import rutasDashboard from './rutas/dashboard';

const app = express();
const PUERTO = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:5174', 'http://localhost:3000'],
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Inicializar base de datos
inicializarBD();

// Rutas
app.use('/api/auth', rutasAuth);
app.use('/api/empleados', rutasEmpleados);
app.use('/api/asistencia', rutasAsistencia);
app.use('/api/vacaciones', rutasVacaciones);
app.use('/api/liquidaciones', rutasLiquidaciones);
app.use('/api/recibos', rutasRecibos);
app.use('/api/dashboard', rutasDashboard);

// Health check
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, servicio: 'TEKI RRHH API', version: '1.0.0' });
});

// 404
app.use((_req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Error interno del servidor' });
});

app.listen(PUERTO, () => {
  console.log(`🚀 TEKI RRHH API corriendo en http://localhost:${PUERTO}`);
});

export default app;
