import { Router } from 'express';
import {
  GoalController,
  createGoalSchema,
  updateGoalSchema,
  updateProgressSchema,
  updateStatusSchema,
} from '../controllers/goal.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', GoalController.getGoals);
router.get('/categories', GoalController.getCategories);
router.get('/stats', GoalController.getStats);
router.get('/:id', GoalController.getGoalById);
router.post('/', validateBody(createGoalSchema), GoalController.createGoal);
router.put('/:id', validateBody(updateGoalSchema), GoalController.updateGoal);
router.patch('/:id/progress', validateBody(updateProgressSchema), GoalController.updateProgress);
router.patch('/:id/status', validateBody(updateStatusSchema), GoalController.updateStatus);
router.delete('/:id', GoalController.deleteGoal);

export default router;
