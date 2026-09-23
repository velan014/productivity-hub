import { apiRequest } from './api';
import { ApiResponse, User } from '../types';

export const userApi = {
  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    return apiRequest<ApiResponse<{ user: User }>>('/users/profile', {
      method: 'GET',
    });
  },

  async updateProfile(data: { name?: string; avatar?: string | null }): Promise<ApiResponse<{ user: User }>> {
    return apiRequest<ApiResponse<{ user: User }>>('/users/profile', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },
};
