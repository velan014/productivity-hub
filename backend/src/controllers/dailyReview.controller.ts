import { Response } from 'express';
import { z } from 'zod';
import { DailyReviewService } from '../services/dailyReview.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const saveDailyReviewSchema = z.object({
  review_date: z.string().min(1, 'Review date is required'),
  what_went_well: z.string().nullable().optional(),
  challenges: z.string().nullable().optional(),
  learned: z.string().nullable().optional(),
  improvements: z.string().nullable().optional(),
  mood: z.enum(['great', 'good', 'okay', 'difficult', 'bad']).optional().default('good'),
  rating: z.union([z.number().int().min(1).max(5), z.string()]).optional().default(3),
});

export class DailyReviewController {
  static async getReviewByDate(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { date } = req.params;

      const result = await DailyReviewService.getReviewByDate(userId, date);
      return sendSuccess(res, result, 'Daily review retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve daily review', 500);
    }
  }

  static async saveReview(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = req.body;

      const review = await DailyReviewService.saveReview(userId, data);
      return sendSuccess(res, { review }, 'Daily review saved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to save daily review', 500);
    }
  }

  static async updateReviewByDate(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { date } = req.params;
      const data = { ...req.body, review_date: date };

      const review = await DailyReviewService.saveReview(userId, data);
      return sendSuccess(res, { review }, 'Daily review updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update daily review', 500);
    }
  }

  static async getHistory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 30;

      const reviews = await DailyReviewService.getHistory(userId, limit);
      return sendSuccess(res, { reviews }, 'Daily reviews history retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve daily review history', 500);
    }
  }
}
