import { useEffect, useState, useCallback } from 'react';
import { Calendar, Plus, CheckCircle, XCircle, Clock } from 'lucide-react';
import { servicioVacaciones, servicioEmpleados } from '../servicios/api';
import Tarjeta from '../componentes/ui/Tarjeta';
import Boton from '../componentes/ui/Boton';
import Insignia, { colorEstadoSolicitud, textoEstadoSolicitud } from '../componentes/ui/Insignia';
import EstadoVacio, { Cargando } from '../componentes/ui/EstadoVacio';
import Modal from '../componentes/ui/Modal';
import CampoFormulario, { InputTexto, SelectCampo, TextAreaCampo } from '../componentes/ui/CampoFormulario';
import EncabezadoPagina from '../componentes/layout/EncabezadoPagina';
import { formatearFecha } from '../utilidades/formato';
import { useNotificacion } from '../componentes/ui/Notificacion';

export default function Vacaciones() {
  const [solicitudes, setSolicitudes] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [modalNueva, setModalNueva] = useState(false);
  const [modalGestion, setModalGestion] = useState<{ id: string; nombre: string; accion: 'aprobar' | 'rechazar' } | null>(null);
  const [tabActiva, setTabActiva] = useState<'todas' | 'pendientes' | 'aprobadas' | 'rechazadas'>('todas');
  const [notasGestion, setNotasGestion] = useState('');
  const [guardando, setGuardando] = useState(false);
  const { exito, error: notifError } = useNotificacion();

  const anioActual = new Date().getFullYear();

  const [formNueva, setFormNueva] = useState({
    empleadoId: '', fechaInicio: '', fechaFin: '', tipo: 'vacaciones', motivo: '',
  });

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await servicioVacaciones.listar({
        estado: tabActiva === 'todas' ? undefined : tabActiva === 'pendientes' ? 'pendiente' : tabActiva === 'aprobadas' ? 'aprobado' : 'rechazado',
        anio: anioActual,
      });
      setSolicitudes(res);
    } finally {
      setCargando(false);
    }
  }, [tabActiva, anioActual]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    servicioEmpleados.listar({ estado: 'activo', limite: 200 })
      .then((r) => setEmpleados(r.empleados || []));
  }, []);

  const crearSolicitud = async () => {
    if (!formNueva.empleadoId || !formNueva.fechaInicio || !formNueva.fechaFin) {
      notifError('Completá todos los campos requeridos');
      return;
    }
    setGuardando(true);
    try {
      await servicioVacaciones.crear(formNueva);
      exito('Solicitud creada', 'La solicitud fue registrada correctamente');
      setModalNueva(false);
      setFormNueva({ empleadoId: '', fechaInicio: '', fechaFin: '', tipo: 'vacaciones', motivo: '' });
      cargar();
    } catch (err: any) {
      notifError('Error', err?.response?.data?.error || 'No se pudo crear la solicitud');
    } finally {
      setGuardando(false);
    }
  };

  const gestionarSolicitud = async () => {
    if (!modalGestion) return;
    setGuardando(true);
    try {
      await servicioVacaciones.gestion(modalGestion.id, modalGestion.accion, notasGestion);
      exito(
        modalGestion.accion === 'aprobar' ? 'Solicitud aprobada' : 'Solicitud rechazada',
        `La solicitud de ${modalGestion.nombre} fue ${modalGestion.accion === 'aprobar' ? 'aprobada' : 'rechazada'}`
      );
      setModalGestion(null);
      setNotasGestion('');
      cargar();
    } catch (err: any) {
      notifError('Error', err?.response?.data?.error);
    } finally {
      setGuardando(false);
    }
  };

  const pendientes = solicitudes.filter((s) => s.estado === 'pendiente').length;

  return (
    <div className="animar-aparecer">
      <EncabezadoPagina
        titulo="Vacaciones"
        subtitulo={`${solicitudes.length} solicitudes · ${pendientes} pendiente${pendientes !== 1 ? 's' : ''}`}
        acciones={
          <Boton icono={<Plus size={16} />} onClick={() => setModalNueva(true)}>
            Nueva solicitud
          </Boton>
        }
      />

      {/* Tabs */}
      <div className="flex gap-1 bg-[#f3f4f6] rounded-xl p-1 mb-5 w-fit">
        {[
          { key: 'todas', etiqueta: 'Todas' },
          { key: 'pendientes', etiqueta: `Pendientes${pendientes > 0 ? ` (${pendientes})` : ''}` },
          { key: 'aprobadas', etiqueta: 'Aprobadas' },
          { key: 'rechazadas', etiqueta: 'Rechazadas' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTabActiva(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              tabActiva === tab.key ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'
            }`}
          >
            {tab.etiqueta}
          </button>
        ))}
      </div>

      {/* Lista */}
      {cargando ? <Cargando /> : solicitudes.length === 0 ? (
        <EstadoVacio
          titulo="Sin solicitudes"
          descripcion="No hay solicitudes de vacaciones para este filtro."
          icono={<Calendar size={22} />}
          accion={<Boton icono={<Plus size={15} />} onClick={() => setModalNueva(true)}>Nueva solicitud</Boton>}
        />
      ) : (
        <Tarjeta padding="ninguno">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Empleado</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Tipo</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Período</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Días</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Estado</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Solicitado</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9fafb]">
              {solicitudes.map((sol) => (
                <tr key={sol.id} className="hover:bg-[#fafafa] transition-colors group">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-[#111827]">{sol.empleado_nombre}</p>
                    {sol.motivo && <p className="text-xs text-[#9ca3af] mt-0.5 truncar max-w-40">{sol.motivo}</p>}
                  </td>
                  <td className="px-4 py-3.5">
                    <Insignia color={sol.tipo === 'vacaciones' ? 'azul' : sol.tipo === 'licencia' ? 'morado' : 'gris'}>
                      {sol.tipo === 'vacaciones' ? 'Vacaciones' : sol.tipo === 'licencia' ? 'Licencia' : 'Permiso'}
                    </Insignia>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#374151]">
                    {formatearFecha(sol.fecha_inicio)} — {formatearFecha(sol.fecha_fin)}
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-sm font-semibold text-[#111827]">{sol.dias_solicitados}</span>
                    <span className="text-xs text-[#9ca3af] ml-1">días</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Insignia color={colorEstadoSolicitud(sol.estado)} punto>
                      {textoEstadoSolicitud(sol.estado)}
                    </Insignia>
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#9ca3af]">
                    {formatearFecha(sol.creado_en)}
                  </td>
                  <td className="px-4 py-3.5">
                    {sol.estado === 'pendiente' && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => setModalGestion({ id: sol.id, nombre: sol.empleado_nombre, accion: 'aprobar' })}
                          className="p-1.5 rounded-lg hover:bg-[#d1fae5] text-[#10b981]"
                          title="Aprobar"
                        >
                          <CheckCircle size={16} />
                        </button>
                        <button
                          onClick={() => setModalGestion({ id: sol.id, nombre: sol.empleado_nombre, accion: 'rechazar' })}
                          className="p-1.5 rounded-lg hover:bg-[#fee2e2] text-[#ef4444]"
                          title="Rechazar"
                        >
                          <XCircle size={16} />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
      )}

      {/* Modal nueva solicitud */}
      <Modal
        abierto={modalNueva}
        alCerrar={() => setModalNueva(false)}
        titulo="Nueva solicitud"
        subtitulo="Registrá una solicitud de ausencia"
        pie={
          <>
            <Boton variante="secundario" onClick={() => setModalNueva(false)}>Cancelar</Boton>
            <Boton cargando={guardando} onClick={crearSolicitud}>Crear solicitud</Boton>
          </>
        }
      >
        <div className="flex flex-col gap-4">
          <CampoFormulario etiqueta="Empleado" requerido>
            <SelectCampo
              value={formNueva.empleadoId}
              onChange={(e) => setFormNueva((p) => ({ ...p, empleadoId: e.target.value }))}
              placeholder="Seleccionar empleado"
              opciones={empleados.map((e: any) => ({ valor: e.id, etiqueta: `${e.nombre} ${e.apellido}` }))}
            />
          </CampoFormulario>
          <CampoFormulario etiqueta="Tipo">
            <SelectCampo
              value={formNueva.tipo}
              onChange={(e) => setFormNueva((p) => ({ ...p, tipo: e.target.value }))}
              opciones={[
                { valor: 'vacaciones', etiqueta: 'Vacaciones' },
                { valor: 'licencia', etiqueta: 'Licencia' },
                { valor: 'permiso', etiqueta: 'Permiso' },
              ]}
            />
          </CampoFormulario>
          <div className="grid grid-cols-2 gap-3">
            <CampoFormulario etiqueta="Fecha inicio" requerido>
              <InputTexto type="date" value={formNueva.fechaInicio} onChange={(e) => setFormNueva((p) => ({ ...p, fechaInicio: e.target.value }))} />
            </CampoFormulario>
            <CampoFormulario etiqueta="Fecha fin" requerido>
              <InputTexto type="date" value={formNueva.fechaFin} onChange={(e) => setFormNueva((p) => ({ ...p, fechaFin: e.target.value }))} />
            </CampoFormulario>
          </div>
          <CampoFormulario etiqueta="Motivo">
            <TextAreaCampo value={formNueva.motivo} onChange={(e) => setFormNueva((p) => ({ ...p, motivo: e.target.value }))} rows={3} placeholder="Motivo de la solicitud..." />
          </CampoFormulario>
        </div>
      </Modal>

      {/* Modal gestión */}
      <Modal
        abierto={!!modalGestion}
        alCerrar={() => { setModalGestion(null); setNotasGestion(''); }}
        titulo={modalGestion?.accion === 'aprobar' ? 'Aprobar solicitud' : 'Rechazar solicitud'}
        subtitulo={modalGestion ? `Solicitud de ${modalGestion.nombre}` : ''}
        tamanio="sm"
        pie={
          <>
            <Boton variante="secundario" onClick={() => setModalGestion(null)}>Cancelar</Boton>
            <Boton
              variante={modalGestion?.accion === 'aprobar' ? 'exito' : 'peligro'}
              icono={modalGestion?.accion === 'aprobar' ? <CheckCircle size={15} /> : <XCircle size={15} />}
              cargando={guardando}
              onClick={gestionarSolicitud}
            >
              {modalGestion?.accion === 'aprobar' ? 'Aprobar' : 'Rechazar'}
            </Boton>
          </>
        }
      >
        <div className="flex flex-col gap-3">
          <p className="text-sm text-[#6b7280]">
            ¿Confirmás que querés {modalGestion?.accion === 'aprobar' ? 'aprobar' : 'rechazar'} esta solicitud?
          </p>
          <CampoFormulario etiqueta="Notas (opcional)">
            <TextAreaCampo value={notasGestion} onChange={(e) => setNotasGestion(e.target.value)} rows={2} placeholder="Comentario opcional..." />
          </CampoFormulario>
        </div>
      </Modal>
    </div>
  );
}
