import React, { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  abierto: boolean;
  alCerrar: () => void;
  titulo: string;
  subtitulo?: string;
  children: React.ReactNode;
  tamanio?: 'sm' | 'md' | 'lg' | 'xl';
  pie?: React.ReactNode;
}

const anchos = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };

export default function Modal({ abierto, alCerrar, titulo, subtitulo, children, tamanio = 'md', pie }: ModalProps) {
  useEffect(() => {
    if (abierto) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(17, 24, 39, 0.5)', backdropFilter: 'blur(2px)' }}
      onClick={(e) => { if (e.target === e.currentTarget) alCerrar(); }}
    >
      <div
        className={`bg-white rounded-2xl shadow-xl w-full ${anchos[tamanio]} flex flex-col max-h-[90vh] animar-aparecer`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado */}
        <div className="flex items-start justify-between px-6 py-5 border-b border-[#f3f4f6]">
          <div>
            <h2 className="font-semibold text-[#111827]" style={{ fontSize: '1.0625rem' }}>{titulo}</h2>
            {subtitulo && <p className="text-sm text-[#6b7280] mt-0.5">{subtitulo}</p>}
          </div>
          <button
            onClick={alCerrar}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#9ca3af] hover:bg-[#f3f4f6] hover:text-[#374151] transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Contenido */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {children}
        </div>

        {/* Pie */}
        {pie && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[#f3f4f6]">
            {pie}
          </div>
        )}
      </div>
    </div>
  );
}
