import { GoalModel } from '../models/goal.model';
import { Goal, GoalFilters, GoalPriority, GoalStatus } from '../types';

export class GoalService {
  static async getGoals(userId: string, filters: GoalFilters = {}): Promise<Goal[]> {
    return GoalModel.findUserGoals(userId, filters);
  }

  static async getGoalById(id: string, userId: string): Promise<Goal | null> {
    return GoalModel.findById(id, userId);
  }

  static async createGoal(data: {
    user_id: string;
    title: string;
    description?: string | null;
    category?: string;
    priority?: GoalPriority;
    status?: GoalStatus;
    progress?: number;
    start_date?: string | null;
    target_date?: string | null;
  }): Promise<Goal> {
    return GoalModel.create(data);
  }

  static async updateGoal(
    id: string,
    userId: string,
    data: {
      title?: string;
      description?: string | null;
      category?: string;
      priority?: GoalPriority;
      status?: GoalStatus;
      progress?: number;
      start_date?: string | null;
      target_date?: string | null;
    }
  ): Promise<Goal | null> {
    return GoalModel.update(id, userId, data);
  }

  static async updateProgress(id: string, userId: string, progress: number): Promise<Goal | null> {
    return GoalModel.updateProgress(id, userId, progress);
  }

  static async updateStatus(id: string, userId: string, status: GoalStatus): Promise<Goal | null> {
    return GoalModel.updateStatus(id, userId, status);
  }

  static async deleteGoal(id: string, userId: string): Promise<boolean> {
    return GoalModel.delete(id, userId);
  }

  static async getCategories(userId: string): Promise<string[]> {
    return GoalModel.getCategories(userId);
  }

  static async getStats(userId: string) {
    return GoalModel.getStats(userId);
  }
}
