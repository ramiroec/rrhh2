import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save } from 'lucide-react';
import { servicioEmpleados } from '../servicios/api';
import { Departamento, Cargo } from '../tipos';
import Tarjeta from '../componentes/ui/Tarjeta';
import Boton from '../componentes/ui/Boton';
import CampoFormulario, { InputTexto, SelectCampo, TextAreaCampo } from '../componentes/ui/CampoFormulario';
import EncabezadoPagina from '../componentes/layout/EncabezadoPagina';
import { useNotificacion } from '../componentes/ui/Notificacion';
import { Cargando } from '../componentes/ui/EstadoVacio';

interface FormEmpleado {
  nombre: string; apellido: string; cedula: string; email: string; telefono: string;
  fechaNacimiento: string; fechaIngreso: string; salario: string; tipoContrato: string;
  departamentoId: string; cargoId: string; direccion: string; ciudad: string;
  banco: string; numeroCuenta: string; notas: string; numeroEmpleado: string; estado: string;
}

const FORM_VACIO: FormEmpleado = {
  nombre: '', apellido: '', cedula: '', email: '', telefono: '',
  fechaNacimiento: '', fechaIngreso: new Date().toISOString().split('T')[0],
  salario: '', tipoContrato: 'indefinido', departamentoId: '', cargoId: '',
  direccion: '', ciudad: '', banco: '', numeroCuenta: '', notas: '',
  numeroEmpleado: '', estado: 'activo',
};

export default function EmpleadoFormulario() {
  const { id } = useParams<{ id?: string }>();
  const esEdicion = !!id;
  const [form, setForm] = useState<FormEmpleado>(FORM_VACIO);
  const [errores, setErrores] = useState<Partial<FormEmpleado>>({});
  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [cargos, setCargos] = useState<Cargo[]>([]);
  const [cargando, setCargando] = useState(esEdicion);
  const [guardando, setGuardando] = useState(false);
  const navigate = useNavigate();
  const { exito, error: notifError } = useNotificacion();

  useEffect(() => {
    Promise.all([
      servicioEmpleados.departamentos(),
      servicioEmpleados.cargos(),
    ]).then(([deps, cargs]) => {
      setDepartamentos(deps);
      setCargos(cargs);
    });

    if (esEdicion && id) {
      servicioEmpleados.obtener(id).then((emp) => {
        setForm({
          nombre: emp.nombre || '',
          apellido: emp.apellido || '',
          cedula: emp.cedula || '',
          email: emp.email || '',
          telefono: emp.telefono || '',
          fechaNacimiento: emp.fecha_nacimiento || '',
          fechaIngreso: emp.fecha_ingreso || '',
          salario: String(emp.salario || ''),
          tipoContrato: emp.tipo_contrato || 'indefinido',
          departamentoId: emp.departamento_id || '',
          cargoId: emp.cargo_id || '',
          direccion: emp.direccion || '',
          ciudad: emp.ciudad || '',
          banco: emp.banco || '',
          numeroCuenta: emp.numero_cuenta || '',
          notas: emp.notas || '',
          numeroEmpleado: emp.numero_empleado || '',
          estado: emp.estado || 'activo',
        });
        setCargando(false);
      });
    }
  }, [id, esEdicion]);

  const cambiar = (campo: keyof FormEmpleado, valor: string) => {
    setForm((prev) => ({ ...prev, [campo]: valor }));
    if (errores[campo]) setErrores((prev) => ({ ...prev, [campo]: undefined }));
  };

  const validar = () => {
    const e: Partial<FormEmpleado> = {};
    if (!form.nombre.trim()) e.nombre = 'El nombre es requerido';
    if (!form.apellido.trim()) e.apellido = 'El apellido es requerido';
    if (!form.fechaIngreso) e.fechaIngreso = 'La fecha de ingreso es requerida';
    if (!form.salario || isNaN(Number(form.salario)) || Number(form.salario) <= 0)
      e.salario = 'Ingresá un salario válido';
    setErrores(e);
    return Object.keys(e).length === 0;
  };

  const guardar = async () => {
    if (!validar()) return;
    setGuardando(true);
    try {
      const datos = {
        nombre: form.nombre.trim(),
        apellido: form.apellido.trim(),
        cedula: form.cedula || undefined,
        email: form.email || undefined,
        telefono: form.telefono || undefined,
        fechaNacimiento: form.fechaNacimiento || undefined,
        fechaIngreso: form.fechaIngreso,
        salario: Number(form.salario),
        tipoContrato: form.tipoContrato,
        departamentoId: form.departamentoId || undefined,
        cargoId: form.cargoId || undefined,
        direccion: form.direccion || undefined,
        ciudad: form.ciudad || undefined,
        banco: form.banco || undefined,
        numeroCuenta: form.numeroCuenta || undefined,
        notas: form.notas || undefined,
        numeroEmpleado: form.numeroEmpleado || undefined,
        estado: form.estado,
      };

      if (esEdicion && id) {
        await servicioEmpleados.actualizar(id, datos);
        exito('Empleado actualizado', 'Los datos fueron guardados correctamente');
        navigate(`/empleados/${id}`);
      } else {
        const creado = await servicioEmpleados.crear(datos);
        exito('Empleado creado', `${form.nombre} ${form.apellido} fue registrado correctamente`);
        navigate(`/empleados/${creado.id}`);
      }
    } catch (err: any) {
      notifError('Error al guardar', err?.response?.data?.error || 'Ocurrió un error inesperado');
    } finally {
      setGuardando(false);
    }
  };

  if (cargando) return <Cargando />;

  return (
    <div className="animar-aparecer max-w-4xl">
      <EncabezadoPagina
        titulo={esEdicion ? 'Editar empleado' : 'Nuevo empleado'}
        migas={[{ etiqueta: 'Empleados' }, { etiqueta: esEdicion ? 'Editar' : 'Nuevo' }]}
        acciones={
          <>
            <Boton variante="secundario" icono={<ArrowLeft size={15} />} onClick={() => navigate('/empleados')}>
              Cancelar
            </Boton>
            <Boton icono={<Save size={15} />} cargando={guardando} onClick={guardar}>
              {esEdicion ? 'Guardar cambios' : 'Crear empleado'}
            </Boton>
          </>
        }
      />

      <div className="flex flex-col gap-5">
        {/* Datos personales */}
        <Tarjeta>
          <h3 className="font-semibold text-[#111827] mb-5 pb-3 border-b border-[#f3f4f6]">Datos personales</h3>
          <div className="grid grid-cols-2 gap-4">
            <CampoFormulario etiqueta="Nombre" requerido error={errores.nombre}>
              <InputTexto value={form.nombre} onChange={(e) => cambiar('nombre', e.target.value)} placeholder="Ej: Carlos" error={!!errores.nombre} />
            </CampoFormulario>
            <CampoFormulario etiqueta="Apellido" requerido error={errores.apellido}>
              <InputTexto value={form.apellido} onChange={(e) => cambiar('apellido', e.target.value)} placeholder="Ej: Rodríguez" error={!!errores.apellido} />
            </CampoFormulario>
            <CampoFormulario etiqueta="Cédula de identidad">
              <InputTexto value={form.cedula} onChange={(e) => cambiar('cedula', e.target.value)} placeholder="Ej: 3.456.789" />
            </CampoFormulario>
            <CampoFormulario etiqueta="Fecha de nacimiento">
              <InputTexto type="date" value={form.fechaNacimiento} onChange={(e) => cambiar('fechaNacimiento', e.target.value)} />
            </CampoFormulario>
            <CampoFormulario etiqueta="Email">
              <InputTexto type="email" value={form.email} onChange={(e) => cambiar('email', e.target.value)} placeholder="correo@ejemplo.com" />
            </CampoFormulario>
            <CampoFormulario etiqueta="Teléfono">
              <InputTexto value={form.telefono} onChange={(e) => cambiar('telefono', e.target.value)} placeholder="Ej: 0981-123456" />
            </CampoFormulario>
            <CampoFormulario etiqueta="Dirección">
              <InputTexto value={form.direccion} onChange={(e) => cambiar('direccion', e.target.value)} placeholder="Calle y número" />
            </CampoFormulario>
            <CampoFormulario etiqueta="Ciudad">
              <InputTexto value={form.ciudad} onChange={(e) => cambiar('ciudad', e.target.value)} placeholder="Ej: Asunción" />
            </CampoFormulario>
          </div>
        </Tarjeta>

        {/* Datos laborales */}
        <Tarjeta>
          <h3 className="font-semibold text-[#111827] mb-5 pb-3 border-b border-[#f3f4f6]">Datos laborales</h3>
          <div className="grid grid-cols-2 gap-4">
            <CampoFormulario etiqueta="Nro. de empleado">
              <InputTexto value={form.numeroEmpleado} onChange={(e) => cambiar('numeroEmpleado', e.target.value)} placeholder="Ej: EMP-013" />
            </CampoFormulario>
            <CampoFormulario etiqueta="Fecha de ingreso" requerido error={errores.fechaIngreso}>
              <InputTexto type="date" value={form.fechaIngreso} onChange={(e) => cambiar('fechaIngreso', e.target.value)} error={!!errores.fechaIngreso} />
            </CampoFormulario>
            <CampoFormulario etiqueta="Departamento">
              <SelectCampo
                value={form.departamentoId}
                onChange={(e) => cambiar('departamentoId', e.target.value)}
                placeholder="Seleccionar departamento"
                opciones={departamentos.map((d) => ({ valor: d.id, etiqueta: d.nombre }))}
              />
            </CampoFormulario>
            <CampoFormulario etiqueta="Cargo">
              <SelectCampo
                value={form.cargoId}
                onChange={(e) => cambiar('cargoId', e.target.value)}
                placeholder="Seleccionar cargo"
                opciones={cargos.map((c) => ({ valor: c.id, etiqueta: c.nombre }))}
              />
            </CampoFormulario>
            <CampoFormulario etiqueta="Salario mensual (Gs.)" requerido error={errores.salario}>
              <InputTexto
                type="number" value={form.salario}
                onChange={(e) => cambiar('salario', e.target.value)}
                placeholder="Ej: 5000000" error={!!errores.salario}
              />
            </CampoFormulario>
            <CampoFormulario etiqueta="Tipo de contrato">
              <SelectCampo
                value={form.tipoContrato}
                onChange={(e) => cambiar('tipoContrato', e.target.value)}
                opciones={[
                  { valor: 'indefinido', etiqueta: 'Indefinido' },
                  { valor: 'temporal', etiqueta: 'Temporal' },
                  { valor: 'pasantia', etiqueta: 'Pasantía' },
                ]}
              />
            </CampoFormulario>
            {esEdicion && (
              <CampoFormulario etiqueta="Estado">
                <SelectCampo
                  value={form.estado}
                  onChange={(e) => cambiar('estado', e.target.value)}
                  opciones={[
                    { valor: 'activo', etiqueta: 'Activo' },
                    { valor: 'inactivo', etiqueta: 'Inactivo' },
                    { valor: 'licencia', etiqueta: 'En licencia' },
                  ]}
                />
              </CampoFormulario>
            )}
          </div>
        </Tarjeta>

        {/* Datos bancarios */}
        <Tarjeta>
          <h3 className="font-semibold text-[#111827] mb-5 pb-3 border-b border-[#f3f4f6]">Datos bancarios</h3>
          <div className="grid grid-cols-2 gap-4">
            <CampoFormulario etiqueta="Banco">
              <InputTexto value={form.banco} onChange={(e) => cambiar('banco', e.target.value)} placeholder="Ej: Banco Continental" />
            </CampoFormulario>
            <CampoFormulario etiqueta="Número de cuenta">
              <InputTexto value={form.numeroCuenta} onChange={(e) => cambiar('numeroCuenta', e.target.value)} placeholder="Ej: 0123456789" />
            </CampoFormulario>
          </div>
        </Tarjeta>

        {/* Notas */}
        <Tarjeta>
          <h3 className="font-semibold text-[#111827] mb-4">Notas</h3>
          <TextAreaCampo
            value={form.notas}
            onChange={(e) => cambiar('notas', e.target.value)}
            rows={3}
            placeholder="Observaciones internas sobre el empleado..."
          />
        </Tarjeta>

        {/* Botones inferiores */}
        <div className="flex justify-end gap-3 pb-2">
          <Boton variante="secundario" onClick={() => navigate('/empleados')}>Cancelar</Boton>
          <Boton icono={<Save size={15} />} cargando={guardando} onClick={guardar}>
            {esEdicion ? 'Guardar cambios' : 'Crear empleado'}
          </Boton>
        </div>
      </div>
    </div>
  );
}
