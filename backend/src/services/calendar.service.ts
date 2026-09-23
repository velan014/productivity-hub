import { CalendarModel, CalendarSummary } from '../models/calendar.model';

export class CalendarService {
  static async getCalendarEvents(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarSummary> {
    return CalendarModel.getEventsForRange(userId, startDate, endDate);
  }
}
