import { MorningPlanModel } from '../models/morningPlan.model';
import { MorningPlanWithTasks } from '../types';

export class MorningPlanService {
  static async getPlanByDate(userId: string, date: string): Promise<MorningPlanWithTasks | null> {
    return MorningPlanModel.findByDate(userId, date);
  }

  static async savePlan(userId: string, data: any): Promise<MorningPlanWithTasks> {
    return MorningPlanModel.savePlan({
      user_id: userId,
      ...data,
    });
  }
}
