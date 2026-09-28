import { Router } from 'express';
import { listarLiquidaciones, generarLiquidacion, obtenerLiquidacion, aprobarLiquidacion, previewLiquidacion } from '../controladores/liquidaciones';
import { autenticar } from '../middleware/autenticacion';

const router = Router();
router.use(autenticar);

router.get('/', listarLiquidaciones);
router.post('/', generarLiquidacion);
router.get('/preview', previewLiquidacion);
router.get('/:id', obtenerLiquidacion);
router.post('/:id/aprobar', aprobarLiquidacion);

export default router;
