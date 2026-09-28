import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dirDatos = path.join(__dirname, '../../datos');
if (!fs.existsSync(dirDatos)) {
  fs.mkdirSync(dirDatos, { recursive: true });
}

const rutaDB = path.join(dirDatos, 'teki_rrhh.db');
const db = new Database(rutaDB);

// Activar WAL para mejor performance
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

export function inicializarBD(): void {
  db.exec(`
    -- Empresas (multi-tenant)
    CREATE TABLE IF NOT EXISTS empresas (
      id TEXT PRIMARY KEY,
      nombre TEXT NOT NULL,
      rut TEXT,
      direccion TEXT,
      telefono TEXT,
      email TEXT,
      logo_url TEXT,
      activa INTEGER DEFAULT 1,
      creada_en TEXT DEFAULT (datetime('now'))
    );

    -- Usuarios del sistema
    CREATE TABLE IF NOT EXISTS usuarios (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES empresas(id),
      nombre TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      rol TEXT NOT NULL DEFAULT 'usuario',
      activo INTEGER DEFAULT 1,
      creado_en TEXT DEFAULT (datetime('now'))
    );

    -- Departamentos
    CREATE TABLE IF NOT EXISTS departamentos (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES empresas(id),
      nombre TEXT NOT NULL,
      descripcion TEXT,
      creado_en TEXT DEFAULT (datetime('now'))
    );

    -- Cargos
    CREATE TABLE IF NOT EXISTS cargos (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES empresas(id),
      nombre TEXT NOT NULL,
      descripcion TEXT,
      salario_base REAL DEFAULT 0,
      creado_en TEXT DEFAULT (datetime('now'))
    );

    -- Empleados
    CREATE TABLE IF NOT EXISTS empleados (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES empresas(id),
      departamento_id TEXT REFERENCES departamentos(id),
      cargo_id TEXT REFERENCES cargos(id),
      numero_empleado TEXT,
      nombre TEXT NOT NULL,
      apellido TEXT NOT NULL,
      cedula TEXT,
      email TEXT,
      telefono TEXT,
      fecha_nacimiento TEXT,
      fecha_ingreso TEXT NOT NULL,
      fecha_egreso TEXT,
      salario REAL NOT NULL DEFAULT 0,
      tipo_contrato TEXT DEFAULT 'indefinido',
      estado TEXT DEFAULT 'activo',
      avatar_url TEXT,
      direccion TEXT,
      ciudad TEXT,
      banco TEXT,
      numero_cuenta TEXT,
      notas TEXT,
      creado_en TEXT DEFAULT (datetime('now')),
      actualizado_en TEXT DEFAULT (datetime('now'))
    );

    -- Registros de asistencia
    CREATE TABLE IF NOT EXISTS asistencia (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES empresas(id),
      empleado_id TEXT NOT NULL REFERENCES empleados(id),
      fecha TEXT NOT NULL,
      hora_entrada TEXT,
      hora_salida TEXT,
      horas_trabajadas REAL DEFAULT 0,
      horas_extra REAL DEFAULT 0,
      estado TEXT DEFAULT 'presente',
      tardanza_minutos INTEGER DEFAULT 0,
      notas TEXT,
      creado_en TEXT DEFAULT (datetime('now'))
    );

    -- Solicitudes de vacaciones
    CREATE TABLE IF NOT EXISTS vacaciones (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES empresas(id),
      empleado_id TEXT NOT NULL REFERENCES empleados(id),
      fecha_inicio TEXT NOT NULL,
      fecha_fin TEXT NOT NULL,
      dias_solicitados INTEGER NOT NULL,
      tipo TEXT DEFAULT 'vacaciones',
      estado TEXT DEFAULT 'pendiente',
      motivo TEXT,
      aprobado_por TEXT REFERENCES usuarios(id),
      aprobado_en TEXT,
      notas TEXT,
      creado_en TEXT DEFAULT (datetime('now'))
    );

    -- Saldo de vacaciones
    CREATE TABLE IF NOT EXISTS saldo_vacaciones (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES empresas(id),
      empleado_id TEXT NOT NULL REFERENCES empleados(id),
      anio INTEGER NOT NULL,
      dias_totales INTEGER DEFAULT 15,
      dias_usados INTEGER DEFAULT 0,
      dias_pendientes INTEGER DEFAULT 0,
      actualizado_en TEXT DEFAULT (datetime('now')),
      UNIQUE(empleado_id, anio)
    );

    -- Liquidaciones de sueldo
    CREATE TABLE IF NOT EXISTS liquidaciones (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES empresas(id),
      empleado_id TEXT NOT NULL REFERENCES empleados(id),
      periodo TEXT NOT NULL,
      anio INTEGER NOT NULL,
      mes INTEGER NOT NULL,
      salario_base REAL DEFAULT 0,
      horas_extra_monto REAL DEFAULT 0,
      bonos REAL DEFAULT 0,
      descuentos REAL DEFAULT 0,
      ausencias_monto REAL DEFAULT 0,
      ips_empleado REAL DEFAULT 0,
      ips_patronal REAL DEFAULT 0,
      salario_bruto REAL DEFAULT 0,
      salario_neto REAL DEFAULT 0,
      estado TEXT DEFAULT 'borrador',
      generado_en TEXT DEFAULT (datetime('now')),
      aprobado_en TEXT,
      detalles TEXT
    );

    -- Recibos de sueldo
    CREATE TABLE IF NOT EXISTS recibos (
      id TEXT PRIMARY KEY,
      empresa_id TEXT NOT NULL REFERENCES empresas(id),
      liquidacion_id TEXT NOT NULL REFERENCES liquidaciones(id),
      empleado_id TEXT NOT NULL REFERENCES empleados(id),
      periodo TEXT NOT NULL,
      numero TEXT NOT NULL,
      estado TEXT DEFAULT 'emitido',
      emitido_en TEXT DEFAULT (datetime('now')),
      datos TEXT
    );

    -- Índices para performance
    CREATE INDEX IF NOT EXISTS idx_empleados_empresa ON empleados(empresa_id);
    CREATE INDEX IF NOT EXISTS idx_asistencia_empleado ON asistencia(empleado_id);
    CREATE INDEX IF NOT EXISTS idx_asistencia_fecha ON asistencia(fecha);
    CREATE INDEX IF NOT EXISTS idx_vacaciones_empleado ON vacaciones(empleado_id);
    CREATE INDEX IF NOT EXISTS idx_liquidaciones_empleado ON liquidaciones(empleado_id);
    CREATE INDEX IF NOT EXISTS idx_recibos_empleado ON recibos(empleado_id);
  `);

  console.log('✅ Base de datos inicializada');
}

export default db;
