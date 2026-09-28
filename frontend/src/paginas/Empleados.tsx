import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MoreHorizontal, Eye, Pencil, UserX } from 'lucide-react';
import { servicioEmpleados } from '../servicios/api';
import { Empleado, Departamento } from '../tipos';
import Tarjeta from '../componentes/ui/Tarjeta';
import Boton from '../componentes/ui/Boton';
import Avatar from '../componentes/ui/Avatar';
import Insignia, { colorEstadoEmpleado, textoEstadoEmpleado } from '../componentes/ui/Insignia';
import EstadoVacio, { Cargando } from '../componentes/ui/EstadoVacio';
import EncabezadoPagina from '../componentes/layout/EncabezadoPagina';
import { formatearMoneda, formatearFecha } from '../utilidades/formato';
import { useNotificacion } from '../componentes/ui/Notificacion';

export default function Empleados() {
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('');
  const [filtroDepto, setFiltroDepto] = useState('');
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [menuAbierto, setMenuAbierto] = useState<string | null>(null);
  const navigate = useNavigate();
  const { exito, error: notifError } = useNotificacion();

  const cargarDatos = useCallback(async () => {
    setCargando(true);
    try {
      const [resEmp, resDeptos] = await Promise.all([
        servicioEmpleados.listar({
          busqueda: busqueda || undefined,
          estado: filtroEstado || undefined,
          departamentoId: filtroDepto || undefined,
          limite: 50,
        }),
        servicioEmpleados.departamentos(),
      ]);
      setEmpleados(normalizarEmpleados(resEmp.empleados || resEmp));
      setTotal(resEmp.total || (resEmp.empleados || resEmp).length);
      setDepartamentos(resDeptos);
    } finally {
      setCargando(false);
    }
  }, [busqueda, filtroEstado, filtroDepto]);

  useEffect(() => {
    const t = setTimeout(cargarDatos, 300);
    return () => clearTimeout(t);
  }, [cargarDatos]);

  const desactivar = async (id: string, nombre: string) => {
    try {
      await servicioEmpleados.eliminar(id);
      exito('Empleado desactivado', `${nombre} fue desactivado correctamente`);
      cargarDatos();
    } catch {
      notifError('Error al desactivar el empleado');
    }
    setMenuAbierto(null);
  };

  return (
    <div className="animar-aparecer">
      <EncabezadoPagina
        titulo="Empleados"
        subtitulo={`${total} empleado${total !== 1 ? 's' : ''} registrado${total !== 1 ? 's' : ''}`}
        acciones={
          <Boton icono={<Plus size={16} />} onClick={() => navigate('/empleados/nuevo')}>
            Nuevo empleado
          </Boton>
        }
      />

      {/* Filtros */}
      <Tarjeta className="mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-52">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9ca3af]" />
            <input
              type="text"
              placeholder="Buscar por nombre, cédula o email..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-[#6366f1] bg-white"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter size={15} className="text-[#9ca3af]" />
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="text-sm rounded-lg border border-[#e5e7eb] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#a5b4fc]"
            >
              <option value="">Todos los estados</option>
              <option value="activo">Activos</option>
              <option value="inactivo">Inactivos</option>
              <option value="licencia">En licencia</option>
            </select>
            <select
              value={filtroDepto}
              onChange={(e) => setFiltroDepto(e.target.value)}
              className="text-sm rounded-lg border border-[#e5e7eb] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#a5b4fc]"
            >
              <option value="">Todos los departamentos</option>
              {departamentos.map((d) => (
                <option key={d.id} value={d.id}>{d.nombre}</option>
              ))}
            </select>
          </div>
        </div>
      </Tarjeta>

      {/* Tabla */}
      <Tarjeta padding="ninguno">
        {cargando ? (
          <Cargando />
        ) : empleados.length === 0 ? (
          <EstadoVacio
            titulo="No se encontraron empleados"
            descripcion="Ajustá los filtros o registrá un nuevo empleado."
            accion={<Boton icono={<Plus size={16} />} onClick={() => navigate('/empleados/nuevo')}>Nuevo empleado</Boton>}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Empleado</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Departamento</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Cargo</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Ingreso</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Salario</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Estado</th>
                  <th className="px-4 py-3.5" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {empleados.map((emp) => (
                  <tr
                    key={emp.id}
                    className="hover:bg-[#fafafa] transition-colors group"
                  >
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <Avatar nombre={emp.nombre} apellido={emp.apellido} tamanio="sm" />
                        <div>
                          <p className="text-sm font-medium text-[#111827]">{emp.nombre} {emp.apellido}</p>
                          <p className="text-xs text-[#9ca3af]">{emp.numeroEmpleado || emp.email || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-[#374151]">{emp.departamento || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-[#374151]">{emp.cargo || '—'}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm text-[#374151]">{formatearFecha(emp.fechaIngreso)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="text-sm font-medium text-[#111827]">{formatearMoneda(emp.salario)}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <Insignia color={colorEstadoEmpleado(emp.estado)} punto>
                        {textoEstadoEmpleado(emp.estado)}
                      </Insignia>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="relative flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => navigate(`/empleados/${emp.id}`)}
                          className="p-1.5 rounded-lg hover:bg-[#f3f4f6] text-[#6b7280] hover:text-[#111827]"
                          title="Ver detalle"
                        >
                          <Eye size={15} />
                        </button>
                        <button
                          onClick={() => navigate(`/empleados/${emp.id}/editar`)}
                          className="p-1.5 rounded-lg hover:bg-[#f3f4f6] text-[#6b7280] hover:text-[#111827]"
                          title="Editar"
                        >
                          <Pencil size={15} />
                        </button>
                        <div className="relative">
                          <button
                            onClick={() => setMenuAbierto(menuAbierto === emp.id ? null : emp.id)}
                            className="p-1.5 rounded-lg hover:bg-[#f3f4f6] text-[#6b7280]"
                          >
                            <MoreHorizontal size={15} />
                          </button>
                          {menuAbierto === emp.id && (
                            <div className="absolute right-0 top-full mt-1 w-44 bg-white rounded-xl shadow-lg border border-[#e5e7eb] py-1 z-10">
                              <button
                                onClick={() => desactivar(emp.id, `${emp.nombre} ${emp.apellido}`)}
                                className="flex items-center gap-2 w-full px-4 py-2 text-sm text-[#ef4444] hover:bg-[#fef2f2]"
                              >
                                <UserX size={14} /> Desactivar
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>
    </div>
  );
}

function normalizarEmpleados(datos: any[]): Empleado[] {
  return datos.map((e) => ({
    id: e.id,
    numeroEmpleado: e.numero_empleado,
    nombre: e.nombre,
    apellido: e.apellido,
    cedula: e.cedula,
    email: e.email,
    telefono: e.telefono,
    fechaNacimiento: e.fecha_nacimiento,
    fechaIngreso: e.fecha_ingreso,
    salario: e.salario,
    tipoContrato: e.tipo_contrato,
    estado: e.estado,
    departamentoId: e.departamento_id,
    departamento: e.departamento,
    cargoId: e.cargo_id,
    cargo: e.cargo,
    direccion: e.direccion,
    ciudad: e.ciudad,
    banco: e.banco,
    numeroCuenta: e.numero_cuenta,
    notas: e.notas,
  }));
}
