import { Router } from 'express';
import { listarRecibos, obtenerRecibo } from '../controladores/recibos';
import { autenticar } from '../middleware/autenticacion';

const router = Router();
router.use(autenticar);

router.get('/', listarRecibos);
router.get('/:id', obtenerRecibo);

export default router;
