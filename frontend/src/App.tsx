import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProveedor } from './contextos/AuthContexto';
import { NotificacionProveedor } from './componentes/ui/Notificacion';
import Layout from './componentes/layout/Layout';
import Login from './paginas/Login';
import Dashboard from './paginas/Dashboard';
import Empleados from './paginas/Empleados';
import EmpleadoDetalle from './paginas/EmpleadoDetalle';
import EmpleadoFormulario from './paginas/EmpleadoFormulario';
import Asistencia from './paginas/Asistencia';
import Vacaciones from './paginas/Vacaciones';
import Liquidaciones from './paginas/Liquidaciones';
import Recibos from './paginas/Recibos';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProveedor>
        <NotificacionProveedor>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route element={<Layout />}>
              <Route path="/" element={<Dashboard />} />
              <Route path="/empleados" element={<Empleados />} />
              <Route path="/empleados/nuevo" element={<EmpleadoFormulario />} />
              <Route path="/empleados/:id" element={<EmpleadoDetalle />} />
              <Route path="/empleados/:id/editar" element={<EmpleadoFormulario />} />
              <Route path="/asistencia" element={<Asistencia />} />
              <Route path="/vacaciones" element={<Vacaciones />} />
              <Route path="/liquidaciones" element={<Liquidaciones />} />
              <Route path="/recibos" element={<Recibos />} />
            </Route>
          </Routes>
        </NotificacionProveedor>
      </AuthProveedor>
    </BrowserRouter>
  );
}
