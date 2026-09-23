import { query } from '../config/db';
import { Task, TaskFilters, TaskPriority, TaskStatus, DashboardData } from '../types';

export class TaskModel {
  static async findUserTasks(userId: string, filters: TaskFilters = {}): Promise<Task[]> {
    let sql = `
      SELECT t.*, p.name as project_name, p.color as project_color 
      FROM tasks t 
      LEFT JOIN projects p ON t.project_id = p.id 
      WHERE t.user_id = ?
    `;
    const params: any[] = [userId];

    // Filter by tab
    if (filters.tab === 'today') {
      sql += ' AND t.due_date = CURDATE()';
    } else if (filters.tab === 'upcoming') {
      sql += ' AND t.due_date > CURDATE() AND t.status != "completed"';
    } else if (filters.tab === 'overdue') {
      sql += ' AND t.due_date < CURDATE() AND t.status != "completed"';
    } else if (filters.tab === 'completed') {
      sql += ' AND t.status = "completed"';
    }

    // Filter by priority
    if (filters.priority && filters.priority !== 'all') {
      sql += ' AND t.priority = ?';
      params.push(filters.priority);
    }

    // Filter by status
    if (filters.status && filters.status !== 'all') {
      sql += ' AND t.status = ?';
      params.push(filters.status);
    }

    // Filter by category
    if (filters.category && filters.category !== 'all' && filters.category.trim() !== '') {
      sql += ' AND t.category = ?';
      params.push(filters.category.trim());
    }

    // Filter by project_id
    if (filters.project_id && filters.project_id !== 'all') {
      if (filters.project_id === 'none') {
        sql += ' AND t.project_id IS NULL';
      } else {
        sql += ' AND t.project_id = ?';
        params.push(filters.project_id);
      }
    }

    // Filter by search term
    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = `%${filters.search.trim()}%`;
      sql += ' AND (t.title LIKE ? OR t.description LIKE ? OR t.category LIKE ? OR p.name LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    // Sorting
    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

    if (sortField === 'due_date') {
      // Null due dates last
      sql += ` ORDER BY t.due_date IS NULL, t.due_date ${sortOrder}, t.due_time ${sortOrder}, t.created_at DESC`;
    } else if (sortField === 'priority') {
      // High > Medium > Low or inverse
      if (sortOrder === 'DESC') {
        sql += ` ORDER BY FIELD(t.priority, 'high', 'medium', 'low'), t.created_at DESC`;
      } else {
        sql += ` ORDER BY FIELD(t.priority, 'low', 'medium', 'high'), t.created_at DESC`;
      }
    } else if (sortField === 'title') {
      sql += ` ORDER BY t.title ${sortOrder}`;
    } else {
      sql += ` ORDER BY t.created_at ${sortOrder}`;
    }

    const rows = await query<Task[]>(sql, params);
    return rows;
  }

  static async findById(id: string, userId: string): Promise<Task | null> {
    const rows = await query<Task[]>(
      `SELECT t.*, p.name as project_name, p.color as project_color 
       FROM tasks t 
       LEFT JOIN projects p ON t.project_id = p.id 
       WHERE t.id = ? AND t.user_id = ? LIMIT 1`,
      [id, userId]
    );
    return rows[0] || null;
  }

  static async create(task: {
    id: string;
    user_id: string;
    project_id?: string | null;
    title: string;
    description?: string | null;
    priority?: TaskPriority;
    status?: TaskStatus;
    category?: string;
    due_date?: string | null;
    due_time?: string | null;
    estimated_minutes?: number | null;
  }): Promise<Task> {
    const priority = task.priority || 'medium';
    const status = task.status || 'todo';
    const category = task.category || 'General';
    const projectId = task.project_id || null;
    const description = task.description || null;
    const dueDate = task.due_date || null;
    const dueTime = task.due_time || null;
    const estimatedMinutes = task.estimated_minutes !== undefined && task.estimated_minutes !== null ? Number(task.estimated_minutes) : null;
    const completedAt = status === 'completed' ? new Date() : null;

    await query(
      `INSERT INTO tasks (
        id, user_id, project_id, title, description, priority, status, category, due_date, due_time, estimated_minutes, completed_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        task.id,
        task.user_id,
        projectId,
        task.title.trim(),
        description,
        priority,
        status,
        category.trim(),
        dueDate,
        dueTime,
        estimatedMinutes,
        completedAt,
      ]
    );

    const created = await this.findById(task.id, task.user_id);
    if (!created) {
      throw new Error('Failed to create task');
    }
    return created;
  }

  static async update(
    id: string,
    userId: string,
    updates: Partial<Task>
  ): Promise<Task | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.project_id !== undefined) {
      fields.push('project_id = ?');
      values.push(updates.project_id || null);
    }
    if (updates.title !== undefined) {
      fields.push('title = ?');
      values.push(updates.title.trim());
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description || null);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
      if (updates.status === 'completed' && existing.status !== 'completed') {
        fields.push('completed_at = NOW()');
      } else if (updates.status !== 'completed' && existing.status === 'completed') {
        fields.push('completed_at = NULL');
      }
    }
    if (updates.category !== undefined) {
      fields.push('category = ?');
      values.push(updates.category.trim());
    }
    if (updates.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(updates.due_date || null);
    }
    if (updates.due_time !== undefined) {
      fields.push('due_time = ?');
      values.push(updates.due_time || null);
    }
    if (updates.estimated_minutes !== undefined) {
      fields.push('estimated_minutes = ?');
      values.push(updates.estimated_minutes !== null ? Number(updates.estimated_minutes) : null);
    }

    if (fields.length === 0) {
      return existing;
    }

    values.push(id, userId);
    await query(
      `UPDATE tasks SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    return this.findById(id, userId);
  }

  static async toggleComplete(id: string, userId: string): Promise<Task | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const isCurrentlyCompleted = existing.status === 'completed';
    const nextStatus: TaskStatus = isCurrentlyCompleted ? 'todo' : 'completed';
    const nextCompletedAt = isCurrentlyCompleted ? null : new Date();

    await query(
      'UPDATE tasks SET status = ?, completed_at = ? WHERE id = ? AND user_id = ?',
      [nextStatus, nextCompletedAt, id, userId]
    );

    return this.findById(id, userId);
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const res: any = await query(
      'DELETE FROM tasks WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return res.affectedRows > 0;
  }

  static async getCategories(userId: string): Promise<string[]> {
    const rows = await query<{ category: string }[]>(
      'SELECT DISTINCT category FROM tasks WHERE user_id = ? AND category IS NOT NULL AND category != "" ORDER BY category ASC',
      [userId]
    );
    return rows.map((r) => r.category);
  }

  static async getDashboardStats(userId: string): Promise<DashboardData> {
    // 1. Get today's total tasks and completed tasks count
    const [todayStats]: any = await query(
      `SELECT 
        COUNT(*) as todayTotal,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) as todayCompleted
       FROM tasks 
       WHERE user_id = ? AND due_date = CURDATE()`,
      [userId]
    );

    const todayTotal = Number(todayStats?.todayTotal || 0);
    const todayCompleted = Number(todayStats?.todayCompleted || 0);
    const completionPercentage = todayTotal > 0 ? Math.round((todayCompleted / todayTotal) * 100) : 0;

    // 2. Get top priority task (highest priority incomplete task, prioritizing due today or overdue, then high priority)
    const topPriorityRows = await query<Task[]>(
      `SELECT * FROM tasks 
       WHERE user_id = ? AND status != 'completed'
       ORDER BY 
        FIELD(priority, 'high', 'medium', 'low'),
        (due_date IS NOT NULL AND due_date <= CURDATE()) DESC,
        due_date ASC,
        created_at ASC
       LIMIT 1`,
      [userId]
    );
    const topPriorityTask = topPriorityRows[0] || null;

    // 3. Get today's tasks list
    const todayTasks = await query<Task[]>(
      `SELECT * FROM tasks 
       WHERE user_id = ? AND due_date = CURDATE()
       ORDER BY 
        FIELD(status, 'todo', 'in_progress', 'completed'),
        FIELD(priority, 'high', 'medium', 'low'),
        due_time ASC,
        created_at ASC`,
      [userId]
    );

    // 4. Get upcoming tasks list (next upcoming 5 incomplete tasks due after today)
    const upcomingTasks = await query<Task[]>(
      `SELECT * FROM tasks 
       WHERE user_id = ? AND due_date > CURDATE() AND status != 'completed'
       ORDER BY due_date ASC, due_time ASC, FIELD(priority, 'high', 'medium', 'low')
       LIMIT 5`,
      [userId]
    );

    return {
      todayTotal,
      todayCompleted,
      completionPercentage,
      topPriorityTask,
      todayTasks,
      upcomingTasks,
    };
  }
}
