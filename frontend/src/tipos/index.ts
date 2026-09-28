// ──────────────────────────────────────────
// Tipos compartidos del sistema TEKI RRHH
// ──────────────────────────────────────────

export interface Usuario {
  id: string;
  nombre: string;
  email: string;
  rol: string;
  empresaId: string;
  empresaNombre: string;
}

export interface Empresa {
  id: string;
  nombre: string;
  rut?: string;
  logoUrl?: string;
}

export interface Departamento {
  id: string;
  nombre: string;
  descripcion?: string;
}

export interface Cargo {
  id: string;
  nombre: string;
  salarioBase?: number;
}

export interface Empleado {
  id: string;
  numeroEmpleado?: string;
  nombre: string;
  apellido: string;
  cedula?: string;
  email?: string;
  telefono?: string;
  fechaNacimiento?: string;
  fechaIngreso: string;
  fechaEgreso?: string;
  salario: number;
  tipoContrato: 'indefinido' | 'temporal' | 'pasantia';
  estado: 'activo' | 'inactivo' | 'licencia';
  departamentoId?: string;
  departamento?: string;
  cargoId?: string;
  cargo?: string;
  avatarUrl?: string;
  direccion?: string;
  ciudad?: string;
  banco?: string;
  numeroCuenta?: string;
  notas?: string;
  creadoEn?: string;
  saldoVacaciones?: SaldoVacaciones;
  asistenciaReciente?: RegistroAsistencia[];
}

export interface RegistroAsistencia {
  id: string;
  empleadoId: string;
  empleadoNombre?: string;
  fecha: string;
  horaEntrada?: string;
  horaSalida?: string;
  horasTrabajadas: number;
  horasExtra: number;
  estado: 'presente' | 'ausente' | 'tardanza' | 'medio_dia' | 'feriado';
  tardanzaMinutos: number;
  notas?: string;
}

export interface SaldoVacaciones {
  id: string;
  empleadoId: string;
  anio: number;
  diasTotales: number;
  diasUsados: number;
  diasPendientes: number;
}

export interface Vacacion {
  id: string;
  empleadoId: string;
  empleadoNombre?: string;
  fechaInicio: string;
  fechaFin: string;
  diasSolicitados: number;
  tipo: 'vacaciones' | 'licencia' | 'permiso';
  estado: 'pendiente' | 'aprobado' | 'rechazado';
  motivo?: string;
  aprobadoPor?: string;
  aprobadoEn?: string;
  notas?: string;
  creadoEn?: string;
}

export interface DetalleConcepto {
  concepto: string;
  tipo: 'ingreso' | 'descuento';
  monto: number;
}

export interface Liquidacion {
  id: string;
  empleadoId: string;
  empleadoNombre?: string;
  periodo: string;
  anio: number;
  mes: number;
  salarioBase: number;
  horasExtraMonto: number;
  bonos: number;
  descuentos: number;
  ausenciasMonto: number;
  ipsEmpleado: number;
  ipsPatronal: number;
  salarioBruto: number;
  salarioNeto: number;
  estado: 'borrador' | 'aprobado';
  generadoEn?: string;
  aprobadoEn?: string;
  detalles?: DetalleConcepto[];
}

export interface Recibo {
  id: string;
  liquidacionId: string;
  empleadoId: string;
  empleadoNombre?: string;
  empleadoCedula?: string;
  periodo: string;
  numero: string;
  estado: string;
  emitidoEn?: string;
  salarioBase?: number;
  salarioBruto?: number;
  salarioNeto?: number;
  ipsEmpleado?: number;
  ipsPatronal?: number;
  cargoNombre?: string;
  departamentoNombre?: string;
  empresaNombre?: string;
  detalles?: DetalleConcepto[];
}

export interface ResumenDashboard {
  empleados: {
    total: number;
    activos: number;
    inactivos: number;
    nuevosMes: number;
  };
  asistenciaHoy: {
    totalRegistros: number;
    presentes: number;
    ausentes: number;
    tardanzas: number;
  };
  asistenciaMes: {
    totalHoras: number;
    totalHorasExtra: number;
    totalAusencias: number;
  };
  vacacionesPendientes: { total: number };
  vacacionesHoy: { total: number };
  solicitudesRecientes: Vacacion[];
  porDepartamento: { nombre: string; cantidad: number }[];
  asistenciaUltimaSemana: { fecha: string; presentes: number; ausentes: number; tardanzas: number }[];
  ultimaLiquidacion?: { periodo: string; totalEmpleados: number; totalNeto: number; estado: string };
}

// Respuesta paginada
export interface Paginado<T> {
  datos: T[];
  total: number;
  pagina: number;
  limite: number;
}

// Estado de carga
export type EstadoCarga = 'inactivo' | 'cargando' | 'exitoso' | 'error';
