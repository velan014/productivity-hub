import { query } from '../config/db';
import { Habit, HabitFrequency, HabitLog, HabitWithStats } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class HabitModel {
  static async findUserHabits(userId: string): Promise<HabitWithStats[]> {
    const habits = await query<Habit[]>(
      'SELECT * FROM habits WHERE user_id = ? ORDER BY active DESC, created_at ASC',
      [userId]
    );

    if (habits.length === 0) return [];

    const habitIds = habits.map((h) => h.id);
    const placeholders = habitIds.map(() => '?').join(',');

    // Fetch all logs for these habits
    const logs = await query<HabitLog[]>(
      `SELECT * FROM habit_logs WHERE habit_id IN (${placeholders}) AND user_id = ? AND completed = 1 ORDER BY log_date ASC`,
      [...habitIds, userId]
    );

    // Group logs by habit_id
    const logsByHabit = new Map<string, string[]>();
    for (const log of logs) {
      // Ensure date string YYYY-MM-DD
      const dateStr = typeof log.log_date === 'string' 
        ? log.log_date.slice(0, 10) 
        : new Date(log.log_date).toISOString().slice(0, 10);
      
      const list = logsByHabit.get(log.habit_id) || [];
      list.push(dateStr);
      logsByHabit.set(log.habit_id, list);
    }

    const todayStr = new Date().toISOString().slice(0, 10);

    // Generate last 7 days array
    const last7Days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      last7Days.push(d.toISOString().slice(0, 10));
    }

    return habits.map((h) => {
      const dateList = logsByHabit.get(h.id) || [];
      const dateSet = new Set(dateList);

      const isCompletedToday = dateSet.has(todayStr);

      // Calculate recentLogs map (last 7 days)
      const recentLogs: { [dateStr: string]: boolean } = {};
      for (const d of last7Days) {
        recentLogs[d] = dateSet.has(d);
      }

      // Calculate streak
      const { currentStreak, longestStreak } = this.calculateStreaks(dateList, todayStr);

      return {
        ...h,
        currentStreak,
        longestStreak,
        isCompletedToday,
        recentLogs,
      };
    });
  }

  private static calculateStreaks(sortedDateStrings: string[], todayStr: string): { currentStreak: number; longestStreak: number } {
    if (sortedDateStrings.length === 0) {
      return { currentStreak: 0, longestStreak: 0 };
    }

    const uniqueDates = Array.from(new Set(sortedDateStrings)).sort();
    const dateSet = new Set(uniqueDates);

    // 1. Longest Streak
    let maxStreak = 0;
    let currentRun = 0;
    let prevDate: Date | null = null;

    for (const dateStr of uniqueDates) {
      const currentDate = new Date(dateStr + 'T00:00:00');
      if (prevDate) {
        const diffDays = Math.round((currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) {
          currentRun++;
        } else if (diffDays > 1) {
          currentRun = 1;
        }
      } else {
        currentRun = 1;
      }
      if (currentRun > maxStreak) {
        maxStreak = currentRun;
      }
      prevDate = currentDate;
    }

    // 2. Current Streak
    let currentStreak = 0;
    let checkDate = new Date(todayStr + 'T00:00:00');

    // If not completed today, check if completed yesterday to keep streak alive
    const todayFormatted = todayStr;
    const yesterday = new Date(checkDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayFormatted = yesterday.toISOString().slice(0, 10);

    if (dateSet.has(todayFormatted)) {
      currentStreak++;
      checkDate = yesterday;
    } else if (dateSet.has(yesterdayFormatted)) {
      checkDate = yesterday;
    } else {
      return { currentStreak: 0, longestStreak: maxStreak };
    }

    // Walk backward day by day
    while (true) {
      const dStr = checkDate.toISOString().slice(0, 10);
      if (dateSet.has(dStr)) {
        if (dStr !== todayFormatted) {
          currentStreak++;
        }
        checkDate.setDate(checkDate.getDate() - 1);
      } else {
        break;
      }
    }

    return {
      currentStreak,
      longestStreak: Math.max(maxStreak, currentStreak),
    };
  }

  static async findById(id: string, userId: string): Promise<Habit | null> {
    const rows = await query<Habit[]>(
      'SELECT * FROM habits WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] || null;
  }

  static async create(data: {
    user_id: string;
    name: string;
    description?: string | null;
    category?: string;
    frequency?: HabitFrequency;
    target_count?: number;
    color?: string;
    icon?: string;
  }): Promise<Habit> {
    const id = uuidv4();
    const frequency = data.frequency || 'daily';
    const targetCount = data.target_count || 1;
    const category = data.category || 'General';
    const color = data.color || 'emerald';
    const icon = data.icon || 'Repeat';
    const description = data.description || null;

    await query(
      `INSERT INTO habits (
        id, user_id, name, description, category, frequency, target_count, color, icon, active
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [id, data.user_id, data.name, description, category, frequency, targetCount, color, icon]
    );

    const created = await this.findById(id, data.user_id);
    if (!created) throw new Error('Failed to retrieve created habit');
    return created;
  }

  static async update(
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
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      params.push(data.name);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);
    }
    if (data.frequency !== undefined) {
      updates.push('frequency = ?');
      params.push(data.frequency);
    }
    if (data.target_count !== undefined) {
      updates.push('target_count = ?');
      params.push(data.target_count);
    }
    if (data.color !== undefined) {
      updates.push('color = ?');
      params.push(data.color);
    }
    if (data.icon !== undefined) {
      updates.push('icon = ?');
      params.push(data.icon);
    }
    if (data.active !== undefined) {
      updates.push('active = ?');
      params.push(data.active ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(id, userId);
      await query(
        `UPDATE habits SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        params
      );
    }

    return this.findById(id, userId);
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const result: any = await query(
      'DELETE FROM habits WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async logHabit(habitId: string, userId: string, logDate: string, completed: boolean = true): Promise<HabitLog> {
    // Verify habit belongs to user
    const habit = await this.findById(habitId, userId);
    if (!habit) throw new Error('Habit not found');

    const id = uuidv4();
    const dateFormatted = logDate.slice(0, 10);

    await query(
      `INSERT INTO habit_logs (id, habit_id, user_id, log_date, completed, completed_at)
       VALUES (?, ?, ?, ?, ?, NOW())
       ON DUPLICATE KEY UPDATE completed = VALUES(completed), completed_at = NOW()`,
      [id, habitId, userId, dateFormatted, completed ? 1 : 0]
    );

    const rows = await query<HabitLog[]>(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND log_date = ? LIMIT 1',
      [habitId, dateFormatted]
    );
    return rows[0];
  }

  static async removeLog(habitId: string, userId: string, logDate: string): Promise<boolean> {
    const dateFormatted = logDate.slice(0, 10);
    const result: any = await query(
      'DELETE FROM habit_logs WHERE habit_id = ? AND user_id = ? AND log_date = ?',
      [habitId, userId, dateFormatted]
    );
    return result.affectedRows > 0;
  }

  static async getHabitHistory(habitId: string, userId: string): Promise<HabitLog[]> {
    return query<HabitLog[]>(
      'SELECT * FROM habit_logs WHERE habit_id = ? AND user_id = ? ORDER BY log_date DESC LIMIT 90',
      [habitId, userId]
    );
  }

  static async getTodaySummary(userId: string): Promise<{ completed: number; total: number }> {
    const activeHabits = await query<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM habits WHERE user_id = ? AND active = 1',
      [userId]
    );
    const todayCompleted = await query<{ count: number }[]>(
      `SELECT COUNT(DISTINCT h.id) as count 
       FROM habits h 
       INNER JOIN habit_logs hl ON h.id = hl.habit_id 
       WHERE h.user_id = ? AND h.active = 1 AND hl.log_date = CURDATE() AND hl.completed = 1`,
      [userId]
    );

    return {
      total: activeHabits[0]?.count || 0,
      completed: todayCompleted[0]?.count || 0,
    };
  }
}
