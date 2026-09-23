import { apiRequest } from './api';
import { ApiResponse, DailyReview, DaySummary } from '../types';

export const dailyReviewApi = {
  async getReviewByDate(date: string): Promise<ApiResponse<{ review: DailyReview | null; summary: DaySummary }>> {
    return apiRequest<ApiResponse<{ review: DailyReview | null; summary: DaySummary }>>(`/daily-review/${date}`, {
      method: 'GET',
    });
  },

  async saveReview(data: Partial<DailyReview>): Promise<ApiResponse<{ review: DailyReview }>> {
    return apiRequest<ApiResponse<{ review: DailyReview }>>('/daily-review', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateReview(date: string, data: Partial<DailyReview>): Promise<ApiResponse<{ review: DailyReview }>> {
    return apiRequest<ApiResponse<{ review: DailyReview }>>(`/daily-review/${date}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  async getHistory(limit: number = 30): Promise<ApiResponse<{ reviews: DailyReview[] }>> {
    return apiRequest<ApiResponse<{ reviews: DailyReview[] }>>('/daily-review', {
      method: 'GET',
      params: { limit: String(limit) },
    });
  },
};
