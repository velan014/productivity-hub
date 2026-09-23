import { Router } from 'express';
import {
  MorningPlanController,
  saveMorningPlanSchema,
} from '../controllers/morningPlan.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/:date', MorningPlanController.getPlanByDate);
router.post('/', validateBody(saveMorningPlanSchema), MorningPlanController.savePlan);
router.put('/:date', validateBody(saveMorningPlanSchema.partial()), MorningPlanController.updatePlanByDate);

export default router;
