import { Response } from 'express';
import { z } from 'zod';
import { FocusService } from '../services/focus.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const createFocusSessionSchema = z.object({
  task_id: z.string().nullable().optional(),
  mode: z.enum(['focus', 'short_break', 'long_break']).optional().default('focus'),
  planned_minutes: z.number().int().min(1).max(180).optional().default(25),
  actual_minutes: z.number().int().min(0).max(180).optional(),
  started_at: z.string().optional(),
  ended_at: z.string().optional(),
  completed: z.boolean().optional().default(true),
});

export class FocusController {
  static async getSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;
      const sessions = await FocusService.getSessions(userId, limit);
      return sendSuccess(res, { sessions }, 'Focus sessions retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve focus sessions', 500);
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const stats = await FocusService.getStats(userId);
      return sendSuccess(res, { stats }, 'Focus statistics retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve focus statistics', 500);
    }
  }

  static async createSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const session = await FocusService.createSession({
        ...req.body,
        user_id: userId,
      });

      return sendSuccess(res, { session }, 'Focus session saved successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to save focus session', 500);
    }
  }
}
