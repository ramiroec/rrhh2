import { inicializarBD } from './modelos/baseDatos';
import db from './modelos/baseDatos';
import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';

dotenv.config();
inicializarBD();

console.log('🌱 Iniciando carga de datos de ejemplo...');

// Limpiar datos existentes
db.exec(`
  DELETE FROM recibos;
  DELETE FROM liquidaciones;
  DELETE FROM vacaciones;
  DELETE FROM saldo_vacaciones;
  DELETE FROM asistencia;
  DELETE FROM empleados;
  DELETE FROM cargos;
  DELETE FROM departamentos;
  DELETE FROM usuarios;
  DELETE FROM empresas;
`);

// Empresa
const empresaId = uuidv4();
db.prepare(`
  INSERT INTO empresas (id, nombre, rut, direccion, telefono, email)
  VALUES (?, 'TEKI Solutions S.A.', '80012345-1', 'Av. Eusebio Ayala 1234, Asunción', '0981-123456', 'admin@teki.com.py')
`).run(empresaId);

// Usuario administrador
const passwordHash = bcrypt.hashSync('admin123', 10);
const adminId = uuidv4();
db.prepare(`
  INSERT INTO usuarios (id, empresa_id, nombre, email, password_hash, rol)
  VALUES (?, ?, 'Administrador', 'admin@teki.com.py', ?, 'admin')
`).run(adminId, empresaId, passwordHash);

// Departamentos
const deptos = [
  { id: uuidv4(), nombre: 'Tecnología' },
  { id: uuidv4(), nombre: 'Comercial' },
  { id: uuidv4(), nombre: 'Administración' },
  { id: uuidv4(), nombre: 'Recursos Humanos' },
  { id: uuidv4(), nombre: 'Operaciones' },
];

for (const d of deptos) {
  db.prepare(`INSERT INTO departamentos (id, empresa_id, nombre) VALUES (?, ?, ?)`).run(d.id, empresaId, d.nombre);
}

// Cargos
const cargos = [
  { id: uuidv4(), nombre: 'Desarrollador Senior', salario: 8500000 },
  { id: uuidv4(), nombre: 'Desarrollador Junior', salario: 5500000 },
  { id: uuidv4(), nombre: 'Diseñador UX/UI', salario: 6500000 },
  { id: uuidv4(), nombre: 'Gerente Comercial', salario: 12000000 },
  { id: uuidv4(), nombre: 'Ejecutivo de Ventas', salario: 5000000 },
  { id: uuidv4(), nombre: 'Contador', salario: 7000000 },
  { id: uuidv4(), nombre: 'Analista RRHH', salario: 6000000 },
  { id: uuidv4(), nombre: 'Gerente General', salario: 18000000 },
  { id: uuidv4(), nombre: 'Asistente Administrativo', salario: 4200000 },
  { id: uuidv4(), nombre: 'DevOps Engineer', salario: 9000000 },
];

for (const c of cargos) {
  db.prepare(`INSERT INTO cargos (id, empresa_id, nombre, salario_base) VALUES (?, ?, ?, ?)`).run(c.id, empresaId, c.nombre, c.salario);
}

// Empleados
const empleadosData = [
  { nombre: 'Carlos', apellido: 'Rodríguez', cedula: '3.456.789', email: 'carlos.rodriguez@teki.com.py', salario: 8500000, deptoIdx: 0, cargoIdx: 0, ingreso: '2021-03-15', nro: 'EMP-001' },
  { nombre: 'María', apellido: 'González', cedula: '4.567.890', email: 'maria.gonzalez@teki.com.py', salario: 5500000, deptoIdx: 0, cargoIdx: 1, ingreso: '2022-07-01', nro: 'EMP-002' },
  { nombre: 'José', apellido: 'Martínez', cedula: '5.678.901', email: 'jose.martinez@teki.com.py', salario: 6500000, deptoIdx: 0, cargoIdx: 2, ingreso: '2022-01-10', nro: 'EMP-003' },
  { nombre: 'Ana', apellido: 'López', cedula: '2.345.678', email: 'ana.lopez@teki.com.py', salario: 12000000, deptoIdx: 1, cargoIdx: 3, ingreso: '2020-06-01', nro: 'EMP-004' },
  { nombre: 'Luis', apellido: 'Benítez', cedula: '6.789.012', email: 'luis.benitez@teki.com.py', salario: 5000000, deptoIdx: 1, cargoIdx: 4, ingreso: '2023-02-14', nro: 'EMP-005' },
  { nombre: 'Sofía', apellido: 'Ramírez', cedula: '7.890.123', email: 'sofia.ramirez@teki.com.py', salario: 7000000, deptoIdx: 2, cargoIdx: 5, ingreso: '2021-09-20', nro: 'EMP-006' },
  { nombre: 'Diego', apellido: 'Álvarez', cedula: '1.234.567', email: 'diego.alvarez@teki.com.py', salario: 6000000, deptoIdx: 3, cargoIdx: 6, ingreso: '2022-11-07', nro: 'EMP-007' },
  { nombre: 'Laura', apellido: 'Torres', cedula: '8.901.234', email: 'laura.torres@teki.com.py', salario: 18000000, deptoIdx: 2, cargoIdx: 7, ingreso: '2019-01-05', nro: 'EMP-008' },
  { nombre: 'Andrés', apellido: 'Mendoza', cedula: '9.012.345', email: 'andres.mendoza@teki.com.py', salario: 4200000, deptoIdx: 2, cargoIdx: 8, ingreso: '2023-05-22', nro: 'EMP-009' },
  { nombre: 'Valentina', apellido: 'Giménez', cedula: '2.987.654', email: 'valentina.gimenez@teki.com.py', salario: 9000000, deptoIdx: 0, cargoIdx: 9, ingreso: '2021-08-30', nro: 'EMP-010' },
  { nombre: 'Pablo', apellido: 'Sánchez', cedula: '3.876.543', email: 'pablo.sanchez@teki.com.py', salario: 5500000, deptoIdx: 4, cargoIdx: 1, ingreso: '2023-01-16', nro: 'EMP-011' },
  { nombre: 'Camila', apellido: 'Fernández', cedula: '4.765.432', email: 'camila.fernandez@teki.com.py', salario: 5000000, deptoIdx: 1, cargoIdx: 4, ingreso: '2023-08-01', nro: 'EMP-012' },
];

const empleadoIds: string[] = [];
const nacimientos = ['1988-04-12', '1995-09-23', '1992-11-05', '1985-02-17', '1997-07-30', '1990-06-08', '1993-12-14', '1980-03-25', '1999-01-19', '1991-10-02', '1996-05-11', '1998-08-28'];

for (let i = 0; i < empleadosData.length; i++) {
  const emp = empleadosData[i];
  const id = uuidv4();
  empleadoIds.push(id);
  db.prepare(`
    INSERT INTO empleados (id, empresa_id, departamento_id, cargo_id, numero_empleado, nombre, apellido, cedula, email,
      fecha_nacimiento, fecha_ingreso, salario, tipo_contrato, estado)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'indefinido', 'activo')
  `).run(id, empresaId, deptos[emp.deptoIdx].id, cargos[emp.cargoIdx].id, emp.nro,
    emp.nombre, emp.apellido, emp.cedula, emp.email, nacimientos[i], emp.ingreso, emp.salario);

  // Saldo vacaciones
  db.prepare(`
    INSERT INTO saldo_vacaciones (id, empresa_id, empleado_id, anio, dias_totales, dias_usados, dias_pendientes)
    VALUES (?, ?, ?, 2026, 15, ?, ?)
  `).run(uuidv4(), empresaId, id, Math.floor(Math.random() * 6), 15 - Math.floor(Math.random() * 6));
}

// Asistencia: últimos 20 días hábiles
const hoy = new Date();
let diasGenerados = 0;
let fechaActual = new Date(hoy);
fechaActual.setDate(fechaActual.getDate() - 1);

while (diasGenerados < 20) {
  const diaSemana = fechaActual.getDay();
  if (diaSemana !== 0 && diaSemana !== 6) {
    const fechaStr = fechaActual.toISOString().split('T')[0];

    for (const empId of empleadoIds) {
      const random = Math.random();
      let estado = 'presente';
      let horaEntrada = '08:00';
      let horaSalida = '17:00';

      if (random < 0.05) {
        estado = 'ausente';
        horaEntrada = '';
        horaSalida = '';
      } else if (random < 0.12) {
        estado = 'tardanza';
        const minutosExtra = Math.floor(Math.random() * 45) + 10;
        const h = 8 + Math.floor(minutosExtra / 60);
        const m = minutosExtra % 60;
        horaEntrada = `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
        horaSalida = '17:00';
      } else if (random < 0.18) {
        // Horas extra
        horaSalida = `${18 + Math.floor(Math.random() * 2)}:00`;
      }

      let horasTrabajadas = 0;
      let horasExtra = 0;
      let tardanza = 0;

      if (estado !== 'ausente' && horaEntrada && horaSalida) {
        const entrada = new Date(`2000-01-01T${horaEntrada}`);
        const salida = new Date(`2000-01-01T${horaSalida}`);
        horasTrabajadas = (salida.getTime() - entrada.getTime()) / 3600000;
        horasExtra = Math.max(0, horasTrabajadas - 8);
        const limite = new Date('2000-01-01T08:05:00');
        if (entrada > limite) tardanza = Math.floor((entrada.getTime() - limite.getTime()) / 60000);
      }

      db.prepare(`
        INSERT OR IGNORE INTO asistencia (id, empresa_id, empleado_id, fecha, hora_entrada, hora_salida,
          horas_trabajadas, horas_extra, tardanza_minutos, estado)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(uuidv4(), empresaId, empId, fechaStr,
        horaEntrada || null, horaSalida || null,
        horasTrabajadas, horasExtra, tardanza, estado);
    }
    diasGenerados++;
  }
  fechaActual.setDate(fechaActual.getDate() - 1);
}

// Vacaciones
const estadosVac = ['aprobado', 'aprobado', 'aprobado', 'pendiente', 'pendiente', 'rechazado'];
for (let i = 0; i < 8; i++) {
  const empId = empleadoIds[i % empleadoIds.length];
  const diasAtras = Math.floor(Math.random() * 60);
  const inicio = new Date(hoy);
  inicio.setDate(inicio.getDate() - diasAtras + 30);
  const fin = new Date(inicio);
  fin.setDate(fin.getDate() + 5);
  const estado = estadosVac[i % estadosVac.length];

  db.prepare(`
    INSERT INTO vacaciones (id, empresa_id, empleado_id, fecha_inicio, fecha_fin, dias_solicitados, tipo, estado)
    VALUES (?, ?, ?, ?, ?, 5, 'vacaciones', ?)
  `).run(uuidv4(), empresaId, empId,
    inicio.toISOString().split('T')[0],
    fin.toISOString().split('T')[0],
    estado);
}

// Liquidaciones y recibos para meses anteriores
for (const mes of [4, 5, 6, 7, 8]) {
  for (const empId of empleadoIds.slice(0, 6)) {
    const emp = db.prepare(`SELECT * FROM empleados WHERE id = ?`).get(empId) as any;
    const salario = emp.salario;
    const horasExtra = Math.random() * 10;
    const ausencias = Math.floor(Math.random() * 2);
    const valorHora = salario / (26 * 8);
    const ausenciasMonto = ausencias * (salario / 26);
    const horasExtraMonto = horasExtra * valorHora * 1.5;
    const bruto = salario + horasExtraMonto - ausenciasMonto;
    const ipsEmp = bruto * 0.09;
    const ipsPat = bruto * 0.165;
    const neto = bruto - ipsEmp;
    const periodo = `2026-${String(mes).padStart(2, '0')}`;

    const liqId = uuidv4();
    db.prepare(`
      INSERT INTO liquidaciones (id, empresa_id, empleado_id, periodo, anio, mes,
        salario_base, horas_extra_monto, bonos, descuentos, ausencias_monto,
        ips_empleado, ips_patronal, salario_bruto, salario_neto, estado, aprobado_en, detalles)
      VALUES (?, ?, ?, ?, 2026, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, 'aprobado', datetime('now'), ?)
    `).run(liqId, empresaId, empId, periodo, mes,
      salario, horasExtraMonto, ausenciasMonto, ipsEmp, ipsPat, bruto, neto,
      JSON.stringify([
        { concepto: 'Salario base', tipo: 'ingreso', monto: salario },
        { concepto: `Horas extra (${horasExtra.toFixed(1)}h)`, tipo: 'ingreso', monto: horasExtraMonto },
        { concepto: `Ausencias (${ausencias} días)`, tipo: 'descuento', monto: ausenciasMonto },
        { concepto: 'IPS empleado (9%)', tipo: 'descuento', monto: ipsEmp },
      ])
    );

    const reciboId = uuidv4();
    const nroRecibo = `R-${periodo}-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    db.prepare(`
      INSERT INTO recibos (id, empresa_id, liquidacion_id, empleado_id, periodo, numero, estado)
      VALUES (?, ?, ?, ?, ?, ?, 'emitido')
    `).run(reciboId, empresaId, liqId, empId, periodo, nroRecibo);
  }
}

console.log('✅ Datos de ejemplo cargados correctamente');
console.log('📧 Email: admin@teki.com.py');
console.log('🔑 Password: admin123');
