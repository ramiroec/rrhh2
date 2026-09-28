import { iniciales, colorAvatar } from '../../utilidades/formato';

interface AvatarProps {
  nombre: string;
  apellido?: string;
  src?: string;
  tamanio?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
}

const tamanios = {
  xs: { contenedor: 'w-6 h-6', texto: 'text-xs' },
  sm: { contenedor: 'w-8 h-8', texto: 'text-xs' },
  md: { contenedor: 'w-10 h-10', texto: 'text-sm' },
  lg: { contenedor: 'w-12 h-12', texto: 'text-base' },
  xl: { contenedor: 'w-16 h-16', texto: 'text-xl' },
};

export default function Avatar({ nombre, apellido, src, tamanio = 'md' }: AvatarProps) {
  const t = tamanios[tamanio];
  const color = colorAvatar(nombre + (apellido || ''));

  if (src) {
    return (
      <img
        src={src}
        alt={`${nombre} ${apellido || ''}`}
        className={`${t.contenedor} rounded-full object-cover flex-shrink-0`}
      />
    );
  }

  return (
    <div
      className={`${t.contenedor} ${t.texto} rounded-full flex items-center justify-center font-semibold text-white flex-shrink-0`}
      style={{ backgroundColor: color }}
    >
      {iniciales(nombre, apellido)}
    </div>
  );
}
