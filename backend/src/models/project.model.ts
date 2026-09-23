import { query } from '../config/db';
import { Project, ProjectWithStats, ProjectFilters, Task } from '../types';

export class ProjectModel {
  static async findUserProjects(userId: string, filters: ProjectFilters = {}): Promise<ProjectWithStats[]> {
    let sql = `
      SELECT 
        p.*,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND((SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / COUNT(t.id)) * 100)
        END AS progress
      FROM projects p
      LEFT JOIN tasks t ON p.id = t.project_id AND t.user_id = ?
      WHERE p.user_id = ?
    `;
    const params: any[] = [userId, userId];

    if (filters.status && filters.status !== 'all') {
      sql += ' AND p.status = ?';
      params.push(filters.status);
    }

    if (filters.priority && filters.priority !== 'all') {
      sql += ' AND p.priority = ?';
      params.push(filters.priority);
    }

    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = `%${filters.search.trim()}%`;
      sql += ' AND (p.name LIKE ? OR p.description LIKE ?)';
      params.push(searchTerm, searchTerm);
    }

    sql += ' GROUP BY p.id';

    const sortField = filters.sortBy || 'created_at';
    const sortOrder = filters.sortOrder === 'asc' ? 'ASC' : 'DESC';

    if (sortField === 'due_date') {
      sql += ` ORDER BY p.due_date IS NULL, p.due_date ${sortOrder}, p.created_at DESC`;
    } else if (sortField === 'priority') {
      if (sortOrder === 'DESC') {
        sql += ` ORDER BY FIELD(p.priority, 'high', 'medium', 'low'), p.created_at DESC`;
      } else {
        sql += ` ORDER BY FIELD(p.priority, 'low', 'medium', 'high'), p.created_at DESC`;
      }
    } else if (sortField === 'name') {
      sql += ` ORDER BY p.name ${sortOrder}`;
    } else if (sortField === 'progress') {
      sql += ` ORDER BY progress ${sortOrder}, p.created_at DESC`;
    } else {
      sql += ` ORDER BY p.created_at ${sortOrder}`;
    }

    const rows = await query<any[]>(sql, params);
    return rows.map((r) => ({
      ...r,
      total_tasks: Number(r.total_tasks || 0),
      completed_tasks: Number(r.completed_tasks || 0),
      progress: Number(r.progress || 0),
    }));
  }

  static async findById(id: string, userId: string): Promise<ProjectWithStats | null> {
    const rows = await query<any[]>(
      `SELECT 
        p.*,
        COUNT(t.id) AS total_tasks,
        SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) AS completed_tasks,
        CASE 
          WHEN COUNT(t.id) = 0 THEN 0
          ELSE ROUND((SUM(CASE WHEN t.status = 'completed' THEN 1 ELSE 0 END) / COUNT(t.id)) * 100)
        END AS progress
       FROM projects p
       LEFT JOIN tasks t ON p.id = t.project_id AND t.user_id = ?
       WHERE p.id = ? AND p.user_id = ?
       GROUP BY p.id
       LIMIT 1`,
      [userId, id, userId]
    );

    if (!rows[0]) return null;

    const r = rows[0];
    return {
      ...r,
      total_tasks: Number(r.total_tasks || 0),
      completed_tasks: Number(r.completed_tasks || 0),
      progress: Number(r.progress || 0),
    };
  }

  static async create(project: {
    id: string;
    user_id: string;
    name: string;
    description?: string | null;
    status?: string;
    priority?: string;
    start_date?: string | null;
    due_date?: string | null;
    color?: string;
  }): Promise<ProjectWithStats> {
    const status = project.status || 'planning';
    const priority = project.priority || 'medium';
    const color = project.color || 'indigo';
    const description = project.description || null;
    const startDate = project.start_date || null;
    const dueDate = project.due_date || null;

    await query(
      `INSERT INTO projects (
        id, user_id, name, description, status, priority, start_date, due_date, color
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        project.id,
        project.user_id,
        project.name.trim(),
        description,
        status,
        priority,
        startDate,
        dueDate,
        color,
      ]
    );

    const created = await this.findById(project.id, project.user_id);
    if (!created) {
      throw new Error('Failed to create project');
    }
    return created;
  }

  static async update(
    id: string,
    userId: string,
    updates: Partial<Project>
  ): Promise<ProjectWithStats | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name.trim());
    }
    if (updates.description !== undefined) {
      fields.push('description = ?');
      values.push(updates.description || null);
    }
    if (updates.status !== undefined) {
      fields.push('status = ?');
      values.push(updates.status);
    }
    if (updates.priority !== undefined) {
      fields.push('priority = ?');
      values.push(updates.priority);
    }
    if (updates.start_date !== undefined) {
      fields.push('start_date = ?');
      values.push(updates.start_date || null);
    }
    if (updates.due_date !== undefined) {
      fields.push('due_date = ?');
      values.push(updates.due_date || null);
    }
    if (updates.color !== undefined) {
      fields.push('color = ?');
      values.push(updates.color);
    }

    if (fields.length === 0) {
      return existing;
    }

    values.push(id, userId);
    await query(
      `UPDATE projects SET ${fields.join(', ')} WHERE id = ? AND user_id = ?`,
      values
    );

    return this.findById(id, userId);
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const res: any = await query(
      'DELETE FROM projects WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return res.affectedRows > 0;
  }

  static async getProjectTasks(id: string, userId: string): Promise<Task[]> {
    const rows = await query<Task[]>(
      `SELECT t.*, p.name as project_name, p.color as project_color
       FROM tasks t
       JOIN projects p ON t.project_id = p.id
       WHERE t.project_id = ? AND t.user_id = ?
       ORDER BY 
         FIELD(t.status, 'todo', 'in_progress', 'completed'),
         FIELD(t.priority, 'high', 'medium', 'low'),
         t.due_date ASC,
         t.created_at DESC`,
      [id, userId]
    );
    return rows;
  }
}
