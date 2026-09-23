import { Router } from 'express';
import { FocusController, createFocusSessionSchema } from '../controllers/focus.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', FocusController.getSessions);
router.get('/stats', FocusController.getStats);
router.post('/', validateBody(createFocusSessionSchema), FocusController.createSession);

export default router;
