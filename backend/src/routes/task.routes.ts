import { Router } from 'express';
import {
  TaskController,
  createTaskSchema,
  updateTaskSchema,
} from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

// All task routes require authentication
router.use(authenticate);

router.get('/', TaskController.getTasks);
router.get('/categories', TaskController.getCategories);
router.get('/:id', TaskController.getTaskById);
router.post('/', validateBody(createTaskSchema), TaskController.createTask);
router.put('/:id', validateBody(updateTaskSchema), TaskController.updateTask);
router.patch('/:id/complete', TaskController.toggleComplete);
router.delete('/:id', TaskController.deleteTask);

export default router;
