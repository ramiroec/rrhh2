import { Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import db from '../modelos/baseDatos';
import { ok, creado, error, noEncontrado } from '../utilidades/respuesta';
import { RequestAutenticada } from '../middleware/autenticacion';

// Reglas de liquidación Paraguay (IPS)
// IPS empleado: 9% del salario
// IPS patronal: 16.5% del salario
// Horas extra diurnas: 50% adicional
// Horas extra nocturnas: 100% adicional

const TASA_IPS_EMPLEADO = 0.09;
const TASA_IPS_PATRONAL = 0.165;
const DIAS_LABORALES_MES = 26;

interface DetalleConcepto {
  concepto: string;
  tipo: 'ingreso' | 'descuento';
  monto: number;
}

function calcularLiquidacion(empleadoId: string, anio: number, mes: number, empresaId: string) {
  const empleado = db.prepare(`SELECT * FROM empleados WHERE id = ? AND empresa_id = ?`).get(empleadoId, empresaId) as any;
  if (!empleado) return null;

  const periodo = `${anio}-${String(mes).padStart(2, '0')}`;
  const fechaDesde = `${periodo}-01`;
  const fechaHasta = `${periodo}-31`;

  // Asistencia del período
  const asistencia = db.prepare(`
    SELECT
      SUM(horas_trabajadas) as total_horas,
      SUM(horas_extra) as total_horas_extra,
      COUNT(CASE WHEN estado = 'ausente' THEN 1 END) as dias_ausentes,
      COUNT(CASE WHEN estado = 'presente' OR estado = 'tardanza' THEN 1 END) as dias_presentes
    FROM asistencia
    WHERE empleado_id = ? AND fecha BETWEEN ? AND ?
  `).get(empleadoId, fechaDesde, fechaHasta) as any;

  const salarioBase = empleado.salario;
  const valorDia = salarioBase / DIAS_LABORALES_MES;
  const valorHora = salarioBase / (DIAS_LABORALES_MES * 8);

  const diasAusentes = asistencia?.dias_ausentes || 0;
  const horasExtra = asistencia?.total_horas_extra || 0;

  const ausenciasMonto = diasAusentes * valorDia;
  const horasExtraMonto = horasExtra * valorHora * 1.5; // 50% adicional

  const salarioBruto = salarioBase + horasExtraMonto - ausenciasMonto;
  const ipsEmpleado = salarioBruto * TASA_IPS_EMPLEADO;
  const ipsPatronal = salarioBruto * TASA_IPS_PATRONAL;
  const salarioNeto = salarioBruto - ipsEmpleado;

  const detalles: DetalleConcepto[] = [
    { concepto: 'Salario base', tipo: 'ingreso', monto: salarioBase },
    { concepto: `Horas extra (${horasExtra.toFixed(1)}h)`, tipo: 'ingreso', monto: horasExtraMonto },
    { concepto: `Ausencias (${diasAusentes} días)`, tipo: 'descuento', monto: ausenciasMonto },
    { concepto: `IPS empleado (${(TASA_IPS_EMPLEADO * 100).toFixed(1)}%)`, tipo: 'descuento', monto: ipsEmpleado },
  ];

  return {
    empleadoId,
    empleadoNombre: `${empleado.nombre} ${empleado.apellido}`,
    empleadoCedula: empleado.cedula,
    empleadoCargo: empleado.cargo_id,
    periodo,
    anio,
    mes,
    salarioBase,
    horasExtraMonto,
    bonos: 0,
    descuentos: 0,
    ausenciasMonto,
    ipsEmpleado,
    ipsPatronal,
    salarioBruto,
    salarioNeto,
    detalles,
    diasAusentes,
    horasExtra,
  };
}

export function listarLiquidaciones(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { empleadoId, anio, mes, estado } = req.query;

  let sql = `
    SELECT l.*, e.nombre || ' ' || e.apellido as empleado_nombre, e.numero_empleado
    FROM liquidaciones l
    JOIN empleados e ON e.id = l.empleado_id
    WHERE l.empresa_id = ?
  `;
  const params: unknown[] = [empresaId];

  if (empleadoId) { sql += ` AND l.empleado_id = ?`; params.push(empleadoId); }
  if (anio) { sql += ` AND l.anio = ?`; params.push(anio); }
  if (mes) { sql += ` AND l.mes = ?`; params.push(mes); }
  if (estado) { sql += ` AND l.estado = ?`; params.push(estado); }

  sql += ` ORDER BY l.anio DESC, l.mes DESC, e.apellido`;

  const liquidaciones = db.prepare(sql).all(...params);
  ok(res, liquidaciones);
}

export function generarLiquidacion(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { empleadoId, anio, mes, bonos = 0, descuentos = 0 } = req.body;

  if (!empleadoId || !anio || !mes) {
    error(res, 'Empleado, año y mes son requeridos');
    return;
  }

  // Verificar si ya existe
  const existente = db.prepare(`
    SELECT id FROM liquidaciones WHERE empleado_id = ? AND anio = ? AND mes = ?
  `).get(empleadoId, anio, mes) as any;

  if (existente) {
    error(res, 'Ya existe una liquidación para este empleado en ese período');
    return;
  }

  const datos = calcularLiquidacion(empleadoId, parseInt(anio), parseInt(mes), empresaId);
  if (!datos) {
    noEncontrado(res, 'Empleado');
    return;
  }

  // Ajustar con bonos y descuentos adicionales
  const bonosMonto = parseFloat(bonos) || 0;
  const descuentosMonto = parseFloat(descuentos) || 0;
  const salarioBrutoFinal = datos.salarioBruto + bonosMonto - descuentosMonto;
  const ipsEmpleado = salarioBrutoFinal * TASA_IPS_EMPLEADO;
  const ipsPatronal = salarioBrutoFinal * TASA_IPS_PATRONAL;
  const salarioNeto = salarioBrutoFinal - ipsEmpleado;

  if (bonosMonto > 0) {
    datos.detalles.push({ concepto: 'Bonos adicionales', tipo: 'ingreso', monto: bonosMonto });
  }
  if (descuentosMonto > 0) {
    datos.detalles.push({ concepto: 'Descuentos adicionales', tipo: 'descuento', monto: descuentosMonto });
  }

  const id = uuidv4();
  db.prepare(`
    INSERT INTO liquidaciones (
      id, empresa_id, empleado_id, periodo, anio, mes,
      salario_base, horas_extra_monto, bonos, descuentos, ausencias_monto,
      ips_empleado, ips_patronal, salario_bruto, salario_neto, estado, detalles
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'borrador', ?)
  `).run(
    id, empresaId, empleadoId, datos.periodo, anio, mes,
    datos.salarioBase, datos.horasExtraMonto, bonosMonto, descuentosMonto,
    datos.ausenciasMonto, ipsEmpleado, ipsPatronal, salarioBrutoFinal, salarioNeto,
    JSON.stringify(datos.detalles)
  );

  const liquidacion = db.prepare(`SELECT * FROM liquidaciones WHERE id = ?`).get(id);
  creado(res, liquidacion, 'Liquidación generada');
}

export function obtenerLiquidacion(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { id } = req.params;

  const liq = db.prepare(`
    SELECT l.*, e.nombre || ' ' || e.apellido as empleado_nombre,
           e.cedula as empleado_cedula, e.numero_empleado,
           c.nombre as cargo_nombre, d.nombre as departamento_nombre
    FROM liquidaciones l
    JOIN empleados e ON e.id = l.empleado_id
    LEFT JOIN cargos c ON c.id = e.cargo_id
    LEFT JOIN departamentos d ON d.id = e.departamento_id
    WHERE l.id = ? AND l.empresa_id = ?
  `).get(id, empresaId) as any;

  if (!liq) {
    noEncontrado(res, 'Liquidación');
    return;
  }

  if (liq.detalles) {
    liq.detalles = JSON.parse(liq.detalles);
  }

  ok(res, liq);
}

export function aprobarLiquidacion(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { id } = req.params;

  const resultado = db.prepare(`
    UPDATE liquidaciones SET estado = 'aprobado', aprobado_en = datetime('now')
    WHERE id = ? AND empresa_id = ? AND estado = 'borrador'
  `).run(id, empresaId);

  if (resultado.changes === 0) {
    error(res, 'Liquidación no encontrada o ya está aprobada');
    return;
  }

  // Generar recibo automáticamente
  const liq = db.prepare(`SELECT * FROM liquidaciones WHERE id = ?`).get(id) as any;
  const numeroRecibo = `R-${liq.periodo}-${Date.now().toString().slice(-6)}`;
  const reciboId = uuidv4();

  db.prepare(`
    INSERT INTO recibos (id, empresa_id, liquidacion_id, empleado_id, periodo, numero, estado, datos)
    VALUES (?, ?, ?, ?, ?, ?, 'emitido', ?)
  `).run(reciboId, empresaId, id, liq.empleado_id, liq.periodo, numeroRecibo, liq.detalles);

  ok(res, { liquidacionId: id, reciboId, numeroRecibo }, 'Liquidación aprobada y recibo generado');
}

export function previewLiquidacion(req: RequestAutenticada, res: Response): void {
  const empresaId = req.usuario!.empresaId;
  const { empleadoId, anio, mes } = req.query;

  if (!empleadoId || !anio || !mes) {
    error(res, 'Empleado, año y mes son requeridos');
    return;
  }

  const datos = calcularLiquidacion(
    empleadoId as string,
    parseInt(anio as string),
    parseInt(mes as string),
    empresaId
  );

  if (!datos) {
    noEncontrado(res, 'Empleado');
    return;
  }

  ok(res, datos);
}
