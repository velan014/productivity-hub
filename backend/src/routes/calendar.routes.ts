import { Router } from 'express';
import { CalendarController } from '../controllers/calendar.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', CalendarController.getCalendarEvents);

export default router;
