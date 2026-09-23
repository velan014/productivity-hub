import { Response } from 'express';
import { z } from 'zod';
import { TaskService } from '../services/task.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const createTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title too long'),
  description: z.string().nullable().optional(),
  project_id: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  status: z.enum(['todo', 'in_progress', 'completed']).optional().default('todo'),
  category: z.string().max(50).optional().default('General'),
  due_date: z.string().nullable().optional(),
  due_time: z.string().nullable().optional(),
  estimated_minutes: z.union([z.number().int().nonnegative(), z.string()]).nullable().optional(),
});

export const updateTaskSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(255, 'Title too long').optional(),
  description: z.string().nullable().optional(),
  project_id: z.string().nullable().optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  status: z.enum(['todo', 'in_progress', 'completed']).optional(),
  category: z.string().max(50).optional(),
  due_date: z.string().nullable().optional(),
  due_time: z.string().nullable().optional(),
  estimated_minutes: z.union([z.number().int().nonnegative(), z.string()]).nullable().optional(),
});

export class TaskController {
  static async getTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { tab, priority, status, category, project_id, search, sortBy, sortOrder } = req.query;

      const filters = {
        tab: tab as any,
        priority: priority as any,
        status: status as any,
        category: category as string,
        project_id: project_id as string,
        search: search as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      };

      const tasks = await TaskService.getTasks(userId, filters);
      return sendSuccess(res, { tasks }, 'Tasks retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve tasks', 500);
    }
  }

  static async getCategories(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const categories = await TaskService.getCategories(userId);
      return sendSuccess(res, { categories }, 'Categories retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve categories', 500);
    }
  }

  static async getTaskById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const task = await TaskService.getTaskById(id, userId);

      if (!task) {
        return sendError(res, 'Task not found', 404);
      }

      return sendSuccess(res, { task }, 'Task retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve task', 500);
    }
  }

  static async createTask(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const taskData = req.body;
      const task = await TaskService.createTask(userId, taskData);
      return sendSuccess(res, { task }, 'Task created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create task', 500);
    }
  }

  static async updateTask(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updates = req.body;

      const task = await TaskService.updateTask(id, userId, updates);
      if (!task) {
        return sendError(res, 'Task not found', 404);
      }

      return sendSuccess(res, { task }, 'Task updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update task', 500);
    }
  }

  static async toggleComplete(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const task = await TaskService.toggleComplete(id, userId);
      if (!task) {
        return sendError(res, 'Task not found', 404);
      }

      const message = task.status === 'completed' ? 'Task marked as completed' : 'Task reopened';
      return sendSuccess(res, { task }, message);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update task completion', 500);
    }
  }

  static async deleteTask(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const success = await TaskService.deleteTask(id, userId);
      if (!success) {
        return sendError(res, 'Task not found', 404);
      }

      return sendSuccess(res, null, 'Task deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete task', 500);
    }
  }
}
