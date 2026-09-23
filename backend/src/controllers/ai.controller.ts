import { Response } from 'express';
import { AuthenticatedRequest } from '../types';
import { AiService } from '../services/ai.service';

export class AiController {
  static async getStatus(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const status = AiService.getStatus();
      res.status(200).json({
        success: true,
        data: status,
      });
    } catch (error) {
      console.error('Error fetching AI status:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to retrieve AI status',
      });
    }
  }

  static async chat(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { message, history } = req.body;

      if (!message || typeof message !== 'string' || !message.trim()) {
        res.status(400).json({
          success: false,
          message: 'Message is required',
        });
        return;
      }

      const result = await AiService.chat(userId, message.trim(), history || []);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error in AI chat:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'AI Assistant is currently unavailable',
      });
    }
  }

  static async taskBreakdown(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { topic, project_id } = req.body;

      if (!topic || typeof topic !== 'string' || !topic.trim()) {
        res.status(400).json({
          success: false,
          message: 'Topic/goal description is required',
        });
        return;
      }

      const result = await AiService.generateTaskBreakdown(userId, topic.trim(), project_id);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error in AI task breakdown:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate task breakdown',
      });
    }
  }

  static async dailyPlan(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { date } = req.body;

      const result = await AiService.generateDailyPlan(userId, date);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error in AI daily plan:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate daily plan',
      });
    }
  }

  static async reviewAssist(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const userId = req.user!.id;
      const { date } = req.body;

      const result = await AiService.generateReviewAssist(userId, date);
      res.status(200).json({
        success: true,
        data: result,
      });
    } catch (error: any) {
      console.error('Error in AI review assist:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate review assistance',
      });
    }
  }
}
