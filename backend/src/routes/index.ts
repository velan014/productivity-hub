import { Router } from 'express';
import authRoutes from './auth.routes';
import taskRoutes from './task.routes';
import dashboardRoutes from './dashboard.routes';
import userRoutes from './user.routes';
import goalRoutes from './goal.routes';
import habitRoutes from './habit.routes';
import focusRoutes from './focus.routes';
import noteRoutes from './note.routes';
import calendarRoutes from './calendar.routes';
import projectRoutes from './project.routes';
import subjectRoutes from './subject.routes';
import studyRoutes from './study.routes';
import analyticsRoutes from './analytics.routes';
import dailyReviewRoutes from './dailyReview.routes';
import morningPlanRoutes from './morningPlan.routes';
import gamificationRoutes from './gamification.routes';
import notificationRoutes from './notification.routes';
import aiRoutes from './ai.routes';
import backupRoutes from './backup.routes';

const router = Router();

// Health check endpoint
router.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Phase 1 modules
router.use('/auth', authRoutes);
router.use('/tasks', taskRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/users', userRoutes);

// Phase 2 modules
router.use('/goals', goalRoutes);
router.use('/habits', habitRoutes);
router.use('/focus', focusRoutes);
router.use('/notes', noteRoutes);
router.use('/calendar', calendarRoutes);

// Phase 3 modules
router.use('/projects', projectRoutes);
router.use('/subjects', subjectRoutes);
router.use('/study', studyRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/daily-review', dailyReviewRoutes);
router.use('/morning-plan', morningPlanRoutes);

// Phase 4 modules
router.use('/gamification', gamificationRoutes);
router.use('/notifications', notificationRoutes);
router.use('/ai', aiRoutes);
router.use('/backup', backupRoutes);

export default router;

