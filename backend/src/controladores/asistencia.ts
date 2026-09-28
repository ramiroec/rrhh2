import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../modelos/baseDatos';
import { ok, creado, error, noEncontrado } from '../utilidades/respuesta';
import { RequestAutenticada } from '../middleware/autenticacion';

export function listarAsistencia(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { empleadoId, fechaDesde, fechaHasta, estado, pagina = '1', limite = '30' } = req.query;

  let sql = `
    SELECT a.*, e.nombre || ' ' || e.apellido as empleado_nombre, e.numero_empleado
    FROM asistencia a
    JOIN empleados e ON e.id = a.empleado_id
    WHERE a.empresa_id = ?
  `;
  const params: unknown[] = [empresaId];

  if (empleadoId) { sql += ` AND a.empleado_id = ?`; params.push(empleadoId); }
  if (fechaDesde) { sql += ` AND a.fecha >= ?`; params.push(fechaDesde); }
  if (fechaHasta) { sql += ` AND a.fecha <= ?`; params.push(fechaHasta); }
  if (estado) { sql += ` AND a.estado = ?`; params.push(estado); }

  sql += ` ORDER BY a.fecha DESC, e.apellido`;

  const total = (db.prepare(`SELECT COUNT(*) as n FROM (${sql})`).get(...params) as any).n;

  const pag = parseInt(pagina as string);
  const lim = parseInt(limite as string);
  sql += ` LIMIT ? OFFSET ?`;
  params.push(lim, (pag - 1) * lim);

  const registros = db.prepare(sql).all(...params);
  ok(res, { registros, total, pagina: pag, limite: lim });
}

export function registrarAsistencia(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { empleadoId, fecha, horaEntrada, horaSalida, estado, notas } = req.body;

  if (!empleadoId || !fecha) {
    error(res, 'Empleado y fecha son requeridos');
    return;
  }

  // Calcular horas trabajadas
  let horasTrabajadas = 0;
  let horasExtra = 0;
  let tardanzaMinutos = 0;

  if (horaEntrada && horaSalida) {
    const entrada = new Date(`2000-01-01T${horaEntrada}`);
    const salida = new Date(`2000-01-01T${horaSalida}`);
    horasTrabajadas = Math.max(0, (salida.getTime() - entrada.getTime()) / 3600000);
    horasExtra = Math.max(0, horasTrabajadas - 8);

    // Tardanza si entra después de las 08:05
    const horaLimite = new Date('2000-01-01T08:05:00');
    if (entrada > horaLimite) {
      tardanzaMinutos = Math.floor((entrada.getTime() - horaLimite.getTime()) / 60000);
    }
  }

  // Verificar si ya existe registro para ese día
  const existente = db.prepare(`
    SELECT id FROM asistencia WHERE empleado_id = ? AND fecha = ?
  `).get(empleadoId, fecha) as any;

  if (existente) {
    db.prepare(`
      UPDATE asistencia SET
        hora_entrada = COALESCE(?, hora_entrada),
        hora_salida = COALESCE(?, hora_salida),
        horas_trabajadas = ?,
        horas_extra = ?,
        tardanza_minutos = ?,
        estado = COALESCE(?, estado),
        notas = COALESCE(?, notas)
      WHERE id = ?
    `).run(horaEntrada, horaSalida, horasTrabajadas, horasExtra, tardanzaMinutos, estado, notas, existente.id);

    const actualizado = db.prepare(`SELECT * FROM asistencia WHERE id = ?`).get(existente.id);
    ok(res, actualizado, 'Asistencia actualizada');
    return;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO asistencia (id, empresa_id, empleado_id, fecha, hora_entrada, hora_salida,
      horas_trabajadas, horas_extra, tardanza_minutos, estado, notas)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `).run(id, empresaId, empleadoId, fecha, horaEntrada || null, horaSalida || null,
    horasTrabajadas, horasExtra, tardanzaMinutos, estado || 'presente', notas || null);

  const registro = db.prepare(`SELECT * FROM asistencia WHERE id = ?`).get(id);
  creado(res, registro, 'Asistencia registrada');
}

export function actualizarAsistencia(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { id } = req.params;
  const { horaEntrada, horaSalida, estado, notas } = req.body;

  let horasTrabajadas = 0;
  let horasExtra = 0;
  let tardanzaMinutos = 0;

  if (horaEntrada && horaSalida) {
    const entrada = new Date(`2000-01-01T${horaEntrada}`);
    const salida = new Date(`2000-01-01T${horaSalida}`);
    horasTrabajadas = Math.max(0, (salida.getTime() - entrada.getTime()) / 3600000);
    horasExtra = Math.max(0, horasTrabajadas - 8);
    const horaLimite = new Date('2000-01-01T08:05:00');
    if (entrada > horaLimite) {
      tardanzaMinutos = Math.floor((entrada.getTime() - horaLimite.getTime()) / 60000);
    }
  }

  const resultado = db.prepare(`
    UPDATE asistencia SET
      hora_entrada = COALESCE(?, hora_entrada),
      hora_salida = COALESCE(?, hora_salida),
      horas_trabajadas = ?,
      horas_extra = ?,
      tardanza_minutos = ?,
      estado = COALESCE(?, estado),
      notas = COALESCE(?, notas)
    WHERE id = ? AND empresa_id = ?
  `).run(horaEntrada, horaSalida, horasTrabajadas, horasExtra, tardanzaMinutos, estado, notas, id, empresaId);

  if (resultado.changes === 0) {
    noEncontrado(res, 'Registro de asistencia');
    return;
  }

  const registro = db.prepare(`SELECT * FROM asistencia WHERE id = ?`).get(id);
  ok(res, registro, 'Asistencia actualizada');
}

export function resumenAsistencia(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { mes, anio } = req.query;

  const fechaDesde = `${anio || new Date().getFullYear()}-${String(mes || new Date().getMonth() + 1).padStart(2, '0')}-01`;
  const fechaHasta = `${anio || new Date().getFullYear()}-${String(mes || new Date().getMonth() + 1).padStart(2, '0')}-31`;

  const resumen = db.prepare(`
    SELECT
      COUNT(*) as total_registros,
      SUM(CASE WHEN estado = 'presente' THEN 1 ELSE 0 END) as presentes,
      SUM(CASE WHEN estado = 'ausente' THEN 1 ELSE 0 END) as ausentes,
      SUM(CASE WHEN estado = 'tardanza' THEN 1 ELSE 0 END) as tardanzas,
      SUM(CASE WHEN estado = 'medio_dia' THEN 1 ELSE 0 END) as medio_dia,
      SUM(horas_trabajadas) as total_horas,
      SUM(horas_extra) as total_horas_extra,
      SUM(tardanza_minutos) as total_minutos_tardanza
    FROM asistencia
    WHERE empresa_id = ? AND fecha BETWEEN ? AND ?
  `).get(empresaId, fechaDesde, fechaHasta);

  ok(res, resumen);
}
