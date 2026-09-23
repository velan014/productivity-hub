import { DailyReviewModel } from '../models/dailyReview.model';
import { DailyReview, DaySummary } from '../types';

export class DailyReviewService {
  static async getReviewByDate(userId: string, date: string): Promise<{ review: DailyReview | null; summary: DaySummary }> {
    const review = await DailyReviewModel.findByDate(userId, date);
    const summary = await DailyReviewModel.getDaySummary(userId, date);
    return { review, summary };
  }

  static async saveReview(userId: string, data: any): Promise<DailyReview> {
    return DailyReviewModel.saveReview({
      user_id: userId,
      ...data,
    });
  }

  static async getHistory(userId: string, limit: number = 30): Promise<DailyReview[]> {
    return DailyReviewModel.getHistory(userId, limit);
  }
}
