import React from 'react';
import { Loader2 } from 'lucide-react';

type Variante = 'primario' | 'secundario' | 'fantasma' | 'peligro' | 'exito';
type Tamanio = 'sm' | 'md' | 'lg';

interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamanio?: Tamanio;
  cargando?: boolean;
  icono?: React.ReactNode;
  iconoDerecho?: React.ReactNode;
  completo?: boolean;
}

const estilosBase = `
  inline-flex items-center justify-center gap-2 font-medium rounded-lg
  transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1
  disabled:opacity-50 disabled:cursor-not-allowed select-none
`;

const estilosVariante: Record<Variante, string> = {
  primario:   'bg-[#4f46e5] text-white hover:bg-[#4338ca] focus:ring-[#4f46e5] shadow-sm',
  secundario: 'bg-white text-[#374151] border border-[#e5e7eb] hover:bg-[#f9fafb] focus:ring-[#4f46e5] shadow-sm',
  fantasma:   'bg-transparent text-[#4b5563] hover:bg-[#f3f4f6] focus:ring-[#4f46e5]',
  peligro:    'bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444] shadow-sm',
  exito:      'bg-[#10b981] text-white hover:bg-[#059669] focus:ring-[#10b981] shadow-sm',
};

const estilosTamanio: Record<Tamanio, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

export default function Boton({
  variante = 'primario',
  tamanio = 'md',
  cargando = false,
  icono,
  iconoDerecho,
  completo = false,
  children,
  disabled,
  className = '',
  ...props
}: BotonProps) {
  return (
    <button
      disabled={disabled || cargando}
      className={`${estilosBase} ${estilosVariante[variante]} ${estilosTamanio[tamanio]} ${completo ? 'w-full' : ''} ${className}`}
      style={{ lineHeight: 1.4 }}
      {...props}
    >
      {cargando ? <Loader2 size={16} className="animate-spin" /> : icono}
      {children}
      {!cargando && iconoDerecho}
    </button>
  );
}
