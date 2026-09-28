import React from 'react';
import { Inbox } from 'lucide-react';

interface EstadoVacioProps {
  titulo?: string;
  descripcion?: string;
  icono?: React.ReactNode;
  accion?: React.ReactNode;
}

export default function EstadoVacio({
  titulo = 'Sin resultados',
  descripcion = 'No hay datos para mostrar.',
  icono,
  accion,
}: EstadoVacioProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-[#f3f4f6] flex items-center justify-center mb-4 text-[#9ca3af]">
        {icono || <Inbox size={24} />}
      </div>
      <h3 className="font-medium text-[#374151] mb-1">{titulo}</h3>
      <p className="text-sm text-[#9ca3af] max-w-xs">{descripcion}</p>
      {accion && <div className="mt-4">{accion}</div>}
    </div>
  );
}

export function Cargando({ texto = 'Cargando...' }: { texto?: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-8 h-8 border-2 border-[#e5e7eb] border-t-[#6366f1] rounded-full animate-spin" />
      <p className="text-sm text-[#9ca3af]">{texto}</p>
    </div>
  );
}

export function ErrorCarga({ mensaje = 'Ocurrió un error', reintentar }: { mensaje?: string; reintentar?: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-3">
      <div className="w-12 h-12 rounded-full bg-[#fee2e2] flex items-center justify-center text-[#ef4444]">
        <span className="text-xl font-bold">!</span>
      </div>
      <p className="text-sm text-[#4b5563]">{mensaje}</p>
      {reintentar && (
        <button onClick={reintentar} className="text-sm text-[#6366f1] hover:underline">
          Reintentar
        </button>
      )}
    </div>
  );
}
