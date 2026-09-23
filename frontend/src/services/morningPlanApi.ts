import { apiRequest } from './api';
import { ApiResponse, MorningPlanWithTasks } from '../types';

export const morningPlanApi = {
  async getPlanByDate(date: string): Promise<ApiResponse<{ plan: MorningPlanWithTasks | null }>> {
    return apiRequest<ApiResponse<{ plan: MorningPlanWithTasks | null }>>(`/morning-plan/${date}`, {
      method: 'GET',
    });
  },

  async savePlan(data: Partial<MorningPlanWithTasks>): Promise<ApiResponse<{ plan: MorningPlanWithTasks }>> {
    return apiRequest<ApiResponse<{ plan: MorningPlanWithTasks }>>('/morning-plan', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updatePlan(date: string, data: Partial<MorningPlanWithTasks>): Promise<ApiResponse<{ plan: MorningPlanWithTasks }>> {
    return apiRequest<ApiResponse<{ plan: MorningPlanWithTasks }>>(`/morning-plan/${date}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
