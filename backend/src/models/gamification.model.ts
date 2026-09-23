import { query } from '../config/db';
import { UserGamification, AchievementWithStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class GamificationModel {
  /**
   * Get or create the gamification profile for a user
   */
  static async getOrCreate(userId: string): Promise<UserGamification> {
    const rows = await query<any[]>(
      'SELECT * FROM user_gamification WHERE user_id = ?',
      [userId]
    );

    if (rows.length > 0) {
      return rows[0] as UserGamification;
    }

    // Initialize with 0 XP, level 1
    await query(
      `INSERT INTO user_gamification 
        (user_id, xp, level, total_completed_tasks, total_focus_minutes, total_study_minutes, current_streak, longest_streak)
       VALUES (?, 0, 1, 0, 0, 0, 0, 0)
       ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
      [userId]
    );

    const createdRows = await query<any[]>(
      'SELECT * FROM user_gamification WHERE user_id = ?',
      [userId]
    );
    return createdRows[0] as UserGamification;
  }

  /**
   * Update gamification profile fields
   */
  static async update(userId: string, data: Partial<UserGamification>): Promise<void> {
    const fields: string[] = [];
    const values: any[] = [];

    if (data.xp !== undefined) {
      fields.push('xp = ?');
      values.push(data.xp);
    }
    if (data.level !== undefined) {
      fields.push('level = ?');
      values.push(data.level);
    }
    if (data.total_completed_tasks !== undefined) {
      fields.push('total_completed_tasks = ?');
      values.push(data.total_completed_tasks);
    }
    if (data.total_focus_minutes !== undefined) {
      fields.push('total_focus_minutes = ?');
      values.push(data.total_focus_minutes);
    }
    if (data.total_study_minutes !== undefined) {
      fields.push('total_study_minutes = ?');
      values.push(data.total_study_minutes);
    }
    if (data.current_streak !== undefined) {
      fields.push('current_streak = ?');
      values.push(data.current_streak);
    }
    if (data.longest_streak !== undefined) {
      fields.push('longest_streak = ?');
      values.push(data.longest_streak);
    }

    if (fields.length === 0) return;

    values.push(userId);
    await query(
      `UPDATE user_gamification SET ${fields.join(', ')} WHERE user_id = ?`,
      values
    );
  }

  /**
   * Get all achievements catalog with earned status for this user
   */
  static async getAchievementsWithStatus(userId: string): Promise<AchievementWithStatus[]> {
    const sql = `
      SELECT 
        a.id,
        a.code,
        a.name,
        a.description,
        a.icon,
        a.category,
        a.xp_reward,
        a.created_at,
        CASE WHEN ua.id IS NOT NULL THEN TRUE ELSE FALSE END AS is_earned,
        ua.earned_at
      FROM achievements a
      LEFT JOIN user_achievements ua 
        ON a.id = ua.achievement_id AND ua.user_id = ?
      ORDER BY is_earned DESC, a.xp_reward ASC, a.name ASC
    `;

    const rows = await query<any[]>(sql, [userId]);
    return rows.map((r: any) => ({
      ...r,
      is_earned: Boolean(r.is_earned),
      earned_at: r.earned_at ? new Date(r.earned_at).toISOString() : null,
    })) as AchievementWithStatus[];
  }

  /**
   * Award an achievement by code if not already unlocked.
   * Returns true if newly awarded, false if already earned.
   */
  static async awardAchievement(userId: string, achievementCode: string): Promise<{ awarded: boolean; xpAwarded: number }> {
    // 1. Get achievement definition
    const achRows = await query<any[]>(
      'SELECT id, xp_reward FROM achievements WHERE code = ?',
      [achievementCode]
    );

    if (achRows.length === 0) {
      return { awarded: false, xpAwarded: 0 };
    }

    const ach = achRows[0];

    // 2. Check if already earned
    const earnedRows = await query<any[]>(
      'SELECT id FROM user_achievements WHERE user_id = ? AND achievement_id = ?',
      [userId, ach.id]
    );

    if (earnedRows.length > 0) {
      return { awarded: false, xpAwarded: 0 };
    }

    // 3. Insert user achievement
    const newId = uuidv4();
    await query(
      'INSERT INTO user_achievements (id, user_id, achievement_id) VALUES (?, ?, ?)',
      [newId, userId, ach.id]
    );

    return { awarded: true, xpAwarded: ach.xp_reward };
  }

  /**
   * Calculate real-time stats from activity tables to ensure sync
   */
  static async getRealActivityStats(userId: string): Promise<{
    completedTasks: number;
    focusMinutes: number;
    studyMinutes: number;
    completedHabitsCount: number;
    completedGoalsCount: number;
    completedProjectsCount: number;
    dailyReviewsCount: number;
    morningPlansCount: number;
    currentStreak: number;
  }> {
    // 1. Completed tasks
    const taskRows = await query<any[]>(
      "SELECT COUNT(*) as cnt FROM tasks WHERE user_id = ? AND status = 'completed'",
      [userId]
    );
    const completedTasks = Number(taskRows[0]?.cnt || 0);

    // 2. Focus minutes
    const focusRows = await query<any[]>(
      'SELECT COALESCE(SUM(actual_minutes), 0) as total FROM focus_sessions WHERE user_id = ? AND completed = 1',
      [userId]
    );
    const focusMinutes = Number(focusRows[0]?.total || 0);

    // 3. Study minutes
    const studyRows = await query<any[]>(
      'SELECT COALESCE(SUM(duration_minutes), 0) as total FROM study_sessions WHERE user_id = ?',
      [userId]
    );
    const studyMinutes = Number(studyRows[0]?.total || 0);

    // 4. Completed Habit logs count
    const habitRows = await query<any[]>(
      'SELECT COUNT(*) as cnt FROM habit_logs WHERE user_id = ? AND completed = 1',
      [userId]
    );
    const completedHabitsCount = Number(habitRows[0]?.cnt || 0);

    // 5. Completed Goals count
    const goalRows = await query<any[]>(
      "SELECT COUNT(*) as cnt FROM goals WHERE user_id = ? AND status = 'completed'",
      [userId]
    );
    const completedGoalsCount = Number(goalRows[0]?.cnt || 0);

    // 6. Completed Projects count
    const projectRows = await query<any[]>(
      "SELECT COUNT(*) as cnt FROM projects WHERE user_id = ? AND status = 'completed'",
      [userId]
    );
    const completedProjectsCount = Number(projectRows[0]?.cnt || 0);

    // 7. Daily Reviews count
    const reviewRows = await query<any[]>(
      'SELECT COUNT(*) as cnt FROM daily_reviews WHERE user_id = ?',
      [userId]
    );
    const dailyReviewsCount = Number(reviewRows[0]?.cnt || 0);

    // 8. Morning Plans count
    const planRows = await query<any[]>(
      'SELECT COUNT(*) as cnt FROM morning_plans WHERE user_id = ?',
      [userId]
    );
    const morningPlansCount = Number(planRows[0]?.cnt || 0);

    // 9. Habit streak calculation
    const streakDates = await query<any[]>(
      `SELECT DISTINCT log_date 
       FROM habit_logs 
       WHERE user_id = ? AND completed = 1 
       ORDER BY log_date DESC`,
      [userId]
    );

    let currentStreak = 0;
    if (streakDates.length > 0) {
      const today = new Date();
      const todayStr = today.toISOString().slice(0, 10);
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().slice(0, 10);

      const dates = streakDates.map((r: any) => {
        const d = new Date(r.log_date);
        return d.toISOString().slice(0, 10);
      });

      if (dates.includes(todayStr) || dates.includes(yesterdayStr)) {
        let checkDate = dates.includes(todayStr) ? new Date(today) : new Date(yesterday);
        while (true) {
          const s = checkDate.toISOString().slice(0, 10);
          if (dates.includes(s)) {
            currentStreak++;
            checkDate.setDate(checkDate.getDate() - 1);
          } else {
            break;
          }
        }
      }
    }

    return {
      completedTasks,
      focusMinutes,
      studyMinutes,
      completedHabitsCount,
      completedGoalsCount,
      completedProjectsCount,
      dailyReviewsCount,
      morningPlansCount,
      currentStreak,
    };
  }
}

