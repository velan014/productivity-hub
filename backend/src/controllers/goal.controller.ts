import { Response } from 'express';
import { z } from 'zod';
import { GoalService } from '../services/goal.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const createGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long'),
  description: z.string().nullable().optional(),
  category: z.string().max(50).optional().default('General'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  status: z.enum(['active', 'completed', 'paused']).optional().default('active'),
  progress: z.number().min(0).max(100).optional().default(0),
  start_date: z.string().nullable().optional(),
  target_date: z.string().nullable().optional(),
});

export const updateGoalSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255, 'Title is too long').optional(),
  description: z.string().nullable().optional(),
  category: z.string().max(50).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['active', 'completed', 'paused']).optional(),
  progress: z.number().min(0).max(100).optional(),
  start_date: z.string().nullable().optional(),
  target_date: z.string().nullable().optional(),
});

export const updateProgressSchema = z.object({
  progress: z.number().min(0, 'Progress must be at least 0').max(100, 'Progress cannot exceed 100'),
});

export const updateStatusSchema = z.object({
  status: z.enum(['active', 'completed', 'paused']),
});

export class GoalController {
  static async getGoals(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, priority, category, search, sortBy, sortOrder } = req.query;

      const filters = {
        status: status as any,
        priority: priority as any,
        category: category as string,
        search: search as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      };

      const goals = await GoalService.getGoals(userId, filters);
      return sendSuccess(res, { goals }, 'Goals retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve goals', 500);
    }
  }

  static async getCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const categories = await GoalService.getCategories(userId);
      return sendSuccess(res, { categories }, 'Goal categories retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve categories', 500);
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await GoalService.getStats(userId);
      return sendSuccess(res, { stats }, 'Goal statistics retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve stats', 500);
    }
  }

  static async getGoalById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const goal = await GoalService.getGoalById(id, userId);

      if (!goal) {
        return sendError(res, 'Goal not found', 404);
      }

      return sendSuccess(res, { goal }, 'Goal retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve goal', 500);
    }
  }

  static async createGoal(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const goal = await GoalService.createGoal({
        ...req.body,
        user_id: userId,
      });

      return sendSuccess(res, { goal }, 'Goal created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create goal', 500);
    }
  }

  static async updateGoal(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const goal = await GoalService.updateGoal(id, userId, req.body);

      if (!goal) {
        return sendError(res, 'Goal not found or unauthorized', 404);
      }

      return sendSuccess(res, { goal }, 'Goal updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update goal', 500);
    }
  }

  static async updateProgress(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { progress } = req.body;
      const goal = await GoalService.updateProgress(id, userId, progress);

      if (!goal) {
        return sendError(res, 'Goal not found or unauthorized', 404);
      }

      return sendSuccess(res, { goal }, 'Goal progress updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update progress', 500);
    }
  }

  static async updateStatus(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const { status } = req.body;
      const goal = await GoalService.updateStatus(id, userId, status);

      if (!goal) {
        return sendError(res, 'Goal not found or unauthorized', 404);
      }

      return sendSuccess(res, { goal }, 'Goal status updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update status', 500);
    }
  }

  static async deleteGoal(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const deleted = await GoalService.deleteGoal(id, userId);

      if (!deleted) {
        return sendError(res, 'Goal not found or unauthorized', 404);
      }

      return sendSuccess(res, null, 'Goal deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete goal', 500);
    }
  }
}
