import { v4 as uuidv4 } from 'uuid';
import { ProjectModel } from '../models/project.model';
import { TaskModel } from '../models/task.model';
import { ProjectWithStats, ProjectFilters, Task } from '../types';

export class ProjectService {
  static async getProjects(userId: string, filters: ProjectFilters = {}): Promise<ProjectWithStats[]> {
    return ProjectModel.findUserProjects(userId, filters);
  }

  static async getProjectById(id: string, userId: string): Promise<{ project: ProjectWithStats; tasks: Task[] } | null> {
    const project = await ProjectModel.findById(id, userId);
    if (!project) return null;
    const tasks = await ProjectModel.getProjectTasks(id, userId);
    return { project, tasks };
  }

  static async createProject(
    userId: string,
    data: {
      name: string;
      description?: string | null;
      status?: string;
      priority?: string;
      start_date?: string | null;
      due_date?: string | null;
      color?: string;
    }
  ): Promise<ProjectWithStats> {
    const id = uuidv4();
    return ProjectModel.create({
      id,
      user_id: userId,
      ...data,
    });
  }

  static async updateProject(
    id: string,
    userId: string,
    updates: any
  ): Promise<ProjectWithStats | null> {
    return ProjectModel.update(id, userId, updates);
  }

  static async deleteProject(id: string, userId: string): Promise<boolean> {
    return ProjectModel.delete(id, userId);
  }

  static async getProjectTasks(id: string, userId: string): Promise<Task[]> {
    const project = await ProjectModel.findById(id, userId);
    if (!project) {
      throw new Error('Project not found');
    }
    return ProjectModel.getProjectTasks(id, userId);
  }

  static async addTaskToProject(
    projectId: string,
    userId: string,
    taskData: any
  ): Promise<Task> {
    const project = await ProjectModel.findById(projectId, userId);
    if (!project) {
      throw new Error('Project not found');
    }
    const id = uuidv4();
    return TaskModel.create({
      id,
      user_id: userId,
      project_id: projectId,
      ...taskData,
    });
  }
}
