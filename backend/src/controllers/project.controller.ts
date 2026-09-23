import { Response } from 'express';
import { z } from 'zod';
import { ProjectService } from '../services/project.service';
import { AuthenticatedRequest } from '../types';
import { sendSuccess, sendError } from '../utils/response';

export const createProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long'),
  description: z.string().nullable().optional(),
  status: z.enum(['planning', 'active', 'completed', 'archived']).optional().default('planning'),
  priority: z.enum(['low', 'medium', 'high']).optional().default('medium'),
  start_date: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  color: z.string().max(50).optional().default('indigo'),
});

export const updateProjectSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(255, 'Project name too long').optional(),
  description: z.string().nullable().optional(),
  status: z.enum(['planning', 'active', 'completed', 'archived']).optional(),
  priority: z.enum(['low', 'medium', 'high']).optional(),
  start_date: z.string().nullable().optional(),
  due_date: z.string().nullable().optional(),
  color: z.string().max(50).optional(),
});

export class ProjectController {
  static async getProjects(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { status, priority, search, sortBy, sortOrder } = req.query;

      const filters = {
        status: status as any,
        priority: priority as any,
        search: search as string,
        sortBy: sortBy as any,
        sortOrder: sortOrder as any,
      };

      const projects = await ProjectService.getProjects(userId, filters);
      return sendSuccess(res, { projects }, 'Projects retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve projects', 500);
    }
  }

  static async getProjectById(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const result = await ProjectService.getProjectById(id, userId);
      if (!result) {
        return sendError(res, 'Project not found', 404);
      }

      return sendSuccess(res, result, 'Project retrieved successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to retrieve project', 500);
    }
  }

  static async createProject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const data = req.body;

      const project = await ProjectService.createProject(userId, data);
      return sendSuccess(res, { project }, 'Project created successfully', 201);
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to create project', 500);
    }
  }

  static async updateProject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const updates = req.body;

      const project = await ProjectService.updateProject(id, userId, updates);
      if (!project) {
        return sendError(res, 'Project not found', 404);
      }

      return sendSuccess(res, { project }, 'Project updated successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to update project', 500);
    }
  }

  static async deleteProject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const success = await ProjectService.deleteProject(id, userId);
      if (!success) {
        return sendError(res, 'Project not found', 404);
      }

      return sendSuccess(res, null, 'Project deleted successfully');
    } catch (error: any) {
      return sendError(res, error.message || 'Failed to delete project', 500);
    }
  }

  static async getProjectTasks(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;

      const tasks = await ProjectService.getProjectTasks(id, userId);
      return sendSuccess(res, { tasks }, 'Project tasks retrieved successfully');
    } catch (error: any) {
      const status = error.message === 'Project not found' ? 404 : 500;
      return sendError(res, error.message || 'Failed to retrieve project tasks', status);
    }
  }

  static async addTaskToProject(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const taskData = req.body;

      const task = await ProjectService.addTaskToProject(id, userId, taskData);
      return sendSuccess(res, { task }, 'Task added to project successfully', 201);
    } catch (error: any) {
      const status = error.message === 'Project not found' ? 404 : 500;
      return sendError(res, error.message || 'Failed to add task to project', status);
    }
  }
}
