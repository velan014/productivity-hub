import { apiRequest } from './api';
import { ApiResponse, Goal, GoalFilters, GoalStatus } from '../types';

export const goalApi = {
  async getGoals(filters: GoalFilters = {}): Promise<ApiResponse<{ goals: Goal[] }>> {
    return apiRequest<ApiResponse<{ goals: Goal[] }>>('/goals', {
      method: 'GET',
      params: filters,
    });
  },

  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return apiRequest<ApiResponse<{ categories: string[] }>>('/goals/categories', {
      method: 'GET',
    });
  },

  async getStats(): Promise<ApiResponse<{ stats: any }>> {
    return apiRequest<ApiResponse<{ stats: any }>>('/goals/stats', {
      method: 'GET',
    });
  },

  async getGoalById(id: string): Promise<ApiResponse<{ goal: Goal }>> {
    return apiRequest<ApiResponse<{ goal: Goal }>>(`/goals/${id}`, {
      method: 'GET',
    });
  },

  async createGoal(data: Partial<Goal>): Promise<ApiResponse<{ goal: Goal }>> {
    return apiRequest<ApiResponse<{ goal: Goal }>>('/goals', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateGoal(id: string, updates: Partial<Goal>): Promise<ApiResponse<{ goal: Goal }>> {
    return apiRequest<ApiResponse<{ goal: Goal }>>(`/goals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async updateProgress(id: string, progress: number): Promise<ApiResponse<{ goal: Goal }>> {
    return apiRequest<ApiResponse<{ goal: Goal }>>(`/goals/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ progress }),
    });
  },

  async updateStatus(id: string, status: GoalStatus): Promise<ApiResponse<{ goal: Goal }>> {
    return apiRequest<ApiResponse<{ goal: Goal }>>(`/goals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  async deleteGoal(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`/goals/${id}`, {
      method: 'DELETE',
    });
  },
};
