import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware';
import { AiController } from '../controllers/ai.controller';

const router = Router();

router.use(authenticate);

router.get('/status', AiController.getStatus);
router.post('/chat', AiController.chat);
router.post('/task-breakdown', AiController.taskBreakdown);
router.post('/daily-plan', AiController.dailyPlan);
router.post('/review-assist', AiController.reviewAssist);

export default router;
