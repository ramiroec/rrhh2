import React from 'react';

type ColorInsignia = 'verde' | 'rojo' | 'amarillo' | 'azul' | 'gris' | 'morado' | 'naranja';

interface InsigniaProps {
  color?: ColorInsignia;
  children: React.ReactNode;
  punto?: boolean;
  className?: string;
}

const estilosColor: Record<ColorInsignia, string> = {
  verde:   'bg-[#d1fae5] text-[#065f46]',
  rojo:    'bg-[#fee2e2] text-[#7f1d1d]',
  amarillo:'bg-[#fef3c7] text-[#78350f]',
  azul:    'bg-[#dbeafe] text-[#1e3a5f]',
  gris:    'bg-[#f3f4f6] text-[#374151]',
  morado:  'bg-[#ede9fe] text-[#4c1d95]',
  naranja: 'bg-[#ffedd5] text-[#7c2d12]',
};

const coloresPunto: Record<ColorInsignia, string> = {
  verde:   'bg-[#10b981]',
  rojo:    'bg-[#ef4444]',
  amarillo:'bg-[#f59e0b]',
  azul:    'bg-[#3b82f6]',
  gris:    'bg-[#9ca3af]',
  morado:  'bg-[#8b5cf6]',
  naranja: 'bg-[#f97316]',
};

export default function Insignia({ color = 'gris', children, punto = false, className = '' }: InsigniaProps) {
  return (
    <span className={`
      inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium
      ${estilosColor[color]} ${className}
    `}>
      {punto && <span className={`w-1.5 h-1.5 rounded-full ${coloresPunto[color]}`} />}
      {children}
    </span>
  );
}

// Mapeadores de estado para empleados y solicitudes
export function colorEstadoEmpleado(estado: string): ColorInsignia {
  const mapa: Record<string, ColorInsignia> = {
    activo: 'verde', inactivo: 'gris', licencia: 'amarillo',
  };
  return mapa[estado] || 'gris';
}

export function colorEstadoSolicitud(estado: string): ColorInsignia {
  const mapa: Record<string, ColorInsignia> = {
    pendiente: 'amarillo', aprobado: 'verde', rechazado: 'rojo',
  };
  return mapa[estado] || 'gris';
}

export function colorEstadoAsistencia(estado: string): ColorInsignia {
  const mapa: Record<string, ColorInsignia> = {
    presente: 'verde', ausente: 'rojo', tardanza: 'amarillo',
    medio_dia: 'azul', feriado: 'morado',
  };
  return mapa[estado] || 'gris';
}

export function textoEstadoEmpleado(estado: string): string {
  const mapa: Record<string, string> = {
    activo: 'Activo', inactivo: 'Inactivo', licencia: 'En licencia',
  };
  return mapa[estado] || estado;
}

export function textoEstadoSolicitud(estado: string): string {
  const mapa: Record<string, string> = {
    pendiente: 'Pendiente', aprobado: 'Aprobado', rechazado: 'Rechazado',
  };
  return mapa[estado] || estado;
}

export function textoEstadoAsistencia(estado: string): string {
  const mapa: Record<string, string> = {
    presente: 'Presente', ausente: 'Ausente', tardanza: 'Tardanza',
    medio_dia: 'Medio día', feriado: 'Feriado',
  };
  return mapa[estado] || estado;
}
