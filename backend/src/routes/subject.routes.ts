import { Router } from 'express';
import {
  StudyController,
  createSubjectSchema,
  updateSubjectSchema,
} from '../controllers/study.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', StudyController.getSubjects);
router.get('/:id', StudyController.getSubjectById);
router.post('/', validateBody(createSubjectSchema), StudyController.createSubject);
router.put('/:id', validateBody(updateSubjectSchema), StudyController.updateSubject);
router.delete('/:id', StudyController.deleteSubject);

export default router;
