import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../modelos/baseDatos';
import { ok, creado, error, noEncontrado } from '../utilidades/respuesta';
import { RequestAutenticada } from '../middleware/autenticacion';

function calcularDiasHabiles(fechaInicio: string, fechaFin: string): number {
  const inicio = new Date(fechaInicio);
  const fin = new Date(fechaFin);
  let dias = 0;
  const actual = new Date(inicio);
  while (actual <= fin) {
    const diaSemana = actual.getDay();
    if (diaSemana !== 0 && diaSemana !== 6) dias++;
    actual.setDate(actual.getDate() + 1);
  }
  return dias;
}

export function listarVacaciones(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { empleadoId, estado, anio } = req.query;

  let sql = `
    SELECT v.*, e.nombre || ' ' || e.apellido as empleado_nombre, e.numero_empleado
    FROM vacaciones v
    JOIN empleados e ON e.id = v.empleado_id
    WHERE v.empresa_id = ?
  `;
  const params: unknown[] = [empresaId];

  if (empleadoId) { sql += ` AND v.empleado_id = ?`; params.push(empleadoId); }
  if (estado) { sql += ` AND v.estado = ?`; params.push(estado); }
  if (anio) { sql += ` AND strftime('%Y', v.fecha_inicio) = ?`; params.push(anio as string); }

  sql += ` ORDER BY v.creado_en DESC`;

  const solicitudes = db.prepare(sql).all(...params);
  ok(res, solicitudes);
}

export function crearSolicitud(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { empleadoId, fechaInicio, fechaFin, tipo, motivo } = req.body;

  if (!empleadoId || !fechaInicio || !fechaFin) {
    error(res, 'Empleado, fecha inicio y fecha fin son requeridos');
    return;
  }

  const dias = calcularDiasHabiles(fechaInicio, fechaFin);
  if (dias <= 0) {
    error(res, 'Las fechas no son válidas');
    return;
  }

  // Verificar saldo disponible
  const anio = new Date(fechaInicio).getFullYear();
  const saldo = db.prepare(`
    SELECT * FROM saldo_vacaciones WHERE empleado_id = ? AND anio = ?
  `).get(empleadoId, anio) as any;

  if (!saldo) {
    error(res, 'No hay saldo de vacaciones configurado para este empleado');
    return;
  }

  if (saldo.dias_pendientes < dias && tipo === 'vacaciones') {
    error(res, `Saldo insuficiente. Disponible: ${saldo.dias_pendientes} días`);
    return;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO vacaciones (id, empresa_id, empleado_id, fecha_inicio, fecha_fin, dias_solicitados, tipo, estado, motivo)
    VALUES (?, ?, ?, ?, ?, ?, ?, 'pendiente', ?)
  `).run(id, empresaId, empleadoId, fechaInicio, fechaFin, dias, tipo || 'vacaciones', motivo || null);

  const solicitud = db.prepare(`SELECT * FROM vacaciones WHERE id = ?`).get(id);
  creado(res, solicitud, 'Solicitud creada correctamente');
}

export function aprobarRechazarSolicitud(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { id } = req.params;
  const { accion, notas } = req.body;

  if (!['aprobar', 'rechazar'].includes(accion)) {
    error(res, 'Acción inválida. Use aprobar o rechazar');
    return;
  }

  const solicitud = db.prepare(`
    SELECT * FROM vacaciones WHERE id = ? AND empresa_id = ?
  `).get(id, empresaId) as any;

  if (!solicitud) {
    noEncontrado(res, 'Solicitud');
    return;
  }

  if (solicitud.estado !== 'pendiente') {
    error(res, 'Solo se pueden gestionar solicitudes pendientes');
    return;
  }

  const nuevoEstado = accion === 'aprobar' ? 'aprobado' : 'rechazado';

  db.prepare(`
    UPDATE vacaciones SET estado = ?, aprobado_por = ?, aprobado_en = datetime('now'), notas = ?
    WHERE id = ?
  `).run(nuevoEstado, req.usuario!.usuarioId, notas || null, id);

  // Si se aprueba, descontar del saldo
  if (accion === 'aprobar' && solicitud.tipo === 'vacaciones') {
    const anio = new Date(solicitud.fecha_inicio).getFullYear();
    db.prepare(`
      UPDATE saldo_vacaciones SET
        dias_usados = dias_usados + ?,
        dias_pendientes = dias_pendientes - ?,
        actualizado_en = datetime('now')
      WHERE empleado_id = ? AND anio = ?
    `).run(solicitud.dias_solicitados, solicitud.dias_solicitados, solicitud.empleado_id, anio);
  }

  const actualizada = db.prepare(`SELECT * FROM vacaciones WHERE id = ?`).get(id);
  ok(res, actualizada, `Solicitud ${nuevoEstado} correctamente`);
}

export function saldoVacaciones(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { empleadoId } = req.params;
  const anio = req.query.anio || new Date().getFullYear();

  const saldo = db.prepare(`
    SELECT sv.*, e.nombre || ' ' || e.apellido as empleado_nombre
    FROM saldo_vacaciones sv
    JOIN empleados e ON e.id = sv.empleado_id
    WHERE sv.empleado_id = ? AND sv.anio = ? AND sv.empresa_id = ?
  `).get(empleadoId, anio, empresaId);

  ok(res, saldo);
}

export function obtenerSolicitud(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { id } = req.params;

  const solicitud = db.prepare(`
    SELECT v.*, e.nombre || ' ' || e.apellido as empleado_nombre
    FROM vacaciones v
    JOIN empleados e ON e.id = v.empleado_id
    WHERE v.id = ? AND v.empresa_id = ?
  `).get(id, empresaId);

  if (!solicitud) {
    noEncontrado(res, 'Solicitud');
    return;
  }

  ok(res, solicitud);
}
