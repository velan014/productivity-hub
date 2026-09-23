import { query } from '../config/db';
import { FocusSession, FocusMode, FocusStats } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class FocusModel {
  static async findUserSessions(userId: string, limit: number = 30): Promise<FocusSession[]> {
    const sql = `
      SELECT fs.*, t.title as task_title 
      FROM focus_sessions fs
      LEFT JOIN tasks t ON fs.task_id = t.id
      WHERE fs.user_id = ?
      ORDER BY fs.started_at DESC
      LIMIT ?
    `;
    return query<FocusSession[]>(sql, [userId, limit]);
  }

  static async create(data: {
    user_id: string;
    task_id?: string | null;
    mode?: FocusMode;
    planned_minutes?: number;
    actual_minutes?: number;
    started_at?: string | Date;
    ended_at?: string | Date;
    completed?: boolean;
  }): Promise<FocusSession> {
    const id = uuidv4();
    const mode = data.mode || 'focus';
    const plannedMinutes = data.planned_minutes || 25;
    const actualMinutes = data.actual_minutes !== undefined ? data.actual_minutes : plannedMinutes;
    const taskId = data.task_id || null;
    const completed = data.completed !== undefined ? data.completed : true;

    const startedAt = data.started_at ? new Date(data.started_at) : new Date();
    const endedAt = data.ended_at ? new Date(data.ended_at) : new Date();

    await query(
      `INSERT INTO focus_sessions (
        id, user_id, task_id, mode, planned_minutes, actual_minutes, started_at, ended_at, completed
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.user_id,
        taskId,
        mode,
        plannedMinutes,
        actualMinutes,
        startedAt,
        endedAt,
        completed ? 1 : 0,
      ]
    );

    const rows = await query<FocusSession[]>(
      `SELECT fs.*, t.title as task_title 
       FROM focus_sessions fs
       LEFT JOIN tasks t ON fs.task_id = t.id
       WHERE fs.id = ? AND fs.user_id = ? LIMIT 1`,
      [id, data.user_id]
    );

    if (!rows[0]) throw new Error('Failed to retrieve created focus session');
    return rows[0];
  }

  static async getStats(userId: string): Promise<FocusStats> {
    // Today's focus
    const todayRows = await query<{ minutes: number | null; count: number }[]>(
      `SELECT SUM(actual_minutes) as minutes, COUNT(*) as count 
       FROM focus_sessions 
       WHERE user_id = ? AND mode = 'focus' AND completed = 1 AND DATE(started_at) = CURDATE()`,
      [userId]
    );

    // Week's focus (last 7 days)
    const weekRows = await query<{ minutes: number | null }[]>(
      `SELECT SUM(actual_minutes) as minutes 
       FROM focus_sessions 
       WHERE user_id = ? AND mode = 'focus' AND completed = 1 AND started_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`,
      [userId]
    );

    // Total completed sessions
    const totalRows = await query<{ count: number }[]>(
      `SELECT COUNT(*) as count 
       FROM focus_sessions 
       WHERE user_id = ? AND mode = 'focus' AND completed = 1`,
      [userId]
    );

    return {
      todayFocusMinutes: Number(todayRows[0]?.minutes) || 0,
      todaySessionsCount: Number(todayRows[0]?.count) || 0,
      weekFocusMinutes: Number(weekRows[0]?.minutes) || 0,
      completedSessionsCount: Number(totalRows[0]?.count) || 0,
    };
  }
}
