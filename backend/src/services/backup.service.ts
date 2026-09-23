import { query } from '../config/db';
import { ExportBackupData, UserSafe } from '../types';
import { GamificationModel } from '../models/gamification.model';
import { v4 as uuidv4 } from 'uuid';

export class BackupService {
  /**
   * Export all user data as a sanitized, structured JSON object
   */
  static async exportUserData(userId: string): Promise<ExportBackupData> {
    // 1. User profile without password_hash
    const userRows = await query<any[]>(
      'SELECT id, name, email, avatar, created_at, updated_at FROM users WHERE id = ?',
      [userId]
    );

    if (userRows.length === 0) {
      throw new Error('User not found');
    }

    const user: UserSafe = userRows[0] as UserSafe;

    // 2. Tasks
    const tasks = await query<any[]>(
      'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );

    // 3. Projects
    const projects = await query<any[]>(
      'SELECT * FROM projects WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );

    // 4. Subjects
    const subjects = await query<any[]>(
      'SELECT * FROM subjects WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );

    // 5. Study Sessions
    const studySessions = await query<any[]>(
      'SELECT * FROM study_sessions WHERE user_id = ? ORDER BY date DESC, start_time DESC',
      [userId]
    );

    // 6. Goals
    const goals = await query<any[]>(
      'SELECT * FROM goals WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );

    // 7. Habits
    const habits = await query<any[]>(
      'SELECT * FROM habits WHERE user_id = ? ORDER BY created_at ASC',
      [userId]
    );

    // 8. Habit Logs
    const habitLogs = await query<any[]>(
      'SELECT * FROM habit_logs WHERE user_id = ? ORDER BY log_date DESC',
      [userId]
    );

    // 9. Focus Sessions
    const focusSessions = await query<any[]>(
      'SELECT * FROM focus_sessions WHERE user_id = ? ORDER BY started_at DESC',
      [userId]
    );

    // 10. Notes
    const notes = await query<any[]>(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY updated_at DESC',
      [userId]
    );

    // 11. Daily Reviews
    const dailyReviews = await query<any[]>(
      'SELECT * FROM daily_reviews WHERE user_id = ? ORDER BY review_date DESC',
      [userId]
    );

    // 12. Morning Plans
    const morningPlans = await query<any[]>(
      'SELECT * FROM morning_plans WHERE user_id = ? ORDER BY plan_date DESC',
      [userId]
    );

    // 13. Gamification
    const gamificationRows = await query<any[]>(
      'SELECT * FROM user_gamification WHERE user_id = ?',
      [userId]
    );
    const gamification = gamificationRows.length > 0 ? (gamificationRows[0] as any) : null;

    // 14. Achievements
    const achievements = await GamificationModel.getAchievementsWithStatus(userId);

    return {
      version: '4.0',
      exported_at: new Date().toISOString(),
      user,
      tasks: tasks as any,
      projects: projects as any,
      subjects: subjects as any,
      study_sessions: studySessions as any,
      goals: goals as any,
      habits: habits as any,
      habit_logs: habitLogs as any,
      focus_sessions: focusSessions as any,
      notes: notes as any,
      daily_reviews: dailyReviews as any,
      morning_plans: morningPlans as any,
      gamification,
      achievements,
    };
  }

  /**
   * Safely import JSON backup data without dropping existing records
   */
  static async importUserData(
    userId: string,
    data: any
  ): Promise<{ importedCounts: Record<string, number>; message: string }> {
    if (!data || typeof data !== 'object') {
      throw new Error('Invalid backup file payload. Must be a valid JSON object.');
    }

    const counts: Record<string, number> = {
      tasks: 0,
      goals: 0,
      habits: 0,
      notes: 0,
      projects: 0,
      subjects: 0,
    };

    // 1. Import Projects (if array)
    if (Array.isArray(data.projects)) {
      for (const p of data.projects) {
        if (p && p.name) {
          const id = p.id || uuidv4();
          await query(
            `INSERT INTO projects (id, user_id, name, description, status, priority, start_date, due_date, color)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name = VALUES(name), description = VALUES(description), status = VALUES(status)`,
            [
              id,
              userId,
              p.name,
              p.description || null,
              p.status || 'planning',
              p.priority || 'medium',
              p.start_date || null,
              p.due_date || null,
              p.color || 'indigo',
            ]
          );
          counts.projects++;
        }
      }
    }

    // 2. Import Tasks (if array)
    if (Array.isArray(data.tasks)) {
      for (const t of data.tasks) {
        if (t && t.title) {
          const id = t.id || uuidv4();
          await query(
            `INSERT INTO tasks (id, user_id, project_id, title, description, priority, status, category, due_date, due_time, estimated_minutes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title), description = VALUES(description), status = VALUES(status)`,
            [
              id,
              userId,
              t.project_id || null,
              t.title,
              t.description || null,
              t.priority || 'medium',
              t.status || 'todo',
              t.category || 'General',
              t.due_date || null,
              t.due_time || null,
              t.estimated_minutes || null,
            ]
          );
          counts.tasks++;
        }
      }
    }

    // 3. Import Goals (if array)
    if (Array.isArray(data.goals)) {
      for (const g of data.goals) {
        if (g && g.title) {
          const id = g.id || uuidv4();
          await query(
            `INSERT INTO goals (id, user_id, title, description, category, priority, status, progress, start_date, target_date)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title), progress = VALUES(progress), status = VALUES(status)`,
            [
              id,
              userId,
              g.title,
              g.description || null,
              g.category || 'General',
              g.priority || 'medium',
              g.status || 'active',
              g.progress || 0,
              g.start_date || null,
              g.target_date || null,
            ]
          );
          counts.goals++;
        }
      }
    }

    // 4. Import Habits (if array)
    if (Array.isArray(data.habits)) {
      for (const h of data.habits) {
        if (h && h.name) {
          const id = h.id || uuidv4();
          await query(
            `INSERT INTO habits (id, user_id, name, description, category, frequency, target_count, color, icon, active)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name = VALUES(name), active = VALUES(active)`,
            [
              id,
              userId,
              h.name,
              h.description || null,
              h.category || 'General',
              h.frequency || 'daily',
              h.target_count || 1,
              h.color || 'emerald',
              h.icon || 'Repeat',
              h.active !== undefined ? (h.active ? 1 : 0) : 1,
            ]
          );
          counts.habits++;
        }
      }
    }

    // 5. Import Notes (if array)
    if (Array.isArray(data.notes)) {
      for (const n of data.notes) {
        if (n && n.title) {
          const id = n.id || uuidv4();
          await query(
            `INSERT INTO notes (id, user_id, title, content, category, is_pinned)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE title = VALUES(title), content = VALUES(content)`,
            [
              id,
              userId,
              n.title,
              n.content || '',
              n.category || 'General',
              n.is_pinned ? 1 : 0,
            ]
          );
          counts.notes++;
        }
      }
    }

    // 6. Import Subjects (if array)
    if (Array.isArray(data.subjects)) {
      for (const s of data.subjects) {
        if (s && s.name) {
          const id = s.id || uuidv4();
          await query(
            `INSERT INTO subjects (id, user_id, name, code, color, target_hours)
             VALUES (?, ?, ?, ?, ?, ?)
             ON DUPLICATE KEY UPDATE name = VALUES(name), target_hours = VALUES(target_hours)`,
            [
              id,
              userId,
              s.name,
              s.code || null,
              s.color || 'blue',
              s.target_hours || 0,
            ]
          );
          counts.subjects++;
        }
      }
    }

    return {
      importedCounts: counts,
      message: 'Backup data successfully processed and merged.',
    };
  }
}
