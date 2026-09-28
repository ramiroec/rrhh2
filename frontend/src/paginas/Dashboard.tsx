import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Clock, Calendar, TrendingUp, AlertCircle,
  ChevronRight, CheckCircle, XCircle, UserPlus,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import { servicioDashboard } from '../servicios/api';
import { ResumenDashboard } from '../tipos';
import Tarjeta from '../componentes/ui/Tarjeta';
import Insignia, { colorEstadoSolicitud, textoEstadoSolicitud } from '../componentes/ui/Insignia';
import { Cargando } from '../componentes/ui/EstadoVacio';
import { formatearMoneda, formatearFecha, formatearPeriodo } from '../utilidades/formato';
import Boton from '../componentes/ui/Boton';

const COLORES_GRAFICO = ['#6366f1', '#8b5cf6', '#ec4899', '#f97316', '#eab308', '#22c55e'];

function TarjetaMetrica({
  titulo, valor, subtitulo, icono, color, tendencia,
}: {
  titulo: string;
  valor: string | number;
  subtitulo?: string;
  icono: React.ReactNode;
  color: string;
  tendencia?: { valor: string; positivo: boolean };
}) {
  return (
    <Tarjeta>
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#6b7280] font-medium">{titulo}</p>
          <p className="text-3xl font-bold text-[#111827] mt-1 tracking-tight">{valor}</p>
          {subtitulo && <p className="text-xs text-[#9ca3af] mt-1">{subtitulo}</p>}
          {tendencia && (
            <span className={`inline-flex items-center gap-1 text-xs font-medium mt-2 ${tendencia.positivo ? 'text-[#10b981]' : 'text-[#ef4444]'}`}>
              <TrendingUp size={12} />
              {tendencia.valor}
            </span>
          )}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`} style={{ backgroundColor: `${color}15` }}>
          <span style={{ color }}>{icono}</span>
        </div>
      </div>
    </Tarjeta>
  );
}

export default function Dashboard() {
  const [datos, setDatos] = useState<ResumenDashboard | null>(null);
  const [cargando, setCargando] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    servicioDashboard.resumen()
      .then((d) => {
        // normalizar snake_case a camelCase del backend
        setDatos(normalizarDashboard(d));
      })
      .finally(() => setCargando(false));
  }, []);

  if (cargando) return <Cargando />;
  if (!datos) return null;

  const diasSemana = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  const datosAsistenciaSemana = (datos.asistenciaUltimaSemana || []).map((d) => ({
    dia: diasSemana[new Date(d.fecha + 'T00:00:00').getDay()],
    Presentes: d.presentes,
    Ausentes: d.ausentes,
    Tardanzas: d.tardanzas,
  }));

  const datosDepartamento = (datos.porDepartamento || []).map((d) => ({
    name: d.nombre,
    value: d.cantidad,
  }));

  const totalEmpleados = datos.empleados?.activos || 0;
  const presentesHoy = datos.asistenciaHoy?.presentes || 0;
  const ausentesHoy = datos.asistenciaHoy?.ausentes || 0;
  const tardanzasHoy = datos.asistenciaHoy?.tardanzas || 0;
  const vacPendientes = datos.vacacionesPendientes?.total || 0;
  const vacHoy = datos.vacacionesHoy?.total || 0;

  return (
    <div className="animar-aparecer">
      {/* Encabezado */}
      <div className="flex items-start justify-between mb-7">
        <div>
          <h1 className="text-2xl font-bold text-[#111827] tracking-tight">Inicio</h1>
          <p className="text-sm text-[#6b7280] mt-1">
            {new Date().toLocaleDateString('es-PY', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
        </div>
        <Boton icono={<UserPlus size={16} />} onClick={() => navigate('/empleados/nuevo')}>
          Nuevo empleado
        </Boton>
      </div>

      {/* Métricas principales */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <TarjetaMetrica
          titulo="Empleados activos"
          valor={totalEmpleados}
          subtitulo={`${datos.empleados?.nuevosMes || 0} nuevos este mes`}
          icono={<Users size={22} />}
          color="#6366f1"
        />
        <TarjetaMetrica
          titulo="Presentes hoy"
          valor={presentesHoy}
          subtitulo={totalEmpleados > 0 ? `${Math.round((presentesHoy / totalEmpleados) * 100)}% del total` : '—'}
          icono={<CheckCircle size={22} />}
          color="#10b981"
        />
        <TarjetaMetrica
          titulo="Ausentes hoy"
          valor={ausentesHoy + tardanzasHoy}
          subtitulo={`${ausentesHoy} ausentes · ${tardanzasHoy} tardanzas`}
          icono={<AlertCircle size={22} />}
          color="#f59e0b"
        />
        <TarjetaMetrica
          titulo="Vacaciones pendientes"
          valor={vacPendientes}
          subtitulo={`${vacHoy} empleados de licencia hoy`}
          icono={<Calendar size={22} />}
          color="#3b82f6"
          tendencia={vacPendientes > 0 ? { valor: 'Requieren aprobación', positivo: false } : undefined}
        />
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {/* Asistencia semanal */}
        <Tarjeta className="col-span-2">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#111827]">Asistencia — últimos 7 días</h3>
              <p className="text-xs text-[#9ca3af] mt-0.5">Presentes, ausentes y tardanzas</p>
            </div>
            <button onClick={() => navigate('/asistencia')} className="text-xs text-[#6366f1] hover:underline flex items-center gap-1">
              Ver todo <ChevronRight size={12} />
            </button>
          </div>
          {datosAsistenciaSemana.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={datosAsistenciaSemana} barSize={20} barGap={4}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" vertical={false} />
                <XAxis dataKey="dia" tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: '#9ca3af' }} axisLine={false} tickLine={false} width={28} />
                <Tooltip
                  contentStyle={{ border: 'none', borderRadius: 10, boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }}
                  cursor={{ fill: '#f9fafb' }}
                />
                <Bar dataKey="Presentes" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Ausentes" fill="#fee2e2" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Tardanzas" fill="#fef3c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-[#9ca3af]">
              No hay datos de asistencia esta semana
            </div>
          )}
        </Tarjeta>

        {/* Distribución por departamento */}
        <Tarjeta>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-semibold text-[#111827]">Por departamento</h3>
              <p className="text-xs text-[#9ca3af] mt-0.5">Distribución actual</p>
            </div>
          </div>
          {datosDepartamento.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={150}>
                <PieChart>
                  <Pie data={datosDepartamento} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {datosDepartamento.map((_, i) => (
                      <Cell key={i} fill={COLORES_GRAFICO[i % COLORES_GRAFICO.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ border: 'none', borderRadius: 8, fontSize: 12 }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="mt-3 flex flex-col gap-1.5">
                {datosDepartamento.slice(0, 4).map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORES_GRAFICO[i % COLORES_GRAFICO.length] }} />
                      <span className="text-xs text-[#6b7280] truncar max-w-28">{d.name}</span>
                    </div>
                    <span className="text-xs font-medium text-[#374151]">{d.value}</span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <div className="h-48 flex items-center justify-center text-sm text-[#9ca3af]">Sin datos</div>
          )}
        </Tarjeta>
      </div>

      {/* Fila inferior */}
      <div className="grid grid-cols-2 gap-4">
        {/* Solicitudes pendientes */}
        <Tarjeta>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[#111827]">Solicitudes pendientes</h3>
            <button onClick={() => navigate('/vacaciones')} className="text-xs text-[#6366f1] hover:underline flex items-center gap-1">
              Ver todas <ChevronRight size={12} />
            </button>
          </div>
          {datos.solicitudesRecientes?.length > 0 ? (
            <div className="flex flex-col gap-2">
              {datos.solicitudesRecientes.map((sol: any) => (
                <div
                  key={sol.id}
                  onClick={() => navigate('/vacaciones')}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#f9fafb] cursor-pointer transition-colors group"
                >
                  <div className="w-8 h-8 rounded-full bg-[#eef2ff] flex items-center justify-center text-[#6366f1] flex-shrink-0">
                    <Calendar size={15} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#111827] truncar">
                      {sol.empleado_nombre || sol.empleadoNombre}
                    </p>
                    <p className="text-xs text-[#9ca3af]">
                      {formatearFecha(sol.fecha_inicio || sol.fechaInicio)} — {formatearFecha(sol.fecha_fin || sol.fechaFin)}
                      {' · '}{sol.dias_solicitados || sol.diasSolicitados} días
                    </p>
                  </div>
                  <Insignia color={colorEstadoSolicitud(sol.estado)} punto>
                    {textoEstadoSolicitud(sol.estado)}
                  </Insignia>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center py-8 text-center">
              <div className="w-10 h-10 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-2">
                <CheckCircle size={20} className="text-[#10b981]" />
              </div>
              <p className="text-sm text-[#6b7280]">Sin solicitudes pendientes</p>
            </div>
          )}
        </Tarjeta>

        {/* Resumen rápido */}
        <div className="flex flex-col gap-4">
          {/* Última liquidación */}
          {datos.ultimaLiquidacion && (
            <Tarjeta>
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold text-[#111827]">Última liquidación</h3>
                <button onClick={() => navigate('/liquidaciones')} className="text-xs text-[#6366f1] hover:underline flex items-center gap-1">
                  Ver <ChevronRight size={12} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xl font-bold text-[#111827]">
                    {formatearMoneda((datos.ultimaLiquidacion as any).total_neto || datos.ultimaLiquidacion.totalNeto || 0)}
                  </p>
                  <p className="text-xs text-[#9ca3af] mt-0.5">
                    {formatearPeriodo((datos.ultimaLiquidacion as any).periodo)} · {(datos.ultimaLiquidacion as any).total_empleados || datos.ultimaLiquidacion.totalEmpleados || 0} empleados
                  </p>
                </div>
                <Insignia color={(datos.ultimaLiquidacion as any).estado === 'aprobado' ? 'verde' : 'amarillo'} punto>
                  {(datos.ultimaLiquidacion as any).estado === 'aprobado' ? 'Aprobada' : 'Borrador'}
                </Insignia>
              </div>
            </Tarjeta>
          )}

          {/* Accesos rápidos */}
          <Tarjeta>
            <h3 className="font-semibold text-[#111827] mb-3">Accesos rápidos</h3>
            <div className="grid grid-cols-2 gap-2">
              {[
                { etiqueta: 'Nuevo empleado', ruta: '/empleados/nuevo', color: '#6366f1', icono: <UserPlus size={16} /> },
                { etiqueta: 'Registrar asistencia', ruta: '/asistencia', color: '#10b981', icono: <Clock size={16} /> },
                { etiqueta: 'Nueva liquidación', ruta: '/liquidaciones', color: '#f59e0b', icono: <TrendingUp size={16} /> },
                { etiqueta: 'Ver vacaciones', ruta: '/vacaciones', color: '#3b82f6', icono: <Calendar size={16} /> },
              ].map((a) => (
                <button
                  key={a.ruta}
                  onClick={() => navigate(a.ruta)}
                  className="flex items-center gap-2.5 p-3 rounded-lg border border-[#e5e7eb] hover:border-[#a5b4fc] hover:bg-[#f9fafb] transition-all text-left group"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${a.color}15`, color: a.color }}>
                    {a.icono}
                  </div>
                  <span className="text-xs font-medium text-[#374151] leading-tight">{a.etiqueta}</span>
                </button>
              ))}
            </div>
          </Tarjeta>

          {/* Indicadores del mes */}
          <Tarjeta>
            <h3 className="font-semibold text-[#111827] mb-3">Este mes</h3>
            <div className="flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock size={14} className="text-[#6366f1]" />
                  <span className="text-sm text-[#6b7280]">Horas trabajadas</span>
                </div>
                <span className="text-sm font-semibold text-[#111827]">
                  {Math.round((datos.asistenciaMes?.totalHoras || 0))}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={14} className="text-[#10b981]" />
                  <span className="text-sm text-[#6b7280]">Horas extra</span>
                </div>
                <span className="text-sm font-semibold text-[#111827]">
                  {Math.round((datos.asistenciaMes?.totalHorasExtra || 0))}h
                </span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle size={14} className="text-[#ef4444]" />
                  <span className="text-sm text-[#6b7280]">Ausencias</span>
                </div>
                <span className="text-sm font-semibold text-[#111827]">
                  {datos.asistenciaMes?.totalAusencias || 0}
                </span>
              </div>
            </div>
          </Tarjeta>
        </div>
      </div>
    </div>
  );
}

// Normalizar respuesta snake_case del backend
function normalizarDashboard(d: any): ResumenDashboard {
  return {
    empleados: {
      total: d.empleados?.total || 0,
      activos: d.empleados?.activos || 0,
      inactivos: d.empleados?.inactivos || 0,
      nuevosMes: d.empleados?.nuevos_mes || 0,
    },
    asistenciaHoy: {
      totalRegistros: d.asistencia_hoy?.total_registros || 0,
      presentes: d.asistencia_hoy?.presentes || 0,
      ausentes: d.asistencia_hoy?.ausentes || 0,
      tardanzas: d.asistencia_hoy?.tardanzas || 0,
    },
    asistenciaMes: {
      totalHoras: d.asistencia_mes?.total_horas || 0,
      totalHorasExtra: d.asistencia_mes?.total_horas_extra || 0,
      totalAusencias: d.asistencia_mes?.total_ausencias || 0,
    },
    vacacionesPendientes: { total: d.vacaciones_pendientes?.total || 0 },
    vacacionesHoy: { total: d.vacaciones_hoy?.total || 0 },
    solicitudesRecientes: d.solicitudes_recientes || [],
    porDepartamento: (d.por_departamento || []).map((p: any) => ({ nombre: p.nombre, cantidad: p.cantidad })),
    asistenciaUltimaSemana: (d.asistencia_ultima_semana || []).map((s: any) => ({
      fecha: s.fecha,
      presentes: s.presentes || 0,
      ausentes: s.ausentes || 0,
      tardanzas: s.tardanzas || 0,
    })),
    ultimaLiquidacion: d.ultima_liquidacion,
  };
}
