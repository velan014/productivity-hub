import { Router } from 'express';
import {
  DailyReviewController,
  saveDailyReviewSchema,
} from '../controllers/dailyReview.controller';
import { authenticate } from '../middleware/auth.middleware';
import { validateBody } from '../middleware/validate.middleware';

const router = Router();

router.use(authenticate);

router.get('/', DailyReviewController.getHistory);
router.get('/:date', DailyReviewController.getReviewByDate);
router.post('/', validateBody(saveDailyReviewSchema), DailyReviewController.saveReview);
router.put('/:date', validateBody(saveDailyReviewSchema.partial()), DailyReviewController.updateReviewByDate);

export default router;
