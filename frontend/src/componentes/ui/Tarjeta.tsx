import React from 'react';

interface TarjetaProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'sm' | 'md' | 'lg' | 'ninguno';
  onClick?: () => void;
  hoverable?: boolean;
}

const estilosPadding = {
  sm:     'p-4',
  md:     'p-5',
  lg:     'p-6',
  ninguno: '',
};

export default function Tarjeta({
  children, className = '', padding = 'md', onClick, hoverable = false,
}: TarjetaProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white rounded-xl border border-[#e5e7eb] shadow-sm
        ${estilosPadding[padding]}
        ${hoverable ? 'cursor-pointer hover:shadow-md hover:border-[#a5b4fc] transition-all duration-150' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
}

interface TarjetaEncabezadoProps {
  titulo: string;
  subtitulo?: string;
  accion?: React.ReactNode;
  icono?: React.ReactNode;
}

export function TarjetaEncabezado({ titulo, subtitulo, accion, icono }: TarjetaEncabezadoProps) {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-center gap-3">
        {icono && (
          <div className="w-9 h-9 rounded-lg bg-[#eef2ff] flex items-center justify-center text-[#4f46e5]">
            {icono}
          </div>
        )}
        <div>
          <h3 className="font-semibold text-[#111827]" style={{ fontSize: '0.9375rem' }}>{titulo}</h3>
          {subtitulo && <p className="text-xs text-[#6b7280] mt-0.5">{subtitulo}</p>}
        </div>
      </div>
      {accion && <div>{accion}</div>}
    </div>
  );
}
