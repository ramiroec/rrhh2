import { Router } from 'express';
import { listarVacaciones, crearSolicitud, aprobarRechazarSolicitud, saldoVacaciones, obtenerSolicitud } from '../controladores/vacaciones';
import { autenticar } from '../middleware/autenticacion';

const router = Router();
router.use(autenticar);

router.get('/', listarVacaciones);
router.post('/', crearSolicitud);
router.get('/:id', obtenerSolicitud);
router.post('/:id/gestion', aprobarRechazarSolicitud);
router.get('/saldo/:empleadoId', saldoVacaciones);

export default router;
