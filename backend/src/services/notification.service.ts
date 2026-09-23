import { NotificationModel } from '../models/notification.model';
import { NotificationPreferences } from '../types';

export class NotificationService {
  static async getPreferences(userId: string): Promise<NotificationPreferences> {
    return NotificationModel.getOrCreate(userId);
  }

  static async updatePreferences(
    userId: string,
    data: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences> {
    return NotificationModel.update(userId, data);
  }
}
