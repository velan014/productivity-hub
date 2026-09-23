import { apiRequest } from './api';
import { ApiResponse, AuthResponseData, User } from '../types';

export const authApi = {
  async register(data: {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    return apiRequest<ApiResponse<AuthResponseData>>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async login(data: {
    email: string;
    password: string;
  }): Promise<ApiResponse<AuthResponseData>> {
    return apiRequest<ApiResponse<AuthResponseData>>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getMe(): Promise<ApiResponse<{ user: User }>> {
    return apiRequest<ApiResponse<{ user: User }>>('/auth/me', {
      method: 'GET',
    });
  },
};
