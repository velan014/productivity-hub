import { apiRequest } from './api';
import { ApiResponse, FocusSession, FocusStats } from '../types';

export const focusApi = {
  async getSessions(limit: number = 30): Promise<ApiResponse<{ sessions: FocusSession[] }>> {
    return apiRequest<ApiResponse<{ sessions: FocusSession[] }>>('/focus', {
      method: 'GET',
      params: { limit },
    });
  },

  async getStats(): Promise<ApiResponse<{ stats: FocusStats }>> {
    return apiRequest<ApiResponse<{ stats: FocusStats }>>('/focus/stats', {
      method: 'GET',
    });
  },

  async saveSession(data: {
    task_id?: string | null;
    mode?: string;
    planned_minutes: number;
    actual_minutes: number;
    started_at?: string;
    ended_at?: string;
    completed?: boolean;
  }): Promise<ApiResponse<{ session: FocusSession }>> {
    return apiRequest<ApiResponse<{ session: FocusSession }>>('/focus', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
