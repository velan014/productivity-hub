import { apiRequest } from './api';
import { ApiResponse, Task, TaskFilters } from '../types';

export const taskApi = {
  async getTasks(filters: TaskFilters = {}): Promise<ApiResponse<{ tasks: Task[] }>> {
    return apiRequest<ApiResponse<{ tasks: Task[] }>>('/tasks', {
      method: 'GET',
      params: filters,
    });
  },

  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return apiRequest<ApiResponse<{ categories: string[] }>>('/tasks/categories', {
      method: 'GET',
    });
  },

  async getTaskById(id: string): Promise<ApiResponse<{ task: Task }>> {
    return apiRequest<ApiResponse<{ task: Task }>>(`/tasks/${id}`, {
      method: 'GET',
    });
  },

  async createTask(data: Partial<Task>): Promise<ApiResponse<{ task: Task }>> {
    return apiRequest<ApiResponse<{ task: Task }>>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateTask(id: string, updates: Partial<Task>): Promise<ApiResponse<{ task: Task }>> {
    return apiRequest<ApiResponse<{ task: Task }>>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async toggleComplete(id: string): Promise<ApiResponse<{ task: Task }>> {
    return apiRequest<ApiResponse<{ task: Task }>>(`/tasks/${id}/complete`, {
      method: 'PATCH',
    });
  },

  async deleteTask(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`/tasks/${id}`, {
      method: 'DELETE',
    });
  },
};
