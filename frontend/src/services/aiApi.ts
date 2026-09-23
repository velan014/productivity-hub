import { api } from './api';
import {
  AiStatus,
  AiChatMessage,
  AiTaskSuggestion,
  AiDailyPlanSuggestion,
  AiReviewAssistResponse,
  ApiResponse,
} from '../types';

export const aiApi = {
  getStatus: async (): Promise<AiStatus> => {
    const res = await api.get<ApiResponse<AiStatus>>('/ai/status');
    return res.data;
  },

  chat: async (
    message: string,
    history: AiChatMessage[] = []
  ): Promise<{ response: string; suggestedTasks?: AiTaskSuggestion[] }> => {
    const res = await api.post<
      ApiResponse<{ response: string; suggestedTasks?: AiTaskSuggestion[] }>
    >('/ai/chat', { message, history });
    return res.data;
  },

  taskBreakdown: async (
    topic: string,
    projectId?: string
  ): Promise<{ suggestions: AiTaskSuggestion[]; explanation: string }> => {
    const res = await api.post<
      ApiResponse<{ suggestions: AiTaskSuggestion[]; explanation: string }>
    >('/ai/task-breakdown', { topic, project_id: projectId });
    return res.data;
  },

  dailyPlan: async (date?: string): Promise<AiDailyPlanSuggestion> => {
    const res = await api.post<ApiResponse<AiDailyPlanSuggestion>>('/ai/daily-plan', { date });
    return res.data;
  },

  reviewAssist: async (date?: string): Promise<AiReviewAssistResponse> => {
    const res = await api.post<ApiResponse<AiReviewAssistResponse>>('/ai/review-assist', { date });
    return res.data;
  },
};
