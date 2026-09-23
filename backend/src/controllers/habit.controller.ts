import { Response } from 'express';
import { z } from 'zod';
import { HabitService } from '../services/habit.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const createHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(255, 'Name too long'),
  description: z.string().nullable().optional(),
  category: z.string().max(50).optional().default('General'),
  frequency: z.enum(['daily', 'weekly']).optional().default('daily'),
  target_count: z.number().int().min(1).optional().default(1),
  color: z.string().max(50).optional().default('emerald'),
  icon: z.string().max(50).optional().default('Repeat'),
});

export const updateHabitSchema = z.object({
  name: z.string().min(1, 'Habit name is required').max(255, 'Name too long').optional(),
  description: z.string().nullable().optional(),
  category: z.string().max(50).optional(),
  frequency: z.enum(['daily', 'weekly']).optional(),
  target_count: z.number().int().min(1).optional(),
  color: z.string().max(50).optional(),
  icon: z.string().max(50).optional(),
  active: z.boolean().optional(),
});

export const logHabitSchema = z.object({
  log_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format, expected YYYY-MM-DD').optional(),
  completed: z.boolean().optional().default(true),
});

export class HabitController {
  static async getHabits(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const habits = await HabitService.getHabits(userId);
      return sendSuccess(res, { habits }, 'Habits retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve habits', 500);
    }
  }

  static async getTodaySummary(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const summary = await HabitService.getTodaySummary(userId);
      return sendSuccess(res, { summary }, 'Today habit summary retrieved');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve habit summary', 500);
    }
  }

  static async getHabitById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const habit = await HabitService.getHabitById(id, userId);

      if (!habit) {
        return sendError(res, 'Habit not found', 404);
      }

      return sendSuccess(res, { habit }, 'Habit retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve habit', 500);
    }
  }

  static async createHabit(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const habit = await HabitService.createHabit({
        ...req.body,
        user_id: userId,
      });

      return sendSuccess(res, { habit }, 'Habit created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create habit', 500);
    }
  }

  static async updateHabit(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const habit = await HabitService.updateHabit(id, userId, req.body);

      if (!habit) {
        return sendError(res, 'Habit not found or unauthorized', 404);
      }

      return sendSuccess(res, { habit }, 'Habit updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update habit', 500);
    }
  }

  static async deleteHabit(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const deleted = await HabitService.deleteHabit(id, userId);

      if (!deleted) {
        return sendError(res, 'Habit not found or unauthorized', 404);
      }

      return sendSuccess(res, null, 'Habit deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete habit', 500);
    }
  }

  static async logHabit(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const date = req.body.log_date || new Date().toISOString().slice(0, 10);
      const completed = req.body.completed !== undefined ? req.body.completed : true;

      const log = await HabitService.logHabit(id, userId, date, completed);
      return sendSuccess(res, { log }, 'Habit logged successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to log habit', 500);
    }
  }

  static async removeLog(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id, date } = req.params;
      const logDate = date || new Date().toISOString().slice(0, 10);

      await HabitService.removeLog(id, userId, logDate);
      return sendSuccess(res, null, 'Habit log removed successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to remove habit log', 500);
    }
  }

  static async getHabitHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const history = await HabitService.getHabitHistory(id, userId);
      return sendSuccess(res, { history }, 'Habit history retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve habit history', 500);
    }
  }
}
