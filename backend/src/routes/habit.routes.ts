import { Router } from 'express';
import {
  HabitController,
  createHabitSchema,
  updateHabitSchema,
  logHabitSchema,
} from '../controllers/habit.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', HabitController.getHabits);
router.get('/today', HabitController.getTodaySummary);
router.get('/:id', HabitController.getHabitById);
router.get('/:id/history', HabitController.getHabitHistory);
router.post('/', validateBody(createHabitSchema), HabitController.createHabit);
router.put('/:id', validateBody(updateHabitSchema), HabitController.updateHabit);
router.delete('/:id', HabitController.deleteHabit);

router.post('/:id/log', validateBody(logHabitSchema), HabitController.logHabit);
router.delete('/:id/log/:date', HabitController.removeLog);

export default router;
