import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Users, Clock, Calendar, FileText, Receipt,
  LogOut, ChevronRight, Building2,
} from 'lucide-react';
import { useAuth } from '../../contextos/AuthContexto';

const navegacion = [
  { a: '/',             etiqueta: 'Inicio',       icono: LayoutDashboard },
  { a: '/empleados',    etiqueta: 'Empleados',     icono: Users },
  { a: '/asistencia',   etiqueta: 'Asistencia',    icono: Clock },
  { a: '/vacaciones',   etiqueta: 'Vacaciones',    icono: Calendar },
  { a: '/liquidaciones',etiqueta: 'Liquidaciones', icono: FileText },
  { a: '/recibos',      etiqueta: 'Recibos',       icono: Receipt },
];

export default function Sidebar() {
  const { usuario, logout } = useAuth();

  return (
    <aside
      className="flex flex-col w-60 flex-shrink-0 h-screen sticky top-0"
      style={{ backgroundColor: '#16172a', borderRight: '1px solid rgba(255,255,255,0.06)' }}
    >
      {/* Logo */}
      <div className="px-5 py-5 border-b" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#6366f1] flex items-center justify-center">
            <Building2 size={16} className="text-white" />
          </div>
          <div>
            <span className="font-bold text-white tracking-tight" style={{ fontSize: '1.0625rem' }}>TEKI</span>
            <span className="block text-xs font-medium" style={{ color: 'rgba(255,255,255,0.35)', lineHeight: 1 }}>Recursos Humanos</span>
          </div>
        </div>
      </div>

      {/* Empresa */}
      {usuario && (
        <div className="px-4 py-3 border-b mx-3 mt-3 rounded-lg" style={{ backgroundColor: 'rgba(255,255,255,0.04)', borderColor: 'rgba(255,255,255,0.06)' }}>
          <p className="text-xs font-medium truncar" style={{ color: 'rgba(255,255,255,0.5)' }}>Empresa</p>
          <p className="text-sm font-medium text-white truncar mt-0.5">{usuario.empresaNombre}</p>
        </div>
      )}

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 overflow-y-auto">
        <p className="text-xs font-semibold uppercase tracking-wider px-3 mb-2" style={{ color: 'rgba(255,255,255,0.25)' }}>
          Menú
        </p>
        <ul className="flex flex-col gap-0.5">
          {navegacion.map(({ a, etiqueta, icono: Icono }) => (
            <li key={a}>
              <NavLink
                to={a}
                end={a === '/'}
                className={({ isActive }) => `
                  flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
                  transition-all duration-150 group
                  ${isActive
                    ? 'text-white'
                    : 'text-[rgba(255,255,255,0.55)] hover:text-white hover:bg-[rgba(255,255,255,0.05)]'
                  }
                `}
                style={({ isActive }) => isActive ? {
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  color: '#a5b4fc',
                } : {}}
              >
                {({ isActive }) => (
                  <>
                    <Icono
                      size={17}
                      className={isActive ? 'text-[#a5b4fc]' : 'opacity-70 group-hover:opacity-100'}
                    />
                    <span className="flex-1">{etiqueta}</span>
                    {isActive && <ChevronRight size={14} className="text-[#6366f1] opacity-60" />}
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      {/* Usuario */}
      {usuario && (
        <div className="px-3 py-3 border-t" style={{ borderColor: 'rgba(255,255,255,0.06)' }}>
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-[#6366f1] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
              {usuario.nombre[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncar">{usuario.nombre}</p>
              <p className="text-xs truncar capitalize" style={{ color: 'rgba(255,255,255,0.4)' }}>{usuario.rol}</p>
            </div>
            <button
              onClick={logout}
              className="text-[rgba(255,255,255,0.3)] hover:text-[#ef4444] transition-colors p-1"
              title="Cerrar sesión"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
