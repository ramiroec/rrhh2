import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { Building2, Eye, EyeOff, LogIn } from 'lucide-react';
import { useAuth } from '../contextos/AuthContexto';
import Boton from '../componentes/ui/Boton';

export default function Login() {
  const [email, setEmail] = useState('admin@teki.com.py');
  const [password, setPassword] = useState('admin123');
  const [verPassword, setVerPassword] = useState(false);
  const [cargando, setCargando] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const { login, estaAutenticado } = useAuth();

  if (estaAutenticado) return <Navigate to="/" replace />;

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setErrorMsg('Completá todos los campos'); return; }
    setCargando(true);
    setErrorMsg('');
    try {
      await login(email, password);
    } catch (err: any) {
      setErrorMsg(err?.response?.data?.error || 'Credenciales incorrectas');
    } finally {
      setCargando(false);
    }
  };

  return (
    <div
      className="min-h-screen flex"
      style={{
        background: 'linear-gradient(135deg, #16172a 0%, #1e1f3a 50%, #16172a 100%)',
      }}
    >
      {/* Panel izquierdo decorativo */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 p-12">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center">
            <Building2 size={18} className="text-white" />
          </div>
          <span className="text-white font-bold text-xl tracking-tight">TEKI</span>
          <span className="text-[rgba(255,255,255,0.4)] text-sm font-medium">Recursos Humanos</span>
        </div>

        <div>
          <h1 className="text-4xl font-bold text-white mb-4 leading-tight">
            Gestión de RRHH
            <br />
            <span style={{ color: '#a5b4fc' }}>moderna y eficiente</span>
          </h1>
          <p className="text-[rgba(255,255,255,0.5)] text-base leading-relaxed max-w-md">
            Administrá empleados, asistencia, vacaciones y liquidaciones desde un solo lugar.
          </p>

          <div className="flex flex-col gap-3 mt-8">
            {[
              'Registro de asistencia y horas extra',
              'Gestión de vacaciones y licencias',
              'Liquidaciones con cálculo de IPS',
              'Recibos de sueldo digitales',
            ].map((f) => (
              <div key={f} className="flex items-center gap-2.5">
                <div className="w-1.5 h-1.5 rounded-full bg-[#6366f1]" />
                <span className="text-[rgba(255,255,255,0.6)] text-sm">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="text-[rgba(255,255,255,0.2)] text-xs">© 2026 TEKI Solutions. Todos los derechos reservados.</p>
      </div>

      {/* Panel derecho: formulario */}
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden justify-center">
            <div className="w-9 h-9 rounded-xl bg-[#6366f1] flex items-center justify-center">
              <Building2 size={18} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">TEKI RRHH</span>
          </div>

          <div className="bg-white rounded-2xl p-8 shadow-2xl">
            <div className="mb-7">
              <h2 className="text-2xl font-bold text-[#111827]">Iniciar sesión</h2>
              <p className="text-sm text-[#6b7280] mt-1">Ingresá tus credenciales para continuar</p>
            </div>

            <form onSubmit={handleLogin} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#374151]">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@empresa.com"
                  autoComplete="email"
                  className="w-full px-3 py-2.5 text-sm rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-[#6366f1]"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-medium text-[#374151]">Contraseña</label>
                <div className="relative">
                  <input
                    type={verPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="w-full px-3 py-2.5 pr-10 text-sm rounded-lg border border-[#e5e7eb] focus:outline-none focus:ring-2 focus:ring-[#a5b4fc] focus:border-[#6366f1]"
                  />
                  <button
                    type="button"
                    onClick={() => setVerPassword(!verPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#9ca3af] hover:text-[#374151]"
                  >
                    {verPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="bg-[#fef2f2] border border-[#fecaca] rounded-lg px-4 py-3">
                  <p className="text-sm text-[#dc2626]">{errorMsg}</p>
                </div>
              )}

              <Boton
                type="submit"
                completo
                cargando={cargando}
                icono={<LogIn size={16} />}
                tamanio="lg"
                className="mt-2"
              >
                Ingresar
              </Boton>
            </form>

            <div className="mt-5 pt-4 border-t border-[#f3f4f6]">
              <p className="text-xs text-[#9ca3af] text-center">Cuenta de demo</p>
              <div className="flex gap-2 mt-2">
                <div className="flex-1 bg-[#f9fafb] rounded-lg px-3 py-2">
                  <p className="text-xs text-[#9ca3af]">Email</p>
                  <p className="text-xs font-medium text-[#374151]">admin@teki.com.py</p>
                </div>
                <div className="flex-1 bg-[#f9fafb] rounded-lg px-3 py-2">
                  <p className="text-xs text-[#9ca3af]">Contraseña</p>
                  <p className="text-xs font-medium text-[#374151]">admin123</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
