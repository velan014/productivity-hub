import { api } from './api';
import { GamificationProfile, AchievementWithStatus, ApiResponse } from '../types';

export const gamificationApi = {
  getProfile: async (): Promise<GamificationProfile> => {
    const res = await api.get<ApiResponse<GamificationProfile>>('/gamification');
    return res.data;
  },

  getAchievements: async (): Promise<AchievementWithStatus[]> => {
    const res = await api.get<ApiResponse<AchievementWithStatus[]>>('/gamification/achievements');
    return res.data;
  },
};
