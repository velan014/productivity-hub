import { apiRequest } from './api';
import { ApiResponse, Habit, HabitWithStats, HabitLog } from '../types';

export const habitApi = {
  async getHabits(): Promise<ApiResponse<{ habits: HabitWithStats[] }>> {
    return apiRequest<ApiResponse<{ habits: HabitWithStats[] }>>('/habits', {
      method: 'GET',
    });
  },

  async getTodaySummary(): Promise<ApiResponse<{ summary: { completed: number; total: number } }>> {
    return apiRequest<ApiResponse<{ summary: { completed: number; total: number } }>>('/habits/today', {
      method: 'GET',
    });
  },

  async getHabitById(id: string): Promise<ApiResponse<{ habit: Habit }>> {
    return apiRequest<ApiResponse<{ habit: Habit }>>(`/habits/${id}`, {
      method: 'GET',
    });
  },

  async getHabitHistory(id: string): Promise<ApiResponse<{ history: HabitLog[] }>> {
    return apiRequest<ApiResponse<{ history: HabitLog[] }>>(`/habits/${id}/history`, {
      method: 'GET',
    });
  },

  async createHabit(data: Partial<Habit>): Promise<ApiResponse<{ habit: Habit }>> {
    return apiRequest<ApiResponse<{ habit: Habit }>>('/habits', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateHabit(id: string, updates: Partial<Habit>): Promise<ApiResponse<{ habit: Habit }>> {
    return apiRequest<ApiResponse<{ habit: Habit }>>(`/habits/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteHabit(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`/habits/${id}`, {
      method: 'DELETE',
    });
  },

  async logHabit(id: string, logDate?: string, completed: boolean = true): Promise<ApiResponse<{ log: HabitLog }>> {
    return apiRequest<ApiResponse<{ log: HabitLog }>>(`/habits/${id}/log`, {
      method: 'POST',
      body: JSON.stringify({ log_date: logDate, completed }),
    });
  },

  async removeLog(id: string, logDate?: string): Promise<ApiResponse<null>> {
    const dateParam = logDate || new Date().toISOString().slice(0, 10);
    return apiRequest<ApiResponse<null>>(`/habits/${id}/log/${dateParam}`, {
      method: 'DELETE',
    });
  },
};
