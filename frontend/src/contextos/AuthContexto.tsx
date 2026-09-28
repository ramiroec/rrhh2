import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { servicioAuth } from '../servicios/api';
import { Usuario } from '../tipos';

interface AuthContextoTipo {
  usuario: Usuario | null;
  cargando: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  estaAutenticado: boolean;
}

const AuthContexto = createContext<AuthContextoTipo | null>(null);

export function AuthProveedor({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargando, setCargando] = useState(true);

  const cargarUsuario = useCallback(async () => {
    const token = localStorage.getItem('teki_token');
    if (!token) { setCargando(false); return; }
    try {
      const datos = await servicioAuth.perfil();
      setUsuario({
        id: datos.id,
        nombre: datos.nombre,
        email: datos.email,
        rol: datos.rol,
        empresaId: datos.empresa_id,
        empresaNombre: datos.empresa_nombre,
      });
    } catch {
      localStorage.removeItem('teki_token');
      localStorage.removeItem('teki_usuario');
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => { cargarUsuario(); }, [cargarUsuario]);

  const login = async (email: string, password: string) => {
    const datos = await servicioAuth.login(email, password);
    localStorage.setItem('teki_token', datos.token);
    setUsuario(datos.usuario);
  };

  const logout = () => {
    localStorage.removeItem('teki_token');
    localStorage.removeItem('teki_usuario');
    setUsuario(null);
  };

  return (
    <AuthContexto.Provider value={{ usuario, cargando, login, logout, estaAutenticado: !!usuario }}>
      {children}
    </AuthContexto.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContexto);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProveedor');
  return ctx;
}
