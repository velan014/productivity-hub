import { AnalyticsModel } from '../models/analytics.model';
import { AnalyticsData, AnalyticsRange } from '../types';

export class AnalyticsService {
  static async getAnalytics(
    userId: string,
    range: AnalyticsRange = 'week',
    startDate?: string,
    endDate?: string
  ): Promise<AnalyticsData> {
    return AnalyticsModel.getAnalytics(userId, range, startDate, endDate);
  }
}
