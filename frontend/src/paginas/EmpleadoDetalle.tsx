import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Mail, Phone, MapPin, Briefcase, Calendar, CreditCard,
  Clock, ArrowLeft, Pencil, ChevronRight, Building2,
} from 'lucide-react';
import { servicioEmpleados } from '../servicios/api';
import { Empleado } from '../tipos';
import Tarjeta from '../componentes/ui/Tarjeta';
import Boton from '../componentes/ui/Boton';
import Avatar from '../componentes/ui/Avatar';
import Insignia, { colorEstadoEmpleado, textoEstadoEmpleado, colorEstadoAsistencia, textoEstadoAsistencia } from '../componentes/ui/Insignia';
import { Cargando } from '../componentes/ui/EstadoVacio';
import EncabezadoPagina from '../componentes/layout/EncabezadoPagina';
import { formatearMoneda, formatearFecha, formatearHoras } from '../utilidades/formato';

export default function EmpleadoDetalle() {
  const { id } = useParams<{ id: string }>();
  const [empleado, setEmpleado] = useState<any>(null);
  const [cargando, setCargando] = useState(true);
  const [tabActiva, setTabActiva] = useState<'info' | 'asistencia' | 'vacaciones'>('info');
  const navigate = useNavigate();

  useEffect(() => {
    if (!id) return;
    servicioEmpleados.obtener(id)
      .then(setEmpleado)
      .finally(() => setCargando(false));
  }, [id]);

  if (cargando) return <Cargando />;
  if (!empleado) return <p className="text-[#6b7280]">Empleado no encontrado.</p>;

  const saldo = empleado.saldo_vacaciones || empleado.saldoVacaciones;
  const asistenciaReciente = empleado.asistencia_reciente || empleado.asistenciaReciente || [];

  return (
    <div className="animar-aparecer">
      <EncabezadoPagina
        titulo="Detalle del empleado"
        migas={[{ etiqueta: 'Empleados' }, { etiqueta: `${empleado.nombre} ${empleado.apellido}` }]}
        acciones={
          <>
            <Boton variante="secundario" icono={<ArrowLeft size={15} />} onClick={() => navigate('/empleados')}>
              Volver
            </Boton>
            <Boton icono={<Pencil size={15} />} onClick={() => navigate(`/empleados/${id}/editar`)}>
              Editar
            </Boton>
          </>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        {/* Panel izquierdo */}
        <div className="flex flex-col gap-4">
          {/* Perfil */}
          <Tarjeta className="text-center">
            <div className="flex flex-col items-center gap-3">
              <Avatar nombre={empleado.nombre} apellido={empleado.apellido} tamanio="xl" />
              <div>
                <h2 className="font-semibold text-[#111827] text-lg">{empleado.nombre} {empleado.apellido}</h2>
                <p className="text-sm text-[#6b7280] mt-0.5">{empleado.cargo || '—'}</p>
              </div>
              <Insignia color={colorEstadoEmpleado(empleado.estado)} punto>
                {textoEstadoEmpleado(empleado.estado)}
              </Insignia>
              {empleado.numero_empleado && (
                <span className="text-xs text-[#9ca3af] bg-[#f3f4f6] px-2 py-1 rounded-full">
                  {empleado.numero_empleado}
                </span>
              )}
            </div>
          </Tarjeta>

          {/* Contacto */}
          <Tarjeta>
            <h3 className="text-sm font-semibold text-[#374151] mb-3">Contacto</h3>
            <div className="flex flex-col gap-2.5">
              {empleado.email && (
                <div className="flex items-center gap-2.5">
                  <Mail size={14} className="text-[#9ca3af] flex-shrink-0" />
                  <span className="text-sm text-[#374151] truncar">{empleado.email}</span>
                </div>
              )}
              {empleado.telefono && (
                <div className="flex items-center gap-2.5">
                  <Phone size={14} className="text-[#9ca3af] flex-shrink-0" />
                  <span className="text-sm text-[#374151]">{empleado.telefono}</span>
                </div>
              )}
              {(empleado.ciudad || empleado.direccion) && (
                <div className="flex items-center gap-2.5">
                  <MapPin size={14} className="text-[#9ca3af] flex-shrink-0" />
                  <span className="text-sm text-[#374151]">{empleado.ciudad || empleado.direccion}</span>
                </div>
              )}
              {!empleado.email && !empleado.telefono && (
                <p className="text-xs text-[#9ca3af]">Sin datos de contacto</p>
              )}
            </div>
          </Tarjeta>

          {/* Vacaciones */}
          {saldo && (
            <Tarjeta>
              <h3 className="text-sm font-semibold text-[#374151] mb-3">Vacaciones {saldo.anio}</h3>
              <div className="flex flex-col gap-3">
                <div>
                  <div className="flex justify-between text-xs text-[#6b7280] mb-1.5">
                    <span>Días usados</span>
                    <span className="font-medium">{saldo.dias_usados || saldo.diasUsados || 0} / {saldo.dias_totales || saldo.diasTotales || 15}</span>
                  </div>
                  <div className="w-full h-2 bg-[#f3f4f6] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-[#6366f1] rounded-full transition-all"
                      style={{ width: `${Math.min(100, ((saldo.dias_usados || saldo.diasUsados || 0) / (saldo.dias_totales || saldo.diasTotales || 15)) * 100)}%` }}
                    />
                  </div>
                </div>
                <div className="flex justify-between">
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#111827]">{saldo.dias_pendientes || saldo.diasPendientes || 0}</p>
                    <p className="text-xs text-[#9ca3af]">Disponibles</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#111827]">{saldo.dias_usados || saldo.diasUsados || 0}</p>
                    <p className="text-xs text-[#9ca3af]">Usados</p>
                  </div>
                  <div className="text-center">
                    <p className="text-lg font-bold text-[#111827]">{saldo.dias_totales || saldo.diasTotales || 15}</p>
                    <p className="text-xs text-[#9ca3af]">Total</p>
                  </div>
                </div>
              </div>
            </Tarjeta>
          )}
        </div>

        {/* Panel derecho */}
        <div className="col-span-2 flex flex-col gap-4">
          {/* Pestañas */}
          <div className="flex gap-1 bg-[#f3f4f6] rounded-xl p-1">
            {(['info', 'asistencia', 'vacaciones'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setTabActiva(tab)}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                  tabActiva === tab ? 'bg-white text-[#111827] shadow-sm' : 'text-[#6b7280] hover:text-[#374151]'
                }`}
              >
                {tab === 'info' ? 'Información' : tab === 'asistencia' ? 'Asistencia' : 'Vacaciones'}
              </button>
            ))}
          </div>

          {tabActiva === 'info' && (
            <div className="grid grid-cols-2 gap-4">
              {/* Datos laborales */}
              <Tarjeta>
                <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                  <Briefcase size={15} className="text-[#6366f1]" /> Datos laborales
                </h3>
                <div className="flex flex-col gap-3">
                  <CampoInfo etiqueta="Departamento" valor={empleado.departamento || '—'} icono={<Building2 size={13} />} />
                  <CampoInfo etiqueta="Cargo" valor={empleado.cargo || '—'} icono={<Briefcase size={13} />} />
                  <CampoInfo etiqueta="Ingreso" valor={formatearFecha(empleado.fecha_ingreso || empleado.fechaIngreso)} icono={<Calendar size={13} />} />
                  <CampoInfo etiqueta="Tipo contrato" valor={empleado.tipo_contrato || empleado.tipoContrato || '—'} />
                  <CampoInfo etiqueta="Salario" valor={formatearMoneda(empleado.salario)} destacar />
                </div>
              </Tarjeta>

              {/* Datos personales */}
              <Tarjeta>
                <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                  <CreditCard size={15} className="text-[#6366f1]" /> Datos personales
                </h3>
                <div className="flex flex-col gap-3">
                  <CampoInfo etiqueta="Cédula" valor={empleado.cedula || '—'} />
                  <CampoInfo etiqueta="Nacimiento" valor={formatearFecha(empleado.fecha_nacimiento || empleado.fechaNacimiento) || '—'} />
                  <CampoInfo etiqueta="Dirección" valor={empleado.direccion || '—'} />
                  <CampoInfo etiqueta="Ciudad" valor={empleado.ciudad || '—'} />
                </div>
              </Tarjeta>

              {/* Datos bancarios */}
              {(empleado.banco || empleado.numero_cuenta) && (
                <Tarjeta>
                  <h3 className="text-sm font-semibold text-[#374151] mb-4 flex items-center gap-2">
                    <CreditCard size={15} className="text-[#6366f1]" /> Datos bancarios
                  </h3>
                  <div className="flex flex-col gap-3">
                    <CampoInfo etiqueta="Banco" valor={empleado.banco || '—'} />
                    <CampoInfo etiqueta="Cuenta" valor={empleado.numero_cuenta || empleado.numeroCuenta || '—'} />
                  </div>
                </Tarjeta>
              )}

              {/* Notas */}
              {empleado.notas && (
                <Tarjeta>
                  <h3 className="text-sm font-semibold text-[#374151] mb-3">Notas</h3>
                  <p className="text-sm text-[#6b7280] leading-relaxed">{empleado.notas}</p>
                </Tarjeta>
              )}
            </div>
          )}

          {tabActiva === 'asistencia' && (
            <Tarjeta padding="ninguno">
              <div className="px-5 py-4 border-b border-[#f3f4f6]">
                <h3 className="font-semibold text-[#111827]">Asistencia reciente</h3>
                <p className="text-xs text-[#9ca3af] mt-0.5">Últimos 5 registros</p>
              </div>
              {asistenciaReciente.length === 0 ? (
                <div className="py-12 text-center text-sm text-[#9ca3af]">Sin registros de asistencia</div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#f3f4f6]">
                      <th className="text-left px-5 py-3 text-xs text-[#9ca3af] font-medium">Fecha</th>
                      <th className="text-left px-4 py-3 text-xs text-[#9ca3af] font-medium">Entrada</th>
                      <th className="text-left px-4 py-3 text-xs text-[#9ca3af] font-medium">Salida</th>
                      <th className="text-left px-4 py-3 text-xs text-[#9ca3af] font-medium">Horas</th>
                      <th className="text-left px-4 py-3 text-xs text-[#9ca3af] font-medium">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#f9fafb]">
                    {asistenciaReciente.map((reg: any) => (
                      <tr key={reg.id} className="hover:bg-[#fafafa]">
                        <td className="px-5 py-3 text-sm text-[#374151]">{formatearFecha(reg.fecha)}</td>
                        <td className="px-4 py-3 text-sm text-[#374151]">{reg.hora_entrada || '—'}</td>
                        <td className="px-4 py-3 text-sm text-[#374151]">{reg.hora_salida || '—'}</td>
                        <td className="px-4 py-3 text-sm text-[#374151]">{formatearHoras(reg.horas_trabajadas)}</td>
                        <td className="px-4 py-3">
                          <Insignia color={colorEstadoAsistencia(reg.estado)} punto>
                            {textoEstadoAsistencia(reg.estado)}
                          </Insignia>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="px-5 py-3 border-t border-[#f3f4f6]">
                <button
                  onClick={() => navigate(`/asistencia?empleadoId=${id}`)}
                  className="text-xs text-[#6366f1] hover:underline flex items-center gap-1"
                >
                  Ver todo el historial <ChevronRight size={12} />
                </button>
              </div>
            </Tarjeta>
          )}

          {tabActiva === 'vacaciones' && (
            <Tarjeta>
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-[#111827]">Historial de vacaciones</h3>
                <button
                  onClick={() => navigate('/vacaciones')}
                  className="text-xs text-[#6366f1] hover:underline flex items-center gap-1"
                >
                  Gestionar <ChevronRight size={12} />
                </button>
              </div>
              <div className="flex flex-col items-center py-8 text-center">
                <Calendar size={32} className="text-[#d1d5db] mb-2" />
                <p className="text-sm text-[#9ca3af]">Accedé al módulo de vacaciones para ver el historial completo</p>
              </div>
            </Tarjeta>
          )}
        </div>
      </div>
    </div>
  );
}

function CampoInfo({ etiqueta, valor, icono, destacar }: { etiqueta: string; valor: string; icono?: React.ReactNode; destacar?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <span className="text-xs text-[#9ca3af] flex items-center gap-1.5 flex-shrink-0 mt-0.5">
        {icono} {etiqueta}
      </span>
      <span className={`text-sm text-right ${destacar ? 'font-semibold text-[#111827]' : 'text-[#374151]'}`}>{valor}</span>
    </div>
  );
}
