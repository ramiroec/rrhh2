import { Router } from 'express';
import {
  listarEmpleados, obtenerEmpleado, crearEmpleado,
  actualizarEmpleado, eliminarEmpleado, listarDepartamentos, listarCargos
} from '../controladores/empleados';
import { autenticar } from '../middleware/autenticacion';

const router = Router();

router.use(autenticar);

router.get('/', listarEmpleados);
router.post('/', crearEmpleado);
router.get('/departamentos', listarDepartamentos);
router.get('/cargos', listarCargos);
router.get('/:id', obtenerEmpleado);
router.put('/:id', actualizarEmpleado);
router.delete('/:id', eliminarEmpleado);

export default router;
