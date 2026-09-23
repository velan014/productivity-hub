import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { NotificationController } from '../controllers/notification.controller';

const router = Router();

router.use(authenticate);

router.get('/preferences', NotificationController.getPreferences);
router.put('/preferences', NotificationController.updatePreferences);

export default router;
