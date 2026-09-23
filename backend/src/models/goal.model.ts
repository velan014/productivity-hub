import { query } from '../config/db';
import { Goal, GoalFilters, GoalPriority, GoalStatus } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class GoalModel {
  static async findUserGoals(userId: string, filters: GoalFilters = {}): Promise<Goal[]> {
    let sql = 'SELECT * FROM goals WHERE user_id = ?';
    const params: any[] = [userId];

    if (filters.status && filters.status !== 'all') {
      sql += ' AND status = ?';
      params.push(filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      sql += ' AND priority = ?';
      params.push(filters.priority);
    }

    if (filters.category && filters.category !== 'all' && filters.category.trim() !== '') {
      sql += ' AND category = ?';
      params.push(filters.category.trim());
    }

    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = `%${filters.search.trim()}%`;
      sql += ' AND (title LIKE ? OR description LIKE ? OR category LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm);
    }

    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

    if (sortField === 'target_date') {
      sql += ` ORDER BY target_date IS NULL, target_date ${sortOrder}, created_at DESC`;
    } else if (sortField === 'progress') {
      sql += ` ORDER BY progress ${sortOrder}, created_at DESC`;
    } else if (sortField === 'priority') {
      if (sortOrder === 'DESC') {
        sql += ` ORDER BY FIELD(priority, 'high', 'medium', 'low'), created_at DESC`;
      } else {
        sql += ` ORDER BY FIELD(priority, 'low', 'medium', 'high'), created_at DESC`;
      }
    } else if (sortField === 'title') {
      sql += ` ORDER BY title ${sortOrder}`;
    } else {
      sql += ` ORDER BY created_at ${sortOrder}`;
    }

    return query<Goal[]>(sql, params);
  }

  static async findById(id: string, userId: string): Promise<Goal | null> {
    const rows = await query<Goal[]>(
      'SELECT * FROM goals WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] || null;
  }

  static async create(data: {
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
    const id = uuidv4();
    const priority = data.priority || 'medium';
    const progress = Math.max(0, Math.min(100, data.progress ?? 0));
    const status = data.status || (progress === 100 ? 'completed' : 'active');
    const category = data.category || 'General';
    const description = data.description || null;
    const startDate = data.start_date || null;
    const targetDate = data.target_date || null;
    const completedAt = status === 'completed' || progress === 100 ? new Date() : null;

    await query(
      `INSERT INTO goals (
        id, user_id, title, description, category, priority, status, progress, start_date, target_date, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.user_id,
        data.title,
        description,
        category,
        priority,
        status,
        progress,
        startDate,
        targetDate,
        completedAt,
      ]
    );

    const created = await this.findById(id, data.user_id);
    if (!created) throw new Error('Failed to retrieve created goal');
    return created;
  }

  static async update(
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
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    let progress = data.progress !== undefined ? Math.max(0, Math.min(100, data.progress)) : existing.progress;
    let status = data.status !== undefined ? data.status : existing.status;
    let completedAt = existing.completed_at;

    // Automatic status update if progress hits 100% or is reduced
    if (data.progress !== undefined) {
      if (progress === 100 && status !== 'completed') {
        status = 'completed';
        completedAt = new Date();
      } else if (progress < 100 && existing.status === 'completed' && data.status === undefined) {
        status = 'active';
        completedAt = null;
      }
    }

    if (data.status !== undefined) {
      if (data.status === 'completed' && !completedAt) {
        completedAt = new Date();
      } else if (data.status !== 'completed') {
        completedAt = null;
      }
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title);
    }
    if (data.description !== undefined) {
      updates.push('description = ?');
      params.push(data.description);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);
    }
    if (data.priority !== undefined) {
      updates.push('priority = ?');
      params.push(data.priority);
    }

    updates.push('progress = ?');
    params.push(progress);

    updates.push('status = ?');
    params.push(status);

    updates.push('completed_at = ?');
    params.push(completedAt);

    if (data.start_date !== undefined) {
      updates.push('start_date = ?');
      params.push(data.start_date);
    }
    if (data.target_date !== undefined) {
      updates.push('target_date = ?');
      params.push(data.target_date);
    }

    if (updates.length > 0) {
      params.push(id, userId);
      await query(
        `UPDATE goals SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        params
      );
    }

    return this.findById(id, userId);
  }

  static async updateProgress(id: string, userId: string, progress: number): Promise<Goal | null> {
    const boundedProgress = Math.max(0, Math.min(100, progress));
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    let status = existing.status;
    let completedAt = existing.completed_at;

    if (boundedProgress === 100) {
      status = 'completed';
      completedAt = new Date();
    } else if (boundedProgress < 100 && existing.status === 'completed') {
      status = 'active';
      completedAt = null;
    }

    await query(
      `UPDATE goals SET progress = ?, status = ?, completed_at = ? WHERE id = ? AND user_id = ?`,
      [boundedProgress, status, completedAt, id, userId]
    );

    return this.findById(id, userId);
  }

  static async updateStatus(id: string, userId: string, status: GoalStatus): Promise<Goal | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    let completedAt = existing.completed_at;
    let progress = existing.progress;

    if (status === 'completed') {
      completedAt = new Date();
      if (progress < 100) progress = 100;
    } else if (status === 'active' || status === 'paused') {
      completedAt = null;
      if (existing.status === 'completed' && progress === 100) {
        progress = 90; // Reopened
      }
    }

    await query(
      `UPDATE goals SET status = ?, progress = ?, completed_at = ? WHERE id = ? AND user_id = ?`,
      [status, progress, completedAt, id, userId]
    );

    return this.findById(id, userId);
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const result: any = await query(
      'DELETE FROM goals WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async getCategories(userId: string): Promise<string[]> {
    const rows = await query<{ category: string }[]>(
      'SELECT DISTINCT category FROM goals WHERE user_id = ? AND category IS NOT NULL ORDER BY category ASC',
      [userId]
    );
    return rows.map((r) => r.category);
  }

  static async getStats(userId: string): Promise<{
    activeCount: number;
    completedCount: number;
    nextTargetGoal: Goal | null;
  }> {
    const activeRows = await query<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM goals WHERE user_id = ? AND status = "active"',
      [userId]
    );
    const completedRows = await query<{ count: number }[]>(
      'SELECT COUNT(*) as count FROM goals WHERE user_id = ? AND status = "completed"',
      [userId]
    );
    const nextTargetRows = await query<Goal[]>(
      'SELECT * FROM goals WHERE user_id = ? AND status = "active" AND target_date >= CURDATE() ORDER BY target_date ASC LIMIT 1',
      [userId]
    );

    return {
      activeCount: activeRows[0]?.count || 0,
      completedCount: completedRows[0]?.count || 0,
      nextTargetGoal: nextTargetRows[0] || null,
    };
  }
}
