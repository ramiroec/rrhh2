import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Clock, Plus, Filter, Download } from 'lucide-react';
import { servicioAsistencia, servicioEmpleados } from '../servicios/api';
import { RegistroAsistencia, Empleado } from '../tipos';
import Tarjeta from '../componentes/ui/Tarjeta';
import Boton from '../componentes/ui/Boton';
import Insignia, { colorEstadoAsistencia, textoEstadoAsistencia } from '../componentes/ui/Insignia';
import EstadoVacio, { Cargando } from '../componentes/ui/EstadoVacio';
import Modal from '../componentes/ui/Modal';
import CampoFormulario, { InputTexto, SelectCampo } from '../componentes/ui/CampoFormulario';
import EncabezadoPagina from '../componentes/layout/EncabezadoPagina';
import { formatearFecha, formatearHoras } from '../utilidades/formato';
import { useNotificacion } from '../componentes/ui/Notificacion';

export default function Asistencia() {
  const [registros, setRegistros] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [cargando, setCargando] = useState(true);
  const [empleados, setEmpleados] = useState<Empleado[]>([]);
  const [modalAbierto, setModalAbierto] = useState(false);
  const [resumen, setResumen] = useState<any>(null);
  const [searchParams] = useSearchParams();

  const hoy = new Date().toISOString().split('T')[0];
  const mesActual = new Date().getMonth() + 1;
  const anioActual = new Date().getFullYear();

  const [filtros, setFiltros] = useState({
    empleadoId: searchParams.get('empleadoId') || '',
    fechaDesde: `${anioActual}-${String(mesActual).padStart(2, '0')}-01`,
    fechaHasta: hoy,
    estado: '',
  });

  const [formRegistro, setFormRegistro] = useState({
    empleadoId: '', fecha: hoy, horaEntrada: '08:00', horaSalida: '17:00', estado: 'presente', notas: '',
  });
  const [guardando, setGuardando] = useState(false);
  const { exito, error: notifError } = useNotificacion();

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const [res, resResumen] = await Promise.all([
        servicioAsistencia.listar({ ...filtros, limite: 50 }),
        servicioAsistencia.resumen({ mes: mesActual, anio: anioActual }),
      ]);
      setRegistros(res.registros || []);
      setTotal(res.total || 0);
      setResumen(resResumen);
    } finally {
      setCargando(false);
    }
  }, [filtros, mesActual, anioActual]);

  useEffect(() => {
    cargar();
    servicioEmpleados.listar({ estado: 'activo', limite: 200 })
      .then((r) => setEmpleados(r.empleados || []));
  }, [cargar]);

  const guardarRegistro = async () => {
    if (!formRegistro.empleadoId) { notifError('Seleccioná un empleado'); return; }
    setGuardando(true);
    try {
      await servicioAsistencia.registrar(formRegistro);
      exito('Asistencia registrada');
      setModalAbierto(false);
      setFormRegistro({ empleadoId: '', fecha: hoy, horaEntrada: '08:00', horaSalida: '17:00', estado: 'presente', notas: '' });
      cargar();
    } catch (err: any) {
      notifError('Error al registrar', err?.response?.data?.error);
    } finally {
      setGuardando(false);
    }
  };

  const cambiarFiltro = (campo: string, valor: string) => setFiltros((p) => ({ ...p, [campo]: valor }));

  return (
    <div className="animar-aparecer">
      <EncabezadoPagina
        titulo="Asistencia"
        subtitulo={`${total} registros encontrados`}
        acciones={
          <Boton icono={<Plus size={16} />} onClick={() => setModalAbierto(true)}>
            Registrar asistencia
          </Boton>
        }
      />

      {/* Resumen del mes */}
      {resumen && (
        <div className="grid grid-cols-5 gap-3 mb-5">
          {[
            { etiqueta: 'Registros', valor: resumen.total_registros || 0, color: '#6366f1' },
            { etiqueta: 'Presentes', valor: resumen.presentes || 0, color: '#10b981' },
            { etiqueta: 'Ausentes', valor: resumen.ausentes || 0, color: '#ef4444' },
            { etiqueta: 'Tardanzas', valor: resumen.tardanzas || 0, color: '#f59e0b' },
            { etiqueta: 'Horas extra', valor: `${Math.round(resumen.total_horas_extra || 0)}h`, color: '#3b82f6' },
          ].map((item) => (
            <Tarjeta key={item.etiqueta} className="text-center">
              <p className="text-2xl font-bold" style={{ color: item.color }}>{item.valor}</p>
              <p className="text-xs text-[#9ca3af] mt-1">{item.etiqueta}</p>
            </Tarjeta>
          ))}
        </div>
      )}

      {/* Filtros */}
      <Tarjeta className="mb-5">
        <div className="flex items-center gap-3 flex-wrap">
          <Filter size={15} className="text-[#9ca3af]" />
          <select
            value={filtros.empleadoId}
            onChange={(e) => cambiarFiltro('empleadoId', e.target.value)}
            className="text-sm rounded-lg border border-[#e5e7eb] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] min-w-44"
          >
            <option value="">Todos los empleados</option>
            {empleados.map((e: any) => (
              <option key={e.id} value={e.id}>{e.nombre} {e.apellido}</option>
            ))}
          </select>
          <input type="date" value={filtros.fechaDesde} onChange={(e) => cambiarFiltro('fechaDesde', e.target.value)}
            className="text-sm rounded-lg border border-[#e5e7eb] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#a5b4fc]" />
          <span className="text-[#9ca3af] text-sm">hasta</span>
          <input type="date" value={filtros.fechaHasta} onChange={(e) => cambiarFiltro('fechaHasta', e.target.value)}
            className="text-sm rounded-lg border border-[#e5e7eb] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#a5b4fc]" />
          <select
            value={filtros.estado}
            onChange={(e) => cambiarFiltro('estado', e.target.value)}
            className="text-sm rounded-lg border border-[#e5e7eb] px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-[#a5b4fc]"
          >
            <option value="">Todos los estados</option>
            <option value="presente">Presente</option>
            <option value="ausente">Ausente</option>
            <option value="tardanza">Tardanza</option>
            <option value="medio_dia">Medio día</option>
          </select>
        </div>
      </Tarjeta>

      {/* Tabla */}
      <Tarjeta padding="ninguno">
        {cargando ? <Cargando /> : registros.length === 0 ? (
          <EstadoVacio
            titulo="Sin registros de asistencia"
            descripcion="No hay registros para los filtros seleccionados."
            accion={<Boton icono={<Plus size={15} />} onClick={() => setModalAbierto(true)}>Registrar</Boton>}
            icono={<Clock size={22} />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#f3f4f6]">
                  <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Empleado</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Fecha</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Entrada</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Salida</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Horas</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Extra</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Tardanza</th>
                  <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f9fafb]">
                {registros.map((reg) => (
                  <tr key={reg.id} className="hover:bg-[#fafafa] transition-colors">
                    <td className="px-5 py-3.5">
                      <p className="text-sm font-medium text-[#111827]">{reg.empleado_nombre}</p>
                      {reg.numero_empleado && <p className="text-xs text-[#9ca3af]">{reg.numero_empleado}</p>}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#374151]">{formatearFecha(reg.fecha)}</td>
                    <td className="px-4 py-3.5">
                      <span className={`text-sm font-medium ${reg.tardanza_minutos > 0 ? 'text-[#f59e0b]' : 'text-[#374151]'}`}>
                        {reg.hora_entrada || '—'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-[#374151]">{reg.hora_salida || '—'}</td>
                    <td className="px-4 py-3.5 text-sm text-[#374151]">{formatearHoras(reg.horas_trabajadas)}</td>
                    <td className="px-4 py-3.5">
                      {reg.horas_extra > 0 ? (
                        <span className="text-sm font-medium text-[#3b82f6]">+{formatearHoras(reg.horas_extra)}</span>
                      ) : (
                        <span className="text-sm text-[#d1d5db]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      {reg.tardanza_minutos > 0 ? (
                        <span className="text-sm text-[#f59e0b]">{reg.tardanza_minutos}min</span>
                      ) : (
                        <span className="text-sm text-[#d1d5db]">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5">
                      <Insignia color={colorEstadoAsistencia(reg.estado)} punto>
                        {textoEstadoAsistencia(reg.estado)}
                      </Insignia>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Tarjeta>

      {/* Modal registro */}
      <Modal
        abierto={modalAbierto}
        alCerrar={() => setModalAbierto(false)}
        titulo="Registrar asistencia"
        subtitulo="Ingresá los datos del registro de hoy"
        pie={
          <>
            <Boton variante="secundario" onClick={() => setModalAbierto(false)}>Cancelar</Boton>
            <Boton cargando={guardando} onClick={guardarRegistro}>Guardar</Boton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <CampoFormulario etiqueta="Empleado" requerido>
            <SelectCampo
              value={formRegistro.empleadoId}
              onChange={(e) => setFormRegistro((p) => ({ ...p, empleadoId: e.target.value }))}
              placeholder="Seleccionar empleado"
              opciones={empleados.map((e: any) => ({ valor: e.id, etiqueta: `${e.nombre} ${e.apellido}` }))}
            />
          </CampoFormulario>
          <CampoFormulario etiqueta="Fecha" requerido>
            <InputTexto type="date" value={formRegistro.fecha} onChange={(e) => setFormRegistro((p) => ({ ...p, fecha: e.target.value }))} />
          </CampoFormulario>
          <CampoFormulario etiqueta="Estado">
            <SelectCampo
              value={formRegistro.estado}
              onChange={(e) => setFormRegistro((p) => ({ ...p, estado: e.target.value }))}
              opciones={[
                { valor: 'presente', etiqueta: 'Presente' },
                { valor: 'ausente', etiqueta: 'Ausente' },
                { valor: 'tardanza', etiqueta: 'Tardanza' },
                { valor: 'medio_dia', etiqueta: 'Medio día' },
                { valor: 'feriado', etiqueta: 'Feriado' },
              ]}
            />
          </CampoFormulario>
          {formRegistro.estado !== 'ausente' && formRegistro.estado !== 'feriado' && (
            <div className="grid grid-cols-2 gap-3">
              <CampoFormulario etiqueta="Hora entrada">
                <InputTexto type="time" value={formRegistro.horaEntrada} onChange={(e) => setFormRegistro((p) => ({ ...p, horaEntrada: e.target.value }))} />
              </CampoFormulario>
              <CampoFormulario etiqueta="Hora salida">
                <InputTexto type="time" value={formRegistro.horaSalida} onChange={(e) => setFormRegistro((p) => ({ ...p, horaSalida: e.target.value }))} />
              </CampoFormulario>
            </div>
          )}
          <CampoFormulario etiqueta="Notas">
            <InputTexto value={formRegistro.notas} onChange={(e) => setFormRegistro((p) => ({ ...p, notas: e.target.value }))} placeholder="Observaciones opcionales..." />
          </CampoFormulario>
        </div>
      </Modal>
    </div>
  );
}
