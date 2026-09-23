import { apiRequest } from './api';
import { ApiResponse, CalendarAggregation } from '../types';

export const calendarApi = {
  async getCalendarEvents(start?: string, end?: string): Promise<ApiResponse<CalendarAggregation>> {
    return apiRequest<ApiResponse<CalendarAggregation>>('/calendar', {
      method: 'GET',
      params: { start, end },
    });
  },
};
