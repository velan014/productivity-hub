import { query } from '../config/db';
import { NotificationPreferences } from '../types';

export class NotificationModel {
  /**
   * Get or create notification preferences for a user
   */
  static async getOrCreate(userId: string): Promise<NotificationPreferences> {
    const rows = await query<any[]>(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );

    if (rows.length > 0) {
      const r = rows[0];
      return {
        user_id: r.user_id,
        enabled: Boolean(r.enabled),
        morning_plan_enabled: Boolean(r.morning_plan_enabled),
        habit_enabled: Boolean(r.habit_enabled),
        study_enabled: Boolean(r.study_enabled),
        focus_enabled: Boolean(r.focus_enabled),
        daily_review_enabled: Boolean(r.daily_review_enabled),
        updated_at: r.updated_at,
      };
    }

    // Default initialization
    await query(
      `INSERT INTO notification_preferences 
        (user_id, enabled, morning_plan_enabled, habit_enabled, study_enabled, focus_enabled, daily_review_enabled)
       VALUES (?, FALSE, TRUE, TRUE, TRUE, TRUE, TRUE)
       ON DUPLICATE KEY UPDATE updated_at = CURRENT_TIMESTAMP`,
      [userId]
    );

    const created = await query<any[]>(
      'SELECT * FROM notification_preferences WHERE user_id = ?',
      [userId]
    );
    const r = created[0];
    return {
      user_id: r.user_id,
      enabled: Boolean(r.enabled),
      morning_plan_enabled: Boolean(r.morning_plan_enabled),
      habit_enabled: Boolean(r.habit_enabled),
      study_enabled: Boolean(r.study_enabled),
      focus_enabled: Boolean(r.focus_enabled),
      daily_review_enabled: Boolean(r.daily_review_enabled),
      updated_at: r.updated_at,
    };
  }

  /**
   * Update preferences
   */
  static async update(userId: string, data: Partial<NotificationPreferences>): Promise<NotificationPreferences> {
    const current = await this.getOrCreate(userId);

    const updated: NotificationPreferences = {
      ...current,
      ...data,
      user_id: userId,
    };

    await query(
      `UPDATE notification_preferences 
       SET enabled = ?, morning_plan_enabled = ?, habit_enabled = ?, study_enabled = ?, focus_enabled = ?, daily_review_enabled = ?, updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        updated.enabled ? 1 : 0,
        updated.morning_plan_enabled ? 1 : 0,
        updated.habit_enabled ? 1 : 0,
        updated.study_enabled ? 1 : 0,
        updated.focus_enabled ? 1 : 0,
        updated.daily_review_enabled ? 1 : 0,
        userId,
      ]
    );

    return this.getOrCreate(userId);
  }
}

