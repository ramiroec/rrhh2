import { Response } from 'express';
import db from '../modelos/baseDatos';
import { ok } from '../utilidades/respuesta';
import { RequestAutenticada } from '../middleware/autenticacion';

export function obtenerDashboard(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const hoy = new Date().toISOString().split('T')[0];
  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1;
  const inicioMes = `${anioActual}-${String(mesActual).padStart(2, '0')}-01`;

  // Totales de empleados
  const empleados = db.prepare(`
    SELECT
      COUNT(*) as total,
      SUM(CASE WHEN estado = 'activo' THEN 1 ELSE 0 END) as activos,
      SUM(CASE WHEN estado = 'inactivo' THEN 1 ELSE 0 END) as inactivos,
      SUM(CASE WHEN fecha_ingreso >= ? THEN 1 ELSE 0 END) as nuevos_mes
    FROM empleados WHERE empresa_id = ?
  `).get(inicioMes, empresaId);

  // Asistencia de hoy
  const asistenciaHoy = db.prepare(`
    SELECT
      COUNT(*) as total_registros,
      SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) as presentes,
      SUM(CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END) as ausentes,
      SUM(CASE WHEN estado = 'tardanza' THEN 1 ELSE 0 END) as tardanzas
    FROM asistencia WHERE empresa_id = ? AND fecha = ?
  `).get(empresaId, hoy);

  // Asistencia del mes
  const asistenciaMes = db.prepare(`
    SELECT
      SUM(horas_trabajadas) as total_horas,
      SUM(horas_extra) as total_horas_extra,
      SUM(CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END) as total_ausencias
    FROM asistencia WHERE empresa_id = ? AND fecha BETWEEN ? AND ?
  `).get(empresaId, inicioMes, hoy);

  // Vacaciones pendientes
  const vacacionesPendientes = db.prepare(`
    SELECT COUNT(*) as total FROM vacaciones WHERE empresa_id = ? AND estado = 'pendiente'
  `).get(empresaId);

  // Vacaciones activas hoy
  const vacacionesHoy = db.prepare(`
    SELECT COUNT(*) as total FROM vacaciones
    WHERE empresa_id = ? AND estado = 'aprobado' AND fecha_inicio <= ? AND fecha_fin >= ?
  `).get(empresaId, hoy, hoy);

  // Solicitudes de vacaciones recientes
  const solicitudesRecientes = db.prepare(`
    SELECT v.id, v.fecha_inicio, v.fecha_fin, v.dias_solicitados, v.estado, v.tipo,
           e.nombre || ' ' || e.apellido as empleado_nombre
    FROM vacaciones v
    JOIN empleados e ON e.id = v.empleado_id
    WHERE v.empresa_id = ? AND v.estado = 'pendiente'
    ORDER BY v.creado_en DESC LIMIT 5
  `).all(empresaId);

  // Próximos cumpleaños (próximos 30 días)
  const cumpleanos = db.prepare(`
    SELECT id, nombre, apellido, fecha_nacimiento,
           strftime('%m-%d', fecha_nacimiento) as mes_dia
    FROM empleados
    WHERE empresa_id = ? AND estado = 'activo' AND fecha_nacimiento IS NOT NULL
    ORDER BY strftime('%m-%d', fecha_nacimiento)
    LIMIT 5
  `).all(empresaId);

  // Distribución por departamento
  const porDepartamento = db.prepare(`
    SELECT d.nombre, COUNT(e.id) as cantidad
    FROM empleados e
    JOIN departamentos d ON d.id = e.departamento_id
    WHERE e.empresa_id = ? AND e.estado = 'activo'
    GROUP BY d.id, d.nombre
    ORDER BY cantidad DESC
    LIMIT 6
  `).all(empresaId);

  // Asistencia últimos 7 días
  const asistenciaUltimaSemana = db.prepare(`
    SELECT fecha,
      SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) as presentes,
      SUM(CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END) as ausentes,
      SUM(CASE WHEN estado = 'tardanza' THEN 1 ELSE 0 END) as tardanzas
    FROM asistencia
    WHERE empresa_id = ? AND fecha >= date('now', '-6 days')
    GROUP BY fecha ORDER BY fecha
  `).all(empresaId);

  // Última liquidación
  const ultimaLiquidacion = db.prepare(`
    SELECT periodo, COUNT(*) as total_empleados,
           SUM(salario_neto) as total_neto, estado
    FROM liquidaciones WHERE empresa_id = ?
    GROUP BY periodo ORDER BY periodo DESC LIMIT 1
  `).get(empresaId);

  ok(res, {
    empleados,
    asistenciaHoy,
    asistenciaMes,
    vacacionesPendientes,
    vacacionesHoy,
    solicitudesRecientes,
    cumpleanos,
    porDepartamento,
    asistenciaUltimaSemana,
    ultimaLiquidacion,
  });
}
