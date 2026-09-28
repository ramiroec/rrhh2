import { Router } from 'express';
import { obtenerDashboard } from '../controladores/dashboard';
import { autenticar } from '../middleware/autenticacion';

const router = Router();
router.use(autenticar);

router.get('/', obtenerDashboard);

export default router;
