import { Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { AuthenticatedRequest, AnalyticsRange } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class AnalyticsController {
  static async getAnalytics(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { range, startDate, endDate } = req.query;

      const data = await AnalyticsService.getAnalytics(
        userId,
        (range as AnalyticsRange) || 'week',
        startDate as string,
        endDate as string
      );

      return sendSuccess(res, data, 'Analytics data retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve analytics data', 500);
    }
  }
}
