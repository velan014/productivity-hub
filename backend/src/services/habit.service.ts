import { HabitModel } from '../models/habit.model';
import { Habit, HabitFrequency, HabitLog, HabitWithStats } from '../types';

export class HabitService {
  static async getHabits(userId: string): Promise<HabitWithStats[]> {
    return HabitModel.findUserHabits(userId);
  }

  static async getHabitById(id: string, userId: string): Promise<Habit | null> {
    return HabitModel.findById(id, userId);
  }

  static async createHabit(data: {
    user_id: string;
    name: string;
    description?: string | null;
    category?: string;
    frequency?: HabitFrequency;
    target_count?: number;
    color?: string;
    icon?: string;
  }): Promise<Habit> {
    return HabitModel.create(data);
  }

  static async updateHabit(
    id: string,
    userId: string,
    data: {
      name?: string;
      description?: string | null;
      category?: string;
      frequency?: HabitFrequency;
      target_count?: number;
      color?: string;
      icon?: string;
      active?: boolean;
    }
  ): Promise<Habit | null> {
    return HabitModel.update(id, userId, data);
  }

  static async deleteHabit(id: string, userId: string): Promise<boolean> {
    return HabitModel.delete(id, userId);
  }

  static async logHabit(habitId: string, userId: string, logDate: string, completed: boolean = true): Promise<HabitLog> {
    return HabitModel.logHabit(habitId, userId, logDate, completed);
  }

  static async removeLog(habitId: string, userId: string, logDate: string): Promise<boolean> {
    return HabitModel.removeLog(habitId, userId, logDate);
  }

  static async getHabitHistory(habitId: string, userId: string): Promise<HabitLog[]> {
    return HabitModel.getHabitHistory(habitId, userId);
  }

  static async getTodaySummary(userId: string) {
    return HabitModel.getTodaySummary(userId);
  }
}
