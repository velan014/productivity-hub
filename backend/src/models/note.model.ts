import { query } from '../config/db';
import { Note, NoteFilters } from '../types';
import { v4 as uuidv4 } from 'uuid';

export class NoteModel {
  static async findUserNotes(userId: string, filters: NoteFilters = {}): Promise<Note[]> {
    let sql = 'SELECT * FROM notes WHERE user_id = ?';
    const params: any[] = [userId];

    if (filters.pinnedOnly) {
      sql += ' AND is_pinned = 1';
    }

    if (filters.category && filters.category !== 'all' && filters.category.trim() !== '') {
      sql += ' AND category = ?';
      params.push(filters.category.trim());
    }

    if (filters.search && filters.search.trim() !== '') {
      const searchTerm = `%${filters.search.trim()}%`;
      sql += ' AND (title LIKE ? OR content LIKE ? OR category LIKE ?)';
      params.push(searchTerm, searchTerm, searchTerm);
    }

    sql += ' ORDER BY is_pinned DESC, updated_at DESC';

    return query<Note[]>(sql, params);
  }

  static async findById(id: string, userId: string): Promise<Note | null> {
    const rows = await query<Note[]>(
      'SELECT * FROM notes WHERE id = ? AND user_id = ? LIMIT 1',
      [id, userId]
    );
    return rows[0] || null;
  }

  static async create(data: {
    user_id: string;
    title?: string;
    content?: string | null;
    category?: string;
    is_pinned?: boolean;
  }): Promise<Note> {
    const id = uuidv4();
    const title = data.title && data.title.trim() !== '' ? data.title.trim() : 'Untitled Note';
    const content = data.content || '';
    const category = data.category || 'General';
    const isPinned = data.is_pinned ? 1 : 0;

    await query(
      `INSERT INTO notes (id, user_id, title, content, category, is_pinned)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, data.user_id, title, content, category, isPinned]
    );

    const created = await this.findById(id, data.user_id);
    if (!created) throw new Error('Failed to retrieve created note');
    return created;
  }

  static async update(
    id: string,
    userId: string,
    data: {
      title?: string;
      content?: string | null;
      category?: string;
      is_pinned?: boolean;
    }
  ): Promise<Note | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const updates: string[] = [];
    const params: any[] = [];

    if (data.title !== undefined) {
      updates.push('title = ?');
      params.push(data.title.trim() !== '' ? data.title.trim() : 'Untitled Note');
    }
    if (data.content !== undefined) {
      updates.push('content = ?');
      params.push(data.content);
    }
    if (data.category !== undefined) {
      updates.push('category = ?');
      params.push(data.category);
    }
    if (data.is_pinned !== undefined) {
      updates.push('is_pinned = ?');
      params.push(data.is_pinned ? 1 : 0);
    }

    if (updates.length > 0) {
      params.push(id, userId);
      await query(
        `UPDATE notes SET ${updates.join(', ')} WHERE id = ? AND user_id = ?`,
        params
      );
    }

    return this.findById(id, userId);
  }

  static async togglePin(id: string, userId: string): Promise<Note | null> {
    const existing = await this.findById(id, userId);
    if (!existing) return null;

    const newPinned = !existing.is_pinned;
    await query(
      'UPDATE notes SET is_pinned = ? WHERE id = ? AND user_id = ?',
      [newPinned ? 1 : 0, id, userId]
    );

    return this.findById(id, userId);
  }

  static async delete(id: string, userId: string): Promise<boolean> {
    const result: any = await query(
      'DELETE FROM notes WHERE id = ? AND user_id = ?',
      [id, userId]
    );
    return result.affectedRows > 0;
  }

  static async getCategories(userId: string): Promise<string[]> {
    const rows = await query<{ category: string }[]>(
      'SELECT DISTINCT category FROM notes WHERE user_id = ? AND category IS NOT NULL ORDER BY category ASC',
      [userId]
    );
    return rows.map((r) => r.category);
  }

  static async getRecentNotes(userId: string, limit: number = 3): Promise<Note[]> {
    return query<Note[]>(
      'SELECT * FROM notes WHERE user_id = ? ORDER BY is_pinned DESC, updated_at DESC LIMIT ?',
      [userId, limit]
    );
  }
}
