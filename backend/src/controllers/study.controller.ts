import { Response } from 'express';
import { z } from 'zod';
import { StudyService } from '../services/study.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(255, 'Name too long'),
  code: z.string().max(50).nullable().optional(),
  color: z.string().max(50).optional().default('blue'),
  target_hours: z.union([z.number().nonnegative(), z.string()]).optional().default(0),
});

export const updateSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').max(255, 'Name too long').optional(),
  code: z.string().max(50).nullable().optional(),
  color: z.string().max(50).optional(),
  target_hours: z.union([z.number().nonnegative(), z.string()]).optional(),
});

export const createSessionSchema = z.object({
  subject_id: z.string().min(1, 'Subject is required'),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long'),
  date: z.string().min(1, 'Date is required'),
  start_time: z.string().min(1, 'Start time is required'),
  end_time: z.string().min(1, 'End time is required'),
  notes: z.string().nullable().optional(),
});

export const updateSessionSchema = z.object({
  subject_id: z.string().min(1, 'Subject is required').optional(),
  title: z.string().min(1, 'Title is required').max(255, 'Title too long').optional(),
  date: z.string().optional(),
  start_time: z.string().optional(),
  end_time: z.string().optional(),
  notes: z.string().nullable().optional(),
});

export class StudyController {
  // Subjects
  static async getSubjects(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const subjects = await StudyService.getSubjects(userId);
      return sendSuccess(res, { subjects }, 'Subjects retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve subjects', 500);
    }
  }

  static async getSubjectById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const subject = await StudyService.getSubjectById(id, userId);
      if (!subject) {
        return sendError(res, 'Subject not found', 404);
      }
      return sendSuccess(res, { subject }, 'Subject retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve subject', 500);
    }
  }

  static async createSubject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = req.body;
      const subject = await StudyService.createSubject(userId, data);
      return sendSuccess(res, { subject }, 'Subject created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create subject', 500);
    }
  }

  static async updateSubject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updates = req.body;
      const subject = await StudyService.updateSubject(id, userId, updates);
      if (!subject) {
        return sendError(res, 'Subject not found', 404);
      }
      return sendSuccess(res, { subject }, 'Subject updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update subject', 500);
    }
  }

  static async deleteSubject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const success = await StudyService.deleteSubject(id, userId);
      if (!success) {
        return sendError(res, 'Subject not found', 404);
      }
      return sendSuccess(res, null, 'Subject deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete subject', 500);
    }
  }

  // Sessions
  static async getSessions(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { date, startDate, endDate, subject_id, type } = req.query;
      const filters = {
        date: date as string,
        startDate: startDate as string,
        endDate: endDate as string,
        subject_id: subject_id as string,
        type: type as any,
      };
      const sessions = await StudyService.getSessions(userId, filters);
      return sendSuccess(res, { sessions }, 'Study sessions retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve study sessions', 500);
    }
  }

  static async getSessionById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const session = await StudyService.getSessionById(id, userId);
      if (!session) {
        return sendError(res, 'Study session not found', 404);
      }
      return sendSuccess(res, { session }, 'Study session retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve study session', 500);
    }
  }

  static async createSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = req.body;
      const session = await StudyService.createSession(userId, data);
      return sendSuccess(res, { session }, 'Study session created successfully', 201);
    } catch (error: any) {
      const status = error.message === 'Subject not found' ? 404 : 400;
      return sendError(res, error.message || 'Failed to create study session', status);
    }
  }

  static async updateSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updates = req.body;
      const session = await StudyService.updateSession(id, userId, updates);
      if (!session) {
        return sendError(res, 'Study session not found', 404);
      }
      return sendSuccess(res, { session }, 'Study session updated successfully');
    } catch (error: any) {
      const status = error.message === 'Subject not found' ? 404 : 400;
      return sendError(res, error.message || 'Failed to update study session', status);
    }
  }

  static async deleteSession(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const success = await StudyService.deleteSession(id, userId);
      if (!success) {
        return sendError(res, 'Study session not found', 404);
      }
      return sendSuccess(res, null, 'Study session deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete study session', 500);
    }
  }

  static async getStudySummary(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const summary = await StudyService.getStudySummary(userId);
      return sendSuccess(res, summary, 'Study summary retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve study summary', 500);
    }
  }
}
