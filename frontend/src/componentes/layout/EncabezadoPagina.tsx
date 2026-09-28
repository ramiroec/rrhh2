import React from 'react';

interface EncabezadoPaginaProps {
  titulo: string;
  subtitulo?: string;
  acciones?: React.ReactNode;
  migas?: { etiqueta: string; href?: string }[];
}

export default function EncabezadoPagina({ titulo, subtitulo, acciones, migas }: EncabezadoPaginaProps) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        {migas && migas.length > 0 && (
          <div className="flex items-center gap-1.5 mb-1">
            {migas.map((m, i) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="text-[#d1d5db]">/</span>}
                <span className="text-xs text-[#9ca3af]">{m.etiqueta}</span>
              </React.Fragment>
            ))}
          </div>
        )}
        <h1 className="text-2xl font-bold text-[#111827] tracking-tight">{titulo}</h1>
        {subtitulo && <p className="text-sm text-[#6b7280] mt-1">{subtitulo}</p>}
      </div>
      {acciones && (
        <div className="flex items-center gap-2 mt-1">
          {acciones}
        </div>
      )}
    </div>
  );
}
