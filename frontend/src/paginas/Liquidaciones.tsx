import { useEffect, useState, useCallback } from 'react';
import { FileText, Plus, CheckCircle, Eye } from 'lucide-react';
import { servicioLiquidaciones, servicioEmpleados } from '../servicios/api';
import Tarjeta from '../componentes/ui/Tarjeta';
import Boton from '../componentes/ui/Boton';
import Insignia from '../componentes/ui/Insignia';
import EstadoVacio, { Cargando } from '../componentes/ui/EstadoVacio';
import Modal from '../componentes/ui/Modal';
import CampoFormulario, { SelectCampo, InputTexto } from '../componentes/ui/CampoFormulario';
import EncabezadoPagina from '../componentes/layout/EncabezadoPagina';
import { formatearMoneda, formatearPeriodo, nombreMes } from '../utilidades/formato';
import { useNotificacion } from '../componentes/ui/Notificacion';

export default function Liquidaciones() {
  const [liquidaciones, setLiquidaciones] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [modalNueva, setModalNueva] = useState(false);
  const [modalDetalle, setModalDetalle] = useState<any>(null);
  const [preview, setPreview] = useState<any>(null);
  const [cargandoPreview, setCargandoPreview] = useState(false);
  const [guardando, setGuardando] = useState(false);

  const anioActual = new Date().getFullYear();
  const mesActual = new Date().getMonth() + 1;

  const [filtros, setFiltros] = useState({ anio: String(anioActual), mes: '' });
  const [formNueva, setFormNueva] = useState({
    empleadoId: '', anio: String(anioActual), mes: String(mesActual), bonos: '0', descuentos: '0',
  });

  const { exito, error: notifError } = useNotificacion();

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await servicioLiquidaciones.listar({
        anio: filtros.anio || undefined,
        mes: filtros.mes || undefined,
      });
      setLiquidaciones(res);
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    servicioEmpleados.listar({ estado: 'activo', limite: 200 }).then((r) => setEmpleados(r.empleados || []));
  }, []);

  // Preview automático al cambiar empleado/mes/año
  useEffect(() => {
    if (!formNueva.empleadoId || !formNueva.anio || !formNueva.mes) { setPreview(null); return; }
    setCargandoPreview(true);
    servicioLiquidaciones.preview({
      empleadoId: formNueva.empleadoId,
      anio: formNueva.anio,
      mes: formNueva.mes,
    }).then(setPreview).catch(() => setPreview(null)).finally(() => setCargandoPreview(false));
  }, [formNueva.empleadoId, formNueva.anio, formNueva.mes]);

  const generarLiquidacion = async () => {
    if (!formNueva.empleadoId || !formNueva.anio || !formNueva.mes) {
      notifError('Completá todos los campos');
      return;
    }
    setGuardando(true);
    try {
      await servicioLiquidaciones.generar({
        empleadoId: formNueva.empleadoId,
        anio: Number(formNueva.anio),
        mes: Number(formNueva.mes),
        bonos: Number(formNueva.bonos),
        descuentos: Number(formNueva.descuentos),
      });
      exito('Liquidación generada', 'La liquidación fue creada como borrador');
      setModalNueva(false);
      setPreview(null);
      setFormNueva({ empleadoId: '', anio: String(anioActual), mes: String(mesActual), bonos: '0', descuentos: '0' });
      cargar();
    } catch (err: any) {
      notifError('Error', err?.response?.data?.error || 'No se pudo generar la liquidación');
    } finally {
      setGuardando(false);
    }
  };

  const aprobar = async (id: string, empleadoNombre: string) => {
    try {
      await servicioLiquidaciones.aprobar(id);
      exito('Liquidación aprobada', `Se generó el recibo para ${empleadoNombre}`);
      cargar();
    } catch (err: any) {
      notifError('Error', err?.response?.data?.error);
    }
  };

  const verDetalle = async (id: string) => {
    const liq = await servicioLiquidaciones.obtener(id);
    setModalDetalle(liq);
  };

  const meses = Array.from({ length: 12 }, (_, i) => ({ valor: String(i + 1), etiqueta: nombreMes(i + 1) }));
  const anios = [String(anioActual - 1), String(anioActual), String(anioActual + 1)].map((a) => ({ valor: a, etiqueta: a }));

  return (
    <div className="animar-aparecer">
      <EncabezadoPagina
        titulo="Liquidaciones"
        subtitulo={`${liquidaciones.length} liquidaciones`}
        acciones={
          <Boton icono={<Plus size={16} />} onClick={() => setModalNueva(true)}>
            Nueva liquidación
          </Boton>
        }
      />

      {/* Filtros */}
      <Tarjeta className="mb-5">
        <div className="flex items-center gap-3">
          <SelectCampo
            value={filtros.anio}
            onChange={(e) => setFiltros((p) => ({ ...p, anio: e.target.value }))}
            opciones={anios}
            className="w-28"
          />
          <SelectCampo
            value={filtros.mes}
            onChange={(e) => setFiltros((p) => ({ ...p, mes: e.target.value }))}
            placeholder="Todos los meses"
            opciones={meses}
            className="w-44"
          />
        </div>
      </Tarjeta>

      {/* Tabla */}
      {cargando ? <Cargando /> : liquidaciones.length === 0 ? (
        <EstadoVacio
          titulo="Sin liquidaciones"
          descripcion="Generá la primera liquidación del período."
          icono={<FileText size={22} />}
          accion={<Boton icono={<Plus size={15} />} onClick={() => setModalNueva(true)}>Nueva liquidación</Boton>}
        />
      ) : (
        <Tarjeta padding="ninguno">
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#f3f4f6]">
                <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Empleado</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Período</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Salario base</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">IPS emp.</th>
                <th className="text-right px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Neto</th>
                <th className="text-left px-4 py-3.5 text-xs font-semibold text-[#6b7280] uppercase tracking-wider">Estado</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f9fafb]">
              {liquidaciones.map((liq) => (
                <tr key={liq.id} className="hover:bg-[#fafafa] transition-colors group">
                  <td className="px-5 py-3.5">
                    <p className="text-sm font-medium text-[#111827]">{liq.empleado_nombre}</p>
                    {liq.numero_empleado && <p className="text-xs text-[#9ca3af]">{liq.numero_empleado}</p>}
                  </td>
                  <td className="px-4 py-3.5 text-sm text-[#374151]">{formatearPeriodo(liq.periodo)}</td>
                  <td className="px-4 py-3.5 text-sm text-right text-[#374151]">{formatearMoneda(liq.salario_base)}</td>
                  <td className="px-4 py-3.5 text-sm text-right text-[#ef4444]">{formatearMoneda(liq.ips_empleado)}</td>
                  <td className="px-4 py-3.5 text-right">
                    <span className="text-sm font-bold text-[#111827]">{formatearMoneda(liq.salario_neto)}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <Insignia color={liq.estado === 'aprobado' ? 'verde' : 'amarillo'} punto>
                      {liq.estado === 'aprobado' ? 'Aprobada' : 'Borrador'}
                    </Insignia>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => verDetalle(liq.id)} className="p-1.5 rounded-lg hover:bg-[#f3f4f6] text-[#6b7280]" title="Ver detalle">
                        <Eye size={15} />
                      </button>
                      {liq.estado === 'borrador' && (
                        <button
                          onClick={() => aprobar(liq.id, liq.empleado_nombre)}
                          className="p-1.5 rounded-lg hover:bg-[#d1fae5] text-[#10b981]"
                          title="Aprobar"
                        >
                          <CheckCircle size={15} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Tarjeta>
      )}

      {/* Modal nueva liquidación */}
      <Modal
        abierto={modalNueva}
        alCerrar={() => { setModalNueva(false); setPreview(null); }}
        titulo="Nueva liquidación"
        subtitulo="Seleccioná el empleado y período"
        tamanio="lg"
        pie={
          <>
            <Boton variante="secundario" onClick={() => { setModalNueva(false); setPreview(null); }}>Cancelar</Boton>
            <Boton cargando={guardando} onClick={generarLiquidacion} disabled={!preview}>
              Generar liquidación
            </Boton>
          </>
        }
      >
        <div className="grid grid-cols-2 gap-5">
          <div className="flex flex-col gap-4">
            <CampoFormulario etiqueta="Empleado" requerido>
              <SelectCampo
                value={formNueva.empleadoId}
                onChange={(e) => setFormNueva((p) => ({ ...p, empleadoId: e.target.value }))}
                placeholder="Seleccionar empleado"
                opciones={empleados.map((e: any) => ({ valor: e.id, etiqueta: `${e.nombre} ${e.apellido}` }))}
              />
            </CampoFormulario>
            <div className="grid grid-cols-2 gap-3">
              <CampoFormulario etiqueta="Año">
                <SelectCampo value={formNueva.anio} onChange={(e) => setFormNueva((p) => ({ ...p, anio: e.target.value }))} opciones={anios} />
              </CampoFormulario>
              <CampoFormulario etiqueta="Mes">
                <SelectCampo value={formNueva.mes} onChange={(e) => setFormNueva((p) => ({ ...p, mes: e.target.value }))} placeholder="Mes" opciones={meses} />
              </CampoFormulario>
            </div>
            <CampoFormulario etiqueta="Bonos adicionales (Gs.)" ayuda="Monto extra a sumar al salario bruto">
              <InputTexto type="number" value={formNueva.bonos} onChange={(e) => setFormNueva((p) => ({ ...p, bonos: e.target.value }))} />
            </CampoFormulario>
            <CampoFormulario etiqueta="Descuentos adicionales (Gs.)" ayuda="Monto a descontar del salario bruto">
              <InputTexto type="number" value={formNueva.descuentos} onChange={(e) => setFormNueva((p) => ({ ...p, descuentos: e.target.value }))} />
            </CampoFormulario>
          </div>

          {/* Preview */}
          <div>
            <p className="text-sm font-medium text-[#374151] mb-3">Vista previa</p>
            {cargandoPreview ? (
              <div className="flex items-center justify-center h-48"><div className="w-6 h-6 border-2 border-[#e5e7eb] border-t-[#6366f1] rounded-full animate-spin" /></div>
            ) : preview ? (
              <div className="bg-[#f9fafb] rounded-xl p-4 flex flex-col gap-2.5">
                <FilaPreview etiqueta="Salario base" valor={formatearMoneda(preview.salario_base || preview.salarioBase)} />
                <FilaPreview etiqueta="Horas extra" valor={`+${formatearMoneda(preview.horas_extra_monto || preview.horasExtraMonto || 0)}`} color="text-[#10b981]" />
                {(preview.bonos || 0) > 0 && <FilaPreview etiqueta="Bonos" valor={`+${formatearMoneda(preview.bonos || 0)}`} color="text-[#10b981]" />}
                <FilaPreview etiqueta="Ausencias" valor={`-${formatearMoneda(preview.ausencias_monto || preview.ausenciasMonto || 0)}`} color="text-[#ef4444]" />
                <div className="border-t border-[#e5e7eb] pt-2">
                  <FilaPreview etiqueta="Salario bruto" valor={formatearMoneda(preview.salario_bruto || preview.salarioBruto || 0)} negrita />
                </div>
                <FilaPreview etiqueta="IPS empleado (9%)" valor={`-${formatearMoneda(preview.ips_empleado || preview.ipsEmpleado || 0)}`} color="text-[#ef4444]" />
                <div className="border-t-2 border-[#6366f1] pt-2 mt-1">
                  <FilaPreview etiqueta="Salario neto" valor={formatearMoneda(preview.salario_neto || preview.salarioNeto || 0)} negrita grande />
                </div>
                <p className="text-xs text-[#9ca3af] mt-1">
                  IPS patronal: {formatearMoneda(preview.ips_patronal || preview.ipsPatronal || 0)} (16.5%)
                </p>
              </div>
            ) : (
              <div className="h-48 flex items-center justify-center text-sm text-[#9ca3af] text-center bg-[#f9fafb] rounded-xl">
                Seleccioná un empleado y período para ver la vista previa
              </div>
            )}
          </div>
        </div>
      </Modal>

      {/* Modal detalle */}
      {modalDetalle && (
        <Modal
          abierto={!!modalDetalle}
          alCerrar={() => setModalDetalle(null)}
          titulo="Detalle de liquidación"
          subtitulo={`${modalDetalle.empleado_nombre} — ${formatearPeriodo(modalDetalle.periodo)}`}
          tamanio="md"
          pie={<Boton variante="secundario" onClick={() => setModalDetalle(null)}>Cerrar</Boton>}
        >
          <div className="flex flex-col gap-3">
            {(Array.isArray(modalDetalle.detalles) ? modalDetalle.detalles : []).map((det: any, i: number) => (
              <div key={i} className="flex justify-between items-center py-2 border-b border-[#f3f4f6] last:border-0">
                <span className="text-sm text-[#374151]">{det.concepto}</span>
                <span className={`text-sm font-medium ${det.tipo === 'descuento' ? 'text-[#ef4444]' : 'text-[#111827]'}`}>
                  {det.tipo === 'descuento' ? '-' : '+'}{formatearMoneda(det.monto)}
                </span>
              </div>
            ))}
            <div className="flex justify-between items-center pt-2 mt-1 border-t-2 border-[#6366f1]">
              <span className="font-semibold text-[#111827]">Salario neto</span>
              <span className="text-lg font-bold text-[#6366f1]">{formatearMoneda(modalDetalle.salario_neto)}</span>
            </div>
            <p className="text-xs text-[#9ca3af]">IPS patronal (16.5%): {formatearMoneda(modalDetalle.ips_patronal)}</p>
          </div>
        </Modal>
      )}
    </div>
  );
}

function FilaPreview({ etiqueta, valor, color, negrita, grande }: { etiqueta: string; valor: string; color?: string; negrita?: boolean; grande?: boolean }) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-sm ${negrita ? 'font-medium text-[#374151]' : 'text-[#6b7280]'}`}>{etiqueta}</span>
      <span className={`${grande ? 'text-base' : 'text-sm'} ${negrita ? 'font-bold' : 'font-medium'} ${color || 'text-[#111827]'}`}>{valor}</span>
    </div>
  );
}
