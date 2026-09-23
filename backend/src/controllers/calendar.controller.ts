import { Response } from 'express';
import { CalendarService } from '../services/calendar.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export class CalendarController {
  static async getCalendarEvents(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { start, end } = req.query;

      // Default to current month window if not provided
      const now = new Date();
      const defaultStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10);
      const defaultEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().slice(0, 10);

      const startDate = (start as string) || defaultStart;
      const endDate = (end as string) || defaultEnd;

      const events = await CalendarService.getCalendarEvents(userId, startDate, endDate);
      return sendSuccess(res, events, 'Calendar events retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve calendar events', 500);
    }
  }
}
