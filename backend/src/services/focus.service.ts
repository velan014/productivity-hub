import { FocusModel } from '../models/focus.model';
import { FocusSession, FocusMode, FocusStats } from '../types';

export class FocusService {
  static async getSessions(userId: string, limit: number = 30): Promise<FocusSession[]> {
    return FocusModel.findUserSessions(userId, limit);
  }

  static async createSession(data: {
    user_id: string;
    task_id?: string | null;
    mode?: FocusMode;
    planned_minutes?: number;
    actual_minutes?: number;
    started_at?: string | Date;
    ended_at?: string | Date;
    completed?: boolean;
  }): Promise<FocusSession> {
    return FocusModel.create(data);
  }

  static async getStats(userId: string): Promise<FocusStats> {
    return FocusModel.getStats(userId);
  }
}
