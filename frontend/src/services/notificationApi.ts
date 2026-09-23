import { api } from './api';
import { NotificationPreferences, ApiResponse } from '../types';

export const notificationApi = {
  getPreferences: async (): Promise<NotificationPreferences> => {
    const res = await api.get<ApiResponse<NotificationPreferences>>('/notifications/preferences');
    return res.data;
  },

  updatePreferences: async (
    data: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> => {
    const res = await api.put<ApiResponse<NotificationPreferences>>('/notifications/preferences', data);
    return res.data;
  },
};
