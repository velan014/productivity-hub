import { query } from '../config/db';
import {
  Subject,
  SubjectWithStats,
  StudySession,
  StudySessionWithSubject,
  StudySummary,
} from '../types';

export class StudyModel {
  // --- SUBJECTS ---

  static async findUserSubjects(userId: string): Promise<SubjectWithStats[]> {
    const rows = await query<any[]>(
      `SELECT 
        s.*,
        COUNT(ss.id) AS total_sessions,
        COALESCE(SUM(ss.duration_minutes), 0) AS completed_minutes,
        ROUND(COALESCE(SUM(ss.duration_minutes), 0) / 60, 2) AS completed_hours,
        CASE 
          WHEN s.target_hours <= 0 THEN 0
          ELSE LEAST(100, ROUND(((COALESCE(SUM(ss.duration_minutes), 0) / 60) / s.target_hours) * 100))
        END AS progress
       FROM subjects s
       LEFT JOIN study_sessions ss ON s.id = ss.subject_id AND ss.user_id = ?
       WHERE s.user_id = ?
       GROUP BY s.id
       ORDER BY s.created_at ASC`,
      [userId, userId]
    );

    return rows.map((r) => ({
      ...r,
      target_hours: Number(r.target_hours || 0),
      total_sessions: Number(r.total_sessions || 0),
      completed_minutes: Number(r.completed_minutes || 0),
      completed_hours: Number(r.completed_hours || 0),
      progress: Number(r.progress || 0),
    }));
  }

  static async findSubjectById(id: string, userId: string): Promise<SubjectWithStats | null> {
    const rows = await query<any[]>(
      `SELECT 
        s.*,
        COUNT(ss.id) AS total_sessions,
        COALESCE(SUM(ss.duration_minutes), 0) AS completed_minutes,
        ROUND(COALESCE(SUM(ss.duration_minutes), 0) / 60, 2) AS completed_hours,
        CASE 
          WHEN s.target_hours <= 0 THEN 0
          ELSE LEAST(100, ROUND(((COALESCE(SUM(ss.duration_minutes), 0) / 60) / s.target_hours) * 100))
        END AS progress
       FROM subjects s
       LEFT JOIN study_sessions ss ON s.id = ss.subject_id AND ss.user_id = ?
       WHERE s.id = ? AND s.user_id = ?
       GROUP BY s.id
       LIMIT 1`,
      [userId, id, userId]
    );

    if (!rows[0]) return null;
    const r = rows[0];
    return {
      ...r,
      target_hours: Number(r.target_hours || 0),
      total_sessions: Number(r.total_sessions || 0),
      completed_minutes: Number(r.completed_minutes || 0),
      completed_hours: Number(r.completed_hours || 0),
      progress: Number(r.progress || 0),
    };
  }

  static async createSubject(data: {
    id: string;
    user_id: string;
    name: string;
    code?: string | null;
    color?: string;
    target_hours?: number;
  }): Promise<SubjectWithStats> {
    const code = data.code || null;
    const color = data.color || 'blue';
    const targetHours = data.target_hours !== undefined ? Number(data.target_hours) : 0;

    await query(
      `INSERT INTO subjects (id, user_id, name, code, color, target_hours)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [data.id, data.user_id, data.name.trim(), code, color, targetHours]
    );

    const created = await this.findSubjectById(data.id, data.user_id);
    if (!created) {
      throw new Error('Failed to create subject');
    }
    return created;
  }

  static async updateSubject(
    id: string,
    userId: string,
    updates: Partial<Subject>
  ): Promise<SubjectWithStats | null> {
    const existing = await this.findSubjectById(id, userId);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name.trim());
    }
    if (updates.code !== undefined) {
      fields.push('code = ?');
      values.push(updates.code ? updates.code.trim() : null);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }
    if (updates.target_hours !== undefined) {
      fields.push('target_hours = ?');
      values.push(Number(updates.target_hours));
    }

    if (fields.length === 0) {
      return existing;
    }

    values.push(id, userId);
    await query(`UPDATE subjects SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values);
    return this.findSubjectById(id, userId);
  }

  static async deleteSubject(id: string, userId: string): Promise<boolean> {
    const res: any = await query('DELETE FROM subjects WHERE id = ? AND user_id = ?', [id, userId]);
    return res.affectedRows > 0;
  }

  // --- STUDY SESSIONS ---

  static async findSessions(
    userId: string,
    filters: {
      date?: string;
      startDate?: string;
      endDate?: string;
      subject_id?: string;
      type?: 'today' | 'upcoming' | 'recent' | 'all';
    } = {}
  ): Promise<StudySessionWithSubject[]> {
    let sql = `
      SELECT 
        ss.*,
        s.name AS subject_name,
        s.code AS subject_code,
        s.color AS subject_color
      FROM study_sessions ss
      JOIN subjects s ON ss.subject_id = s.id
      WHERE ss.user_id = ?
    `;
    const params: any[] = [userId];

    if (filters.subject_id && filters.subject_id !== 'all') {
      sql += ' AND ss.subject_id = ?';
      params.push(filters.subject_id);
    }

    if (filters.date) {
      sql += ' AND ss.date = ?';
      params.push(filters.date);
    } else if (filters.type === 'today') {
      sql += ' AND ss.date = CURDATE()';
    } else if (filters.type === 'upcoming') {
      sql += ' AND ss.date > CURDATE()';
    } else if (filters.type === 'recent') {
      sql += ' AND ss.date <= CURDATE()';
    }

    if (filters.startDate && filters.endDate) {
      sql += ' AND ss.date BETWEEN ? AND ?';
      params.push(filters.startDate, filters.endDate);
    }

    if (filters.type === 'upcoming') {
      sql += ' ORDER BY ss.date ASC, ss.start_time ASC';
    } else {
      sql += ' ORDER BY ss.date DESC, ss.start_time DESC';
    }

    const rows = await query<any[]>(sql, params);
    return rows.map((r) => ({
      ...r,
      duration_minutes: Number(r.duration_minutes || 0),
    }));
  }

  static async findSessionById(id: string, userId: string): Promise<StudySessionWithSubject | null> {
    const rows = await query<any[]>(
      `SELECT 
        ss.*,
        s.name AS subject_name,
        s.code AS subject_code,
        s.color AS subject_color
       FROM study_sessions ss
       JOIN subjects s ON ss.subject_id = s.id
       WHERE ss.id = ? AND ss.user_id = ?
       LIMIT 1`,
      [id, userId]
    );

    if (!rows[0]) return null;
    return {
      ...rows[0],
      duration_minutes: Number(rows[0].duration_minutes || 0),
    };
  }

  static calculateDurationMinutes(startTime: string, endTime: string): number {
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;
    if (endTotal <= startTotal) {
      throw new Error('End time must be after start time');
    }
    return endTotal - startTotal;
  }

  static async createSession(data: {
    id: string;
    user_id: string;
    subject_id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string | null;
  }): Promise<StudySessionWithSubject> {
    // Validate subject belongs to user
    const subject = await this.findSubjectById(data.subject_id, data.user_id);
    if (!subject) {
      throw new Error('Subject not found');
    }

    const durationMinutes = this.calculateDurationMinutes(data.start_time, data.end_time);
    const notes = data.notes || null;

    await query(
      `INSERT INTO study_sessions (
        id, user_id, subject_id, title, date, start_time, end_time, duration_minutes, notes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        data.id,
        data.user_id,
        data.subject_id,
        data.title.trim(),
        data.date,
        data.start_time,
        data.end_time,
        durationMinutes,
        notes,
      ]
    );

    const created = await this.findSessionById(data.id, data.user_id);
    if (!created) {
      throw new Error('Failed to create study session');
    }
    return created;
  }

  static async updateSession(
    id: string,
    userId: string,
    updates: Partial<StudySession>
  ): Promise<StudySessionWithSubject | null> {
    const existing = await this.findSessionById(id, userId);
    if (!existing) return null;

    if (updates.subject_id && updates.subject_id !== existing.subject_id) {
      const subject = await this.findSubjectById(updates.subject_id, userId);
      if (!subject) {
        throw new Error('Subject not found');
      }
    }

    const startTime = updates.start_time || existing.start_time;
    const endTime = updates.end_time || existing.end_time;
    const durationMinutes = this.calculateDurationMinutes(startTime, endTime);

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.subject_id !== undefined) {
      fields.push('subject_id = ?');
      values.push(updates.subject_id);
    }
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title.trim());
    }
    if (updates.date !== undefined) {
      fields.push('date = ?');
      values.push(updates.date);
    }
    if (updates.start_time !== undefined) {
      fields.push('start_time = ?');
      values.push(updates.start_time);
    }
    if (updates.end_time !== undefined) {
      fields.push('end_time = ?');
      values.push(updates.end_time);
    }
    fields.push('duration_minutes = ?');
    values.push(durationMinutes);

    if (updates.notes !== undefined) {
      fields.push('notes = ?');
      values.push(updates.notes || null);
    }

    values.push(id, userId);
    await query(`UPDATE study_sessions SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`, values);
    return this.findSessionById(id, userId);
  }

  static async deleteSession(id: string, userId: string): Promise<boolean> {
    const res: any = await query('DELETE FROM study_sessions WHERE id = ? AND user_id = ?', [id, userId]);
    return res.affectedRows > 0;
  }

  // --- STUDY SUMMARY & DASHBOARD STATS ---

  static async getStudySummary(userId: string): Promise<StudySummary> {
    // 1. Today's study minutes
    const [todayRow]: any = await query(
      `SELECT COALESCE(SUM(duration_minutes), 0) AS todayMinutes 
       FROM study_sessions 
       WHERE user_id = ? AND date = CURDATE()`,
      [userId]
    );
    const todayMinutes = Number(todayRow?.todayMinutes || 0);

    // 2. This week's study minutes (Monday to Sunday)
    const [weekRow]: any = await query(
      `SELECT COALESCE(SUM(duration_minutes), 0) AS weekMinutes 
       FROM study_sessions 
       WHERE user_id = ? AND YEARWEEK(date, 1) = YEARWEEK(CURDATE(), 1)`,
      [userId]
    );
    const weekMinutes = Number(weekRow?.weekMinutes || 0);

    // 3. Total target and total completed hours across all subjects
    const [subjectTotals]: any = await query(
      `SELECT 
        COALESCE(SUM(target_hours), 0) AS totalTargetHours,
        (SELECT COALESCE(SUM(duration_minutes), 0) FROM study_sessions WHERE user_id = ?) AS allMinutes
       FROM subjects 
       WHERE user_id = ?`,
      [userId, userId]
    );
    const targetHours = Number(subjectTotals?.totalTargetHours || 0);
    const totalHours = Math.round((Number(subjectTotals?.allMinutes || 0) / 60) * 10) / 10;
    const progressPercentage = targetHours > 0 ? Math.min(100, Math.round((totalHours / targetHours) * 100)) : 0;

    // 4. Today's sessions
    const todaySessions = await this.findSessions(userId, { type: 'today' });

    // 5. Upcoming sessions
    const upcomingSessions = await this.findSessions(userId, { type: 'upcoming' });

    return {
      todayMinutes,
      weekMinutes,
      totalHours,
      targetHours,
      progressPercentage,
      todaySessions,
      upcomingSessions,
    };
  }
}
