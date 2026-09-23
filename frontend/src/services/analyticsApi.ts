import { apiRequest } from './api';
import { ApiResponse, AnalyticsData, AnalyticsRange } from '../types';

export const analyticsApi = {
  async getAnalytics(
    range: AnalyticsRange = 'week',
    startDate?: string,
    endDate?: string
  ): Promise<ApiResponse<AnalyticsData>> {
    const params: any = { range };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    return apiRequest<ApiResponse<AnalyticsData>>('/analytics', {
      method: 'GET',
      params,
    });
  },
};
