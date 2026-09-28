import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';

type TipoNota = 'exito' | 'error' | 'info' | 'advertencia';

interface Nota {
  id: string;
  tipo: TipoNota;
  titulo: string;
  mensaje?: string;
}

interface NotificacionContextoTipo {
  mostrar: (tipo: TipoNota, titulo: string, mensaje?: string) => void;
  exito: (titulo: string, mensaje?: string) => void;
  error: (titulo: string, mensaje?: string) => void;
  info: (titulo: string, mensaje?: string) => void;
}

const NotificacionContexto = createContext<NotificacionContextoTipo | null>(null);

const estilos: Record<TipoNota, { fondo: string; icono: React.ReactNode; borde: string }> = {
  exito:       { fondo: 'bg-[#ecfdf5]', borde: 'border-[#a7f3d0]', icono: <CheckCircle size={18} className="text-[#10b981]" /> },
  error:       { fondo: 'bg-[#fef2f2]', borde: 'border-[#fecaca]', icono: <AlertCircle size={18} className="text-[#ef4444]" /> },
  info:        { fondo: 'bg-[#eff6ff]', borde: 'border-[#bfdbfe]', icono: <Info size={18} className="text-[#3b82f6]" /> },
  advertencia: { fondo: 'bg-[#fffbeb]', borde: 'border-[#fde68a]', icono: <AlertCircle size={18} className="text-[#f59e0b]" /> },
};

export function NotificacionProveedor({ children }: { children: React.ReactNode }) {
  const [notas, setNotas] = useState<Nota[]>([]);

  const mostrar = useCallback((tipo: TipoNota, titulo: string, mensaje?: string) => {
    const id = Math.random().toString(36).slice(2);
    setNotas((prev) => [...prev, { id, tipo, titulo, mensaje }]);
    setTimeout(() => setNotas((prev) => prev.filter((n) => n.id !== id)), 4000);
  }, []);

  const exito = useCallback((t: string, m?: string) => mostrar('exito', t, m), [mostrar]);
  const error = useCallback((t: string, m?: string) => mostrar('error', t, m), [mostrar]);
  const info  = useCallback((t: string, m?: string) => mostrar('info', t, m), [mostrar]);

  const cerrar = (id: string) => setNotas((prev) => prev.filter((n) => n.id !== id));

  return (
    <NotificacionContexto.Provider value={{ mostrar, exito, error, info }}>
      {children}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 w-80">
        {notas.map((nota) => {
          const s = estilos[nota.tipo];
          return (
            <div
              key={nota.id}
              className={`${s.fondo} ${s.borde} border rounded-xl p-4 shadow-lg flex items-start gap-3 animar-aparecer`}
            >
              <div className="flex-shrink-0 mt-0.5">{s.icono}</div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[#111827]">{nota.titulo}</p>
                {nota.mensaje && <p className="text-xs text-[#6b7280] mt-0.5">{nota.mensaje}</p>}
              </div>
              <button onClick={() => cerrar(nota.id)} className="text-[#9ca3af] hover:text-[#374151]">
                <X size={16} />
              </button>
            </div>
          );
        })}
      </div>
    </NotificacionContexto.Provider>
  );
}

export function useNotificacion() {
  const ctx = useContext(NotificacionContexto);
  if (!ctx) throw new Error('useNotificacion debe usarse dentro de NotificacionProveedor');
  return ctx;
}
