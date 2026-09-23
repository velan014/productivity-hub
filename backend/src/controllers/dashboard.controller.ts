import { Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class DashboardController {
  static async getDashboard(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = await DashboardService.getDashboardData(userId);
      return sendSuccess(res, data, 'Dashboard data retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve dashboard data', 500);
    }
  }
}
