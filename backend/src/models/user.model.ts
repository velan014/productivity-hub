import { query } from '../config/db';
import { User, UserSafe } from '../types';

export class UserModel {
  static async findByEmail(email: string): Promise<User | null> {
    const rows = await query<User[]>(
      'SELECT id, name, email, password_hash, avatar, created_at, updated_at FROM users WHERE email = ? LIMIT 1',
      [email.toLowerCase().trim()]
    );
    return rows[0] || null;
  }

  static async findById(id: string): Promise<UserSafe | null> {
    const rows = await query<UserSafe[]>(
      'SELECT id, name, email, avatar, created_at, updated_at FROM users WHERE id = ? LIMIT 1',
      [id]
    );
    return rows[0] || null;
  }

  static async create(user: {
    id: string;
    name: string;
    email: string;
    password_hash: string;
    avatar?: string | null;
  }): Promise<UserSafe> {
    const avatar = user.avatar || null;
    await query(
      'INSERT INTO users (id, name, email, password_hash, avatar) VALUES (?, ?, ?, ?, ?)',
      [user.id, user.name.trim(), user.email.toLowerCase().trim(), user.password_hash, avatar]
    );

    const created = await this.findById(user.id);
    if (!created) {
      throw new Error('User creation failed');
    }
    return created;
  }

  static async updateProfile(
    id: string,
    updates: { name?: string; avatar?: string | null }
  ): Promise<UserSafe | null> {
    const fields: string[] = [];
    const values: any[] = [];

    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name.trim());
    }

    if (updates.avatar !== undefined) {
      fields.push('avatar = ?');
      values.push(updates.avatar);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    values.push(id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, values);
    return this.findById(id);
  }
}
