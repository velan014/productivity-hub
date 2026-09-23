import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { BackupService } from '../services/backup.service';

export class BackupController {
  static async exportData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const exportData = await BackupService.exportUserData(userId);

      const timestamp = new Date().toISOString().slice(0, 10);
      res.setHeader('Content-Type', 'application/json');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="productivity-hub-backup-${timestamp}.json"`
      );
      res.status(200).json(exportData);
    } catch (error) {
      console.error('Error exporting backup:', error);
      res.status(500).json({
        success: false,
        message: 'Unable to export your data. Please try again.',
      });
    }
  }

  static async importData(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const payload = req.body;

      const result = await BackupService.importUserData(userId, payload);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error importing backup:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to import backup data. Invalid format.',
      });
    }
  }
}
