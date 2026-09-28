import { Router } from 'express';
import { listarAsistencia, registrarAsistencia, actualizarAsistencia, resumenAsistencia } from '../controladores/asistencia';
import { autenticar } from '../middleware/autenticacion';

const router = Router();
router.use(autenticar);

router.get('/', listarAsistencia);
router.post('/', registrarAsistencia);
router.get('/resumen', resumenAsistencia);
router.put('/:id', actualizarAsistencia);

export default router;
