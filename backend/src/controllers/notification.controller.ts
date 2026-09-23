import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { NotificationService } from '../services/notification.service';

export class NotificationController {
  static async getPreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const preferences = await NotificationService.getPreferences(userId);
      res.status(200).json({
        success: true,
        data: preferences,
      });
    } catch (error) {
      console.error('Error getting notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to load notification preferences',
      });
    }
  }

  static async updatePreferences(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const {
        enabled,
        morning_plan_enabled,
        habit_enabled,
        study_enabled,
        focus_enabled,
        daily_review_enabled,
      } = req.body;

      const updated = await NotificationService.updatePreferences(userId, {
        enabled,
        morning_plan_enabled,
        habit_enabled,
        study_enabled,
        focus_enabled,
        daily_review_enabled,
      });

      res.status(200).json({
        success: true,
        data: updated,
        message: 'Notification preferences updated',
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update notification preferences',
      });
    }
  }
}
