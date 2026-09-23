import { Response } from 'express';
import { z } from 'zod';
import { NoteService } from '../services/note.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const createNoteSchema = z.object({
  title: z.string().max(255, 'Title too long').optional().default('Untitled Note'),
  content: z.string().nullable().optional(),
  category: z.string().max(50).optional().default('General'),
  is_pinned: z.boolean().optional().default(false),
});

export const updateNoteSchema = z.object({
  title: z.string().max(255, 'Title too long').optional(),
  content: z.string().nullable().optional(),
  category: z.string().max(50).optional(),
  is_pinned: z.boolean().optional(),
});

export class NoteController {
  static async getNotes(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { category, search, pinnedOnly } = req.query;

      const filters = {
        category: category as string,
        search: search as string,
        pinnedOnly: pinnedOnly === 'true' || pinnedOnly === '1',
      };

      const notes = await NoteService.getNotes(userId, filters);
      return sendSuccess(res, { notes }, 'Notes retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve notes', 500);
    }
  }

  static async getCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const categories = await NoteService.getCategories(userId);
      return sendSuccess(res, { categories }, 'Note categories retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve note categories', 500);
    }
  }

  static async getNoteById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const note = await NoteService.getNoteById(id, userId);

      if (!note) {
        return sendError(res, 'Note not found', 404);
      }

      return sendSuccess(res, { note }, 'Note retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve note', 500);
    }
  }

  static async createNote(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const note = await NoteService.createNote({
        ...req.body,
        user_id: userId,
      });

      return sendSuccess(res, { note }, 'Note created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create note', 500);
    }
  }

  static async updateNote(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const note = await NoteService.updateNote(id, userId, req.body);

      if (!note) {
        return sendError(res, 'Note not found or unauthorized', 404);
      }

      return sendSuccess(res, { note }, 'Note updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update note', 500);
    }
  }

  static async togglePin(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const note = await NoteService.togglePin(id, userId);

      if (!note) {
        return sendError(res, 'Note not found or unauthorized', 404);
      }

      return sendSuccess(res, { note }, 'Note pin state toggled');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to toggle pin', 500);
    }
  }

  static async deleteNote(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const deleted = await NoteService.deleteNote(id, userId);

      if (!deleted) {
        return sendError(res, 'Note not found or unauthorized', 404);
      }

      return sendSuccess(res, null, 'Note deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete note', 500);
    }
  }
}
