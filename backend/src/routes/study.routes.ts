import { Router } from 'express';
import {
  StudyController,
  createSessionSchema,
  updateSessionSchema,
} from '../controllers/study.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/summary', StudyController.getStudySummary);
router.get('/sessions', StudyController.getSessions);
router.get('/sessions/:id', StudyController.getSessionById);
router.post('/sessions', validateBody(createSessionSchema), StudyController.createSession);
router.put('/sessions/:id', validateBody(updateSessionSchema), StudyController.updateSession);
router.delete('/sessions/:id', StudyController.deleteSession);

export default router;
