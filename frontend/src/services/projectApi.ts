import { apiRequest } from './api';
import { ApiResponse, Project, ProjectWithStats, ProjectFilters, Task } from '../types';

export const projectApi = {
  async getProjects(filters: ProjectFilters = {}): Promise<ApiResponse<{ projects: ProjectWithStats[] }>> {
    return apiRequest<ApiResponse<{ projects: ProjectWithStats[] }>>('/projects', {
      method: 'GET',
      params: filters,
    });
  },

  async getProjectById(id: string): Promise<ApiResponse<{ project: ProjectWithStats; tasks: Task[] }>> {
    return apiRequest<ApiResponse<{ project: ProjectWithStats; tasks: Task[] }>>(`/projects/${id}`, {
      method: 'GET',
    });
  },

  async createProject(data: Partial<Project>): Promise<ApiResponse<{ project: ProjectWithStats }>> {
    return apiRequest<ApiResponse<{ project: ProjectWithStats }>>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateProject(id: string, updates: Partial<Project>): Promise<ApiResponse<{ project: ProjectWithStats }>> {
    return apiRequest<ApiResponse<{ project: ProjectWithStats }>>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteProject(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`/projects/${id}`, {
      method: 'DELETE',
    });
  },

  async getProjectTasks(id: string): Promise<ApiResponse<{ tasks: Task[] }>> {
    return apiRequest<ApiResponse<{ tasks: Task[] }>>(`/projects/${id}/tasks`, {
      method: 'GET',
    });
  },

  async addTaskToProject(projectId: string, taskData: Partial<Task>): Promise<ApiResponse<{ task: Task }>> {
    return apiRequest<ApiResponse<{ task: Task }>>(`/projects/${projectId}/tasks`, {
      method: 'POST',
      body: JSON.stringify(taskData),
    });
  },
};
