import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../modelos/baseDatos';
import { ok, creado, error, noEncontrado } from '../utilidades/respuesta';
import { RequestAutenticada } from '../middleware/autenticacion';

export function listarEmpleados(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { busqueda, estado, departamentoId, pagina = '1', limite = '20' } = req.query;

  let sql = `
    SELECT e.*, d.nombre as departamento, c.nombre as cargo
    FROM empleados e
    LEFT JOIN departamentos d ON d.id = e.departamento_id
    LEFT JOIN cargos c ON c.id = e.cargo_id
    WHERE e.empresa_id = ?
  `;
  const params: unknown[] = [empresaId];

  if (busqueda) {
    sql += ` AND (e.nombre LIKE ? OR e.apellido LIKE ? OR e.cedula LIKE ? OR e.email LIKE ?)`;
    const b = `%${busqueda}%`;
    params.push(b, b, b, b);
  }
  if (estado) {
    sql += ` AND e.estado = ?`;
    params.push(estado);
  }
  if (departamentoId) {
    sql += ` AND e.departamento_id = ?`;
    params.push(departamentoId);
  }

  sql += ` ORDER BY e.apellido, e.nombre`;

  const total = (db.prepare(`SELECT COUNT(*) as n FROM (${sql})`).get(...params) as any).n;

  const pag = parseInt(pagina as string);
  const lim = parseInt(limite as string);
  sql += ` LIMIT ? OFFSET ?`;
  params.push(lim, (pag - 1) * lim);

  const empleados = db.prepare(sql).all(...params);

  ok(res, { empleados, total, pagina: pag, limite: lim });
}

export function obtenerEmpleado(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { id } = req.params;

  const empleado = db.prepare(`
    SELECT e.*, d.nombre as departamento, c.nombre as cargo
    FROM empleados e
    LEFT JOIN departamentos d ON d.id = e.departamento_id
    LEFT JOIN cargos c ON c.id = e.cargo_id
    WHERE e.id = ? AND e.empresa_id = ?
  `).get(id, empresaId) as any;

  if (!empleado) {
    noEncontrado(res, 'Empleado');
    return;
  }

  // Saldo vacaciones del año actual
  const anio = new Date().getFullYear();
  const saldoVac = db.prepare(`
    SELECT * FROM saldo_vacaciones WHERE empleado_id = ? AND anio = ?
  `).get(id, anio);

  // Últimos registros de asistencia
  const asistenciaReciente = db.prepare(`
    SELECT * FROM asistencia WHERE empleado_id = ? ORDER BY fecha DESC LIMIT 5
  `).all(id);

  ok(res, { ...empleado, saldoVacaciones: saldoVac, asistenciaReciente });
}

export function crearEmpleado(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const {
    nombre, apellido, cedula, email, telefono, fechaNacimiento,
    fechaIngreso, salario, tipoContrato, departamentoId, cargoId,
    direccion, ciudad, banco, numeroCuenta, notas, numeroEmpleado
  } = req.body;

  if (!nombre || !apellido || !fechaIngreso || !salario) {
    error(res, 'Nombre, apellido, fecha de ingreso y salario son requeridos');
    return;
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO empleados (
      id, empresa_id, nombre, apellido, cedula, email, telefono,
      fecha_nacimiento, fecha_ingreso, salario, tipo_contrato,
      departamento_id, cargo_id, direccion, ciudad, banco,
      numero_cuenta, notas, numero_empleado, estado
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'activo')
  `).run(
    id, empresaId, nombre, apellido, cedula || null, email || null,
    telefono || null, fechaNacimiento || null, fechaIngreso, salario,
    tipoContrato || 'indefinido', departamentoId || null, cargoId || null,
    direccion || null, ciudad || null, banco || null, numeroCuenta || null,
    notas || null, numeroEmpleado || null
  );

  // Crear saldo vacaciones para el año actual
  const anio = new Date().getFullYear();
  db.prepare(`
    INSERT OR IGNORE INTO saldo_vacaciones (id, empresa_id, empleado_id, anio, dias_totales, dias_usados, dias_pendientes)
    VALUES (?, ?, ?, ?, 15, 0, 15)
  `).run(uuidv4(), empresaId, id, anio);

  const empleado = db.prepare(`SELECT * FROM empleados WHERE id = ?`).get(id);
  creado(res, empleado, 'Empleado creado correctamente');
}

export function actualizarEmpleado(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { id } = req.params;

  const existe = db.prepare(`SELECT id FROM empleados WHERE id = ? AND empresa_id = ?`).get(id, empresaId);
  if (!existe) {
    noEncontrado(res, 'Empleado');
    return;
  }

  const {
    nombre, apellido, cedula, email, telefono, fechaNacimiento,
    fechaIngreso, salario, tipoContrato, departamentoId, cargoId,
    direccion, ciudad, banco, numeroCuenta, notas, estado, numeroEmpleado
  } = req.body;

  db.prepare(`
    UPDATE empleados SET
      nombre = COALESCE(?, nombre),
      apellido = COALESCE(?, apellido),
      cedula = COALESCE(?, cedula),
      email = COALESCE(?, email),
      telefono = COALESCE(?, telefono),
      fecha_nacimiento = COALESCE(?, fecha_nacimiento),
      fecha_ingreso = COALESCE(?, fecha_ingreso),
      salario = COALESCE(?, salario),
      tipo_contrato = COALESCE(?, tipo_contrato),
      departamento_id = COALESCE(?, departamento_id),
      cargo_id = COALESCE(?, cargo_id),
      direccion = COALESCE(?, direccion),
      ciudad = COALESCE(?, ciudad),
      banco = COALESCE(?, banco),
      numero_cuenta = COALESCE(?, numero_cuenta),
      notas = COALESCE(?, notas),
      estado = COALESCE(?, estado),
      numero_empleado = COALESCE(?, numero_empleado),
      actualizado_en = datetime('now')
    WHERE id = ? AND empresa_id = ?
  `).run(
    nombre, apellido, cedula, email, telefono, fechaNacimiento,
    fechaIngreso, salario, tipoContrato, departamentoId, cargoId,
    direccion, ciudad, banco, numeroCuenta, notas, estado, numeroEmpleado,
    id, empresaId
  );

  const empleado = db.prepare(`SELECT * FROM empleados WHERE id = ?`).get(id);
  ok(res, empleado, 'Empleado actualizado');
}

export function eliminarEmpleado(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { id } = req.params;

  const resultado = db.prepare(`
    UPDATE empleados SET estado = 'inactivo', fecha_egreso = date('now'), actualizado_en = datetime('now')
    WHERE id = ? AND empresa_id = ?
  `).run(id, empresaId);

  if (resultado.changes === 0) {
    noEncontrado(res, 'Empleado');
    return;
  }

  ok(res, null, 'Empleado desactivado correctamente');
}

export function listarDepartamentos(req: RequestAutenticada, res: Response): void {
  const departamentos = db.prepare(`SELECT * FROM departamentos WHERE empresa_id = ? ORDER BY nombre`).all(req.usuario!.empresaId);
  ok(res, departamentos);
}

export function listarCargos(req: RequestAutenticada, res: Response): void {
  const cargos = db.prepare(`SELECT * FROM cargos WHERE empresa_id = ? ORDER BY nombre`).all(req.usuario!.empresaId);
  ok(res, cargos);
}
