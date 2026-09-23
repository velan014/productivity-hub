import { Router } from 'express';
import {
  ProjectController,
  createProjectSchema,
  updateProjectSchema,
} from '../controllers/project.controller';
import { createTaskSchema } from '../controllers/task.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', ProjectController.getProjects);
router.get('/:id', ProjectController.getProjectById);
router.post('/', validateBody(createProjectSchema), ProjectController.createProject);
router.put('/:id', validateBody(updateProjectSchema), ProjectController.updateProject);
router.delete('/:id', ProjectController.deleteProject);

// Project tasks sub-routes
router.get('/:id/tasks', ProjectController.getProjectTasks);
router.post('/:id/tasks', validateBody(createTaskSchema), ProjectController.addTaskToProject);

export default router;
