import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { GamificationService } from '../services/gamification.service';

export class GamificationController {
  static async getProfile(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const profile = await GamificationService.syncAndGetProfile(userId);
      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error('Error fetching gamification profile:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve gamification stats',
      });
    }
  }

  static async getAchievements(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const achievements = await GamificationService.getAchievements(userId);
      res.status(200).json({
        success: true,
        data: achievements,
      });
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve achievements',
      });
    }
  }
}
