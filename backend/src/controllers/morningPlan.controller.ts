import { Response } from 'express';
import { z } from 'zod';
import { MorningPlanService } from '../services/morningPlan.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const saveMorningPlanSchema = z.object({
  plan_date: z.string().min(1, 'Plan date is required'),
  priority_1: z.string().min(1, 'Priority 1 is required').max(255, 'Priority 1 too long'),
  priority_2: z.string().max(255, 'Priority 2 too long').nullable().optional(),
  priority_3: z.string().max(255, 'Priority 3 too long').nullable().optional(),
  priority_1_task_id: z.string().nullable().optional(),
  priority_2_task_id: z.string().nullable().optional(),
  priority_3_task_id: z.string().nullable().optional(),
  planned_study_minutes: z.union([z.number().int().nonnegative(), z.string()]).optional().default(0),
  planned_focus_minutes: z.union([z.number().int().nonnegative(), z.string()]).optional().default(0),
  notes: z.string().nullable().optional(),
  intention: z.string().nullable().optional(),
});

export class MorningPlanController {
  static async getPlanByDate(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { date } = req.params;

      const plan = await MorningPlanService.getPlanByDate(userId, date);
      return sendSuccess(res, { plan }, 'Morning plan retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve morning plan', 500);
    }
  }

  static async savePlan(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = req.body;

      const plan = await MorningPlanService.savePlan(userId, data);
      return sendSuccess(res, { plan }, 'Morning plan saved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to save morning plan', 500);
    }
  }

  static async updatePlanByDate(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { date } = req.params;
      const data = { ...req.body, plan_date: date };

      const plan = await MorningPlanService.savePlan(userId, data);
      return sendSuccess(res, { plan }, 'Morning plan updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update morning plan', 500);
    }
  }
}
