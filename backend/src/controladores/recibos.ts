import { Response } from 'express';
import db from '../modelos/baseDatos';
import { ok, noEncontrado } from '../utilidades/respuesta';
import { RequestAutenticada } from '../middleware/autenticacion';

export function listarRecibos(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { empleadoId, anio, periodo } = req.query;

  let sql = `
    SELECT r.*, e.nombre || ' ' || e.apellido as empleado_nombre,
           e.numero_empleado, e.cedula as empleado_cedula,
           l.salario_neto, l.salario_bruto, l.salario_base
    FROM recibos r
    JOIN empleados e ON e.id = r.empleado_id
    JOIN liquidaciones l ON l.id = r.liquidacion_id
    WHERE r.empresa_id = ?
  `;
  const params: unknown[] = [empresaId];

  if (empleadoId) { sql += ` AND r.empleado_id = ?`; params.push(empleadoId); }
  if (periodo) { sql += ` AND r.periodo = ?`; params.push(periodo); }
  if (anio) { sql += ` AND strftime('%Y', r.emitido_en) = ?`; params.push(anio); }

  sql += ` ORDER BY r.emitido_en DESC`;

  const recibos = db.prepare(sql).all(...params);
  ok(res, recibos);
}

export function obtenerRecibo(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { id } = req.params;

  const recibo = db.prepare(`
    SELECT r.*,
           e.nombre || ' ' || e.apellido as empleado_nombre,
           e.cedula as empleado_cedula, e.numero_empleado,
           e.fecha_ingreso, e.banco, e.numero_cuenta,
           c.nombre as cargo_nombre, d.nombre as departamento_nombre,
           emp.nombre as empresa_nombre, emp.rut as empresa_rut,
           l.salario_base, l.salario_bruto, l.salario_neto,
           l.horas_extra_monto, l.bonos, l.descuentos,
           l.ausencias_monto, l.ips_empleado, l.ips_patronal, l.detalles
    FROM recibos r
    JOIN empleados e ON e.id = r.empleado_id
    LEFT JOIN cargos c ON c.id = e.cargo_id
    LEFT JOIN departamentos d ON d.id = e.departamento_id
    JOIN empresas emp ON emp.id = r.empresa_id
    JOIN liquidaciones l ON l.id = r.liquidacion_id
    WHERE r.id = ? AND r.empresa_id = ?
  `).get(id, empresaId) as any;

  if (!recibo) {
    noEncontrado(res, 'Recibo');
    return;
  }

  if (recibo.detalles) {
    try { recibo.detalles = JSON.parse(recibo.detalles); } catch { /* noop */ }
  }

  ok(res, recibo);
}
