import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { GamificationController } from '../controllers/gamification.controller';

const router = Router();

router.use(authenticate);

router.get('/', GamificationController.getProfile);
router.get('/achievements', GamificationController.getAchievements);

export default router;
