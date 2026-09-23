import { v4 as uuidv4 } from 'uuid';
import { TaskModel } from '../models/task.model';
import { Task, TaskFilters } from '../types';

export class TaskService {
  static async getTasks(userId: string, filters: TaskFilters): Promise<Task[]> {
    return TaskModel.findUserTasks(userId, filters);
  }

  static async getTaskById(taskId: string, userId: string): Promise<Task | null> {
    return TaskModel.findById(taskId, userId);
  }

  static async createTask(
    userId: string,
    data: {
      title: string;
      description?: string | null;
      priority?: 'low' | 'medium' | 'high';
      status?: 'todo' | 'in_progress' | 'completed';
      category?: string;
      due_date?: string | null;
      due_time?: string | null;
      estimated_minutes?: number | null;
    }
  ): Promise<Task> {
    const id = uuidv4();
    return TaskModel.create({
      id,
      user_id: userId,
      ...data,
    });
  }

  static async updateTask(
    taskId: string,
    userId: string,
    updates: Partial<Task>
  ): Promise<Task | null> {
    return TaskModel.update(taskId, userId, updates);
  }

  static async toggleComplete(taskId: string, userId: string): Promise<Task | null> {
    return TaskModel.toggleComplete(taskId, userId);
  }

  static async deleteTask(taskId: string, userId: string): Promise<boolean> {
    return TaskModel.delete(taskId, userId);
  }

  static async getCategories(userId: string): Promise<string[]> {
    return TaskModel.getCategories(userId);
  }
}
