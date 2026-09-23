import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { DailyReview, DaySummary, MoodType } from '../types';

export class DailyReviewModel {
  static async findByDate(userId: string, date: string): Promise<DailyReview | null> {
    const rows = await query<DailyReview[]>(
      'SELECT * FROM daily_reviews WHERE user_id = ? AND review_date = ? LIMIT 1',
      [userId, date]
    );
    return rows[0] || null;
  }

  static async findById(id: string, userId: string): Promise<DailyReview | null> {
    const rows = await query<DailyReview[]>(
      'SELECT * FROM daily_reviews WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] || null;
  }

  static async getDaySummary(userId: string, date: string): Promise<DaySummary> {
    // 1. Tasks due on or completed on this date
    const [taskStats]: any = await query(
      `SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'completed' AND (DATE(completed_at) = ? OR due_date = ?) THEN 1 ELSE 0 END) as completed
       FROM tasks 
       WHERE user_id = ? AND (due_date = ? OR DATE(completed_at) = ?)`,
      [date, date, userId, date, date]
    );
    const tasksTotal = Number(taskStats?.total || 0);
    const tasksCompleted = Number(taskStats?.completed || 0);
    const tasksRemaining = Math.max(0, tasksTotal - tasksCompleted);

    // 2. Focus minutes on this date
    const [focusStats]: any = await query(
      `SELECT COALESCE(SUM(actual_minutes), 0) as focusMinutes 
       FROM focus_sessions 
       WHERE user_id = ? AND DATE(started_at) = ? AND completed = 1`,
      [userId, date]
    );
    const focusMinutes = Number(focusStats?.focusMinutes || 0);

    // 3. Study minutes on this date
    const [studyStats]: any = await query(
      `SELECT COALESCE(SUM(duration_minutes), 0) as studyMinutes 
       FROM study_sessions 
       WHERE user_id = ? AND date = ?`,
      [userId, date]
    );
    const studyMinutes = Number(studyStats?.studyMinutes || 0);

    // 4. Habits on this date
    const [habitStats]: any = await query(
      `SELECT 
        (SELECT COUNT(*) FROM habits WHERE user_id = ? AND active = 1) as total,
        (SELECT COUNT(*) FROM habit_logs WHERE user_id = ? AND log_date = ? AND completed = 1) as completed`,
      [userId, userId, date]
    );
    const habitsTotal = Number(habitStats?.total || 0);
    const habitsCompleted = Number(habitStats?.completed || 0);

    // 5. Goals average progress
    const [goalStats]: any = await query(
      `SELECT COALESCE(AVG(progress), 0) as avgProgress 
       FROM goals 
       WHERE user_id = ? AND status != 'paused'`,
      [userId]
    );
    const goalsProgressAvg = Math.round(Number(goalStats?.avgProgress || 0));

    return {
      date,
      tasksTotal,
      tasksCompleted,
      tasksRemaining,
      focusMinutes,
      studyMinutes,
      habitsTotal,
      habitsCompleted,
      goalsProgressAvg,
    };
  }

  static async saveReview(data: {
    user_id: string;
    review_date: string;
    what_went_well?: string | null;
    challenges?: string | null;
    learned?: string | null;
    improvements?: string | null;
    mood?: MoodType;
    rating?: number;
  }): Promise<DailyReview> {
    const existing = await this.findByDate(data.user_id, data.review_date);
    const mood = data.mood || 'good';
    const rating = data.rating !== undefined ? Math.max(1, Math.min(5, Number(data.rating))) : 3;
    const whatWentWell = data.what_went_well || null;
    const challenges = data.challenges || null;
    const learned = data.learned || null;
    const improvements = data.improvements || null;

    if (existing) {
      await query(
        `UPDATE daily_reviews 
         SET what_went_well = ?, challenges = ?, learned = ?, improvements = ?, mood = ?, rating = ?
         WHERE user_id = ? AND review_date = ?`,
        [whatWentWell, challenges, learned, improvements, mood, rating, data.user_id, data.review_date]
      );
      const updated = await this.findByDate(data.user_id, data.review_date);
      return updated!;
    } else {
      const id = uuidv4();
      await query(
        `INSERT INTO daily_reviews (
          id, user_id, review_date, what_went_well, challenges, learned, improvements, mood, rating
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [id, data.user_id, data.review_date, whatWentWell, challenges, learned, improvements, mood, rating]
      );
      const created = await this.findByDate(data.user_id, data.review_date);
      return created!;
    }
  }

  static async getHistory(userId: string, limit: number = 30): Promise<DailyReview[]> {
    const rows = await query<DailyReview[]>(
      'SELECT * FROM daily_reviews WHERE user_id = ? ORDER BY review_date DESC LIMIT ?',
      [userId, limit]
    );
    return rows;
  }
}
