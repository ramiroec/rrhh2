import React from 'react';

interface CampoFormularioProps {
  etiqueta: string;
  error?: string;
  requerido?: boolean;
  ayuda?: string;
  children: React.ReactNode;
  className?: string;
}

export default function CampoFormulario({
  etiqueta, error, requerido, ayuda, children, className = '',
}: CampoFormularioProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-sm font-medium text-[#374151]">
        {etiqueta}
        {requerido && <span className="text-[#ef4444] ml-0.5">*</span>}
      </label>
      {children}
      {ayuda && !error && <p className="text-xs text-[#9ca3af]">{ayuda}</p>}
      {error && <p className="text-xs text-[#ef4444]">{error}</p>}
    </div>
  );
}

// Estilos base compartidos para inputs
export const estilosInput = `
  w-full px-3 py-2 text-sm rounded-lg border border-[#e5e7eb] bg-white
  text-[#111827] placeholder-[#9ca3af]
  focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-[#6366f1]
  disabled:bg-[#f9fafb] disabled:text-[#9ca3af] disabled:cursor-not-allowed
  transition-colors duration-150
`;

export const estilosInputError = `
  border-[#fca5a5] focus:ring-[#fca5a5] focus:border-[#ef4444]
`;

interface InputTextoProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

export function InputTexto({ error, className = '', ...props }: InputTextoProps) {
  return (
    <input
      className={`${estilosInput} ${error ? estilosInputError : ''} ${className}`}
      {...props}
    />
  );
}

interface SelectCampoProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  error?: boolean;
  opciones: { valor: string | number; etiqueta: string }[];
  placeholder?: string;
}

export function SelectCampo({ error, opciones, placeholder, className = '', ...props }: SelectCampoProps) {
  return (
    <select
      className={`${estilosInput} ${error ? estilosInputError : ''} ${className}`}
      {...props}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {opciones.map((op) => (
        <option key={op.valor} value={op.valor}>{op.etiqueta}</option>
      ))}
    </select>
  );
}

interface TextAreaCampoProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
}

export function TextAreaCampo({ error, className = '', ...props }: TextAreaCampoProps) {
  return (
    <textarea
      className={`${estilosInput} ${error ? estilosInputError : ''} resize-none ${className}`}
      {...props}
    />
  );
}
