import { useEffect, useState, useCallback } from 'react';
import { Receipt, Eye, Building2, User } from 'lucide-react';
import { servicioRecibos, servicioEmpleados } from '../servicios/api';
import Tarjeta from '../componentes/ui/Tarjeta';
import Insignia from '../componentes/ui/Insignia';
import EstadoVacio, { Cargando } from '../componentes/ui/EstadoVacio';
import Modal from '../componentes/ui/Modal';
import CampoFormulario, { SelectCampo } from '../componentes/ui/CampoFormulario';
import EncabezadoPagina from '../componentes/layout/EncabezadoPagina';
import Boton from '../componentes/ui/Boton';
import { formatearMoneda, formatearPeriodo, formatearFecha, nombreMes } from '../utilidades/formato';

export default function Recibos() {
  const [recibos, setRecibos] = useState<any[]>([]);
  const [cargando, setCargando] = useState(true);
  const [empleados, setEmpleados] = useState<any[]>([]);
  const [reciboDetalle, setReciboDetalle] = useState<any>(null);
  const [cargandoDetalle, setCargandoDetalle] = useState(false);

  const anioActual = new Date().getFullYear();
  const [filtros, setFiltros] = useState({ empleadoId: '', anio: String(anioActual) });

  const cargar = useCallback(async () => {
    setCargando(true);
    try {
      const res = await servicioRecibos.listar({
        empleadoId: filtros.empleadoId || undefined,
        anio: filtros.anio || undefined,
      });
      setRecibos(res);
    } finally {
      setCargando(false);
    }
  }, [filtros]);

  useEffect(() => { cargar(); }, [cargar]);

  useEffect(() => {
    servicioEmpleados.listar({ limite: 200 }).then((r) => setEmpleados(r.empleados || []));
  }, []);

  const verDetalle = async (id: string) => {
    setCargandoDetalle(true);
    try {
      const recibo = await servicioRecibos.obtener(id);
      setReciboDetalle(recibo);
    } finally {
      setCargandoDetalle(false);
    }
  };

  const anios = [String(anioActual - 1), String(anioActual)].map((a) => ({ valor: a, etiqueta: a }));

  return (
    <div className="animar-aparecer">
      <EncabezadoPagina
        titulo="Recibos de sueldo"
        subtitulo={`${recibos.length} recibos emitidos`}
      />

      {/* Filtros */}
      <Tarjeta className="mb-5">
        <div className="flex items-center gap-3">
          <CampoFormulario etiqueta="" className="flex-1 max-w-64">
            <SelectCampo
              value={filtros.empleadoId}
              onChange={(e) => setFiltros((p) => ({ ...p, empleadoId: e.target.value }))}
              placeholder="Todos los empleados"
              opciones={empleados.map((e: any) => ({ valor: e.id, etiqueta: `${e.nombre} ${e.apellido}` }))}
            />
          </CampoFormulario>
          <CampoFormulario etiqueta="" className="w-28">
            <SelectCampo
              value={filtros.anio}
              onChange={(e) => setFiltros((p) => ({ ...p, anio: e.target.value }))}
              opciones={anios}
            />
          </CampoFormulario>
        </div>
      </Tarjeta>

      {/* Grilla de recibos */}
      {cargando ? <Cargando /> : recibos.length === 0 ? (
        <EstadoVacio
          titulo="Sin recibos emitidos"
          descripcion="Los recibos se generan automáticamente al aprobar una liquidación."
          icono={<Receipt size={22} />}
        />
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {recibos.map((recibo) => (
            <Tarjeta
              key={recibo.id}
              hoverable
              onClick={() => verDetalle(recibo.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-[#eef2ff] flex items-center justify-center">
                    <Receipt size={16} className="text-[#6366f1]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#111827]">{formatearPeriodo(recibo.periodo)}</p>
                    <p className="text-xs text-[#9ca3af]">{recibo.numero}</p>
                  </div>
                </div>
                <Insignia color="verde" punto>Emitido</Insignia>
              </div>

              <div className="flex items-center gap-2 mb-3">
                <User size={13} className="text-[#9ca3af]" />
                <span className="text-sm text-[#374151] font-medium">{recibo.empleado_nombre}</span>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#f3f4f6]">
                <span className="text-xs text-[#9ca3af]">Salario neto</span>
                <span className="text-base font-bold text-[#111827]">{formatearMoneda(recibo.salario_neto)}</span>
              </div>

              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-[#9ca3af]">Emitido</span>
                <span className="text-xs text-[#6b7280]">{formatearFecha(recibo.emitido_en)}</span>
              </div>
            </Tarjeta>
          ))}
        </div>
      )}

      {/* Modal detalle recibo */}
      <Modal
        abierto={!!reciboDetalle}
        alCerrar={() => setReciboDetalle(null)}
        titulo="Recibo de sueldo"
        subtitulo={reciboDetalle ? `${reciboDetalle.empleado_nombre} — ${formatearPeriodo(reciboDetalle.periodo)}` : ''}
        tamanio="md"
        pie={<Boton variante="secundario" onClick={() => setReciboDetalle(null)}>Cerrar</Boton>}
      >
        {cargandoDetalle ? (
          <div className="flex justify-center py-8"><div className="w-6 h-6 border-2 border-[#e5e7eb] border-t-[#6366f1] rounded-full animate-spin" /></div>
        ) : reciboDetalle ? (
          <ReciboImprimible recibo={reciboDetalle} />
        ) : null}
      </Modal>
    </div>
  );
}

function ReciboImprimible({ recibo }: { recibo: any }) {
  const detalles = Array.isArray(recibo.detalles)
    ? recibo.detalles
    : typeof recibo.detalles === 'string'
      ? (() => { try { return JSON.parse(recibo.detalles); } catch { return []; } })()
      : [];

  return (
    <div className="font-mono text-sm">
      {/* Encabezado empresa */}
      <div className="flex items-start justify-between mb-6 pb-4 border-b-2 border-[#111827]">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Building2 size={16} className="text-[#6366f1]" />
            <span className="font-bold text-[#111827] text-base">{recibo.empresa_nombre || 'TEKI Solutions S.A.'}</span>
          </div>
          {recibo.empresa_rut && <p className="text-xs text-[#6b7280]">RUT: {recibo.empresa_rut}</p>}
        </div>
        <div className="text-right">
          <p className="font-bold text-[#6366f1]">RECIBO DE SUELDO</p>
          <p className="text-xs text-[#6b7280]">N° {recibo.numero}</p>
          <p className="text-xs text-[#6b7280]">{formatearPeriodo(recibo.periodo)}</p>
        </div>
      </div>

      {/* Datos empleado */}
      <div className="bg-[#f9fafb] rounded-lg p-4 mb-5">
        <div className="grid grid-cols-2 gap-x-8 gap-y-2">
          <FilaRecibo etiqueta="Empleado" valor={recibo.empleado_nombre} />
          <FilaRecibo etiqueta="Cédula" valor={recibo.empleado_cedula || '—'} />
          <FilaRecibo etiqueta="Cargo" valor={recibo.cargo_nombre || '—'} />
          <FilaRecibo etiqueta="Departamento" valor={recibo.departamento_nombre || '—'} />
        </div>
      </div>

      {/* Conceptos */}
      <div className="mb-4">
        <div className="flex justify-between text-xs font-semibold text-[#6b7280] uppercase tracking-wider pb-2 border-b border-[#e5e7eb]">
          <span>Concepto</span>
          <span>Monto</span>
        </div>
        <div className="divide-y divide-[#f3f4f6]">
          {detalles.length > 0 ? (
            detalles.map((det: any, i: number) => (
              <div key={i} className="flex justify-between py-2">
                <span className="text-[#374151]">{det.concepto}</span>
                <span className={det.tipo === 'descuento' ? 'text-[#ef4444]' : 'text-[#111827]'}>
                  {det.tipo === 'descuento' ? '-' : '+'}{formatearMoneda(det.monto)}
                </span>
              </div>
            ))
          ) : (
            <>
              <div className="flex justify-between py-2">
                <span className="text-[#374151]">Salario base</span>
                <span className="text-[#111827]">+{formatearMoneda(recibo.salario_base || 0)}</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-[#374151]">IPS empleado (9%)</span>
                <span className="text-[#ef4444]">-{formatearMoneda(recibo.ips_empleado || 0)}</span>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Totales */}
      <div className="bg-[#eef2ff] rounded-lg p-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-[#374151]">Salario bruto</span>
          <span className="text-sm font-medium">{formatearMoneda(recibo.salario_bruto || 0)}</span>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-[#c7d2fe]">
          <span className="font-bold text-[#111827]">SALARIO NETO A PAGAR</span>
          <span className="text-xl font-bold text-[#6366f1]">{formatearMoneda(recibo.salario_neto || 0)}</span>
        </div>
      </div>

      <p className="text-xs text-center text-[#9ca3af] mt-5">
        Emitido el {formatearFecha(recibo.emitido_en)} · IPS patronal: {formatearMoneda(recibo.ips_patronal || 0)}
      </p>
    </div>
  );
}

function FilaRecibo({ etiqueta, valor }: { etiqueta: string; valor: string }) {
  return (
    <div>
      <span className="text-xs text-[#9ca3af]">{etiqueta}: </span>
      <span className="text-sm text-[#111827] font-medium">{valor}</span>
    </div>
  );
}
