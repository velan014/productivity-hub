import { apiRequest } from './api';
import { ApiResponse, DashboardData } from '../types';

export const dashboardApi = {
  async getDashboard(): Promise<ApiResponse<DashboardData>> {
    return apiRequest<ApiResponse<DashboardData>>('/dashboard', {
      method: 'GET',
    });
  },
};
