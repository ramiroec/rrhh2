import { Router } from 'express';
import { login, perfil } from '../controladores/autenticacion';
import { autenticar } from '../middleware/autenticacion';

const router = Router();

router.post('/login', login);
router.get('/perfil', autenticar, perfil);

export default router;
