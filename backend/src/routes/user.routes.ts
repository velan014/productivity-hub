import { Router } from 'express';
import { UserController, updateProfileSchema } from '../controllers/user.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);
router.get('/profile', UserController.getProfile);
router.put('/profile', validateBody(updateProfileSchema), UserController.updateProfile);

export default router;
