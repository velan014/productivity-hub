import { apiRequest } from './api';
import { ApiResponse, Note, NoteFilters } from '../types';

export const noteApi = {
  async getNotes(filters: NoteFilters = {}): Promise<ApiResponse<{ notes: Note[] }>> {
    return apiRequest<ApiResponse<{ notes: Note[] }>>('/notes', {
      method: 'GET',
      params: filters,
    });
  },

  async getCategories(): Promise<ApiResponse<{ categories: string[] }>> {
    return apiRequest<ApiResponse<{ categories: string[] }>>('/notes/categories', {
      method: 'GET',
    });
  },

  async getNoteById(id: string): Promise<ApiResponse<{ note: Note }>> {
    return apiRequest<ApiResponse<{ note: Note }>>(`/notes/${id}`, {
      method: 'GET',
    });
  },

  async createNote(data: Partial<Note>): Promise<ApiResponse<{ note: Note }>> {
    return apiRequest<ApiResponse<{ note: Note }>>('/notes', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateNote(id: string, updates: Partial<Note>): Promise<ApiResponse<{ note: Note }>> {
    return apiRequest<ApiResponse<{ note: Note }>>(`/notes/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async togglePin(id: string): Promise<ApiResponse<{ note: Note }>> {
    return apiRequest<ApiResponse<{ note: Note }>>(`/notes/${id}/pin`, {
      method: 'PATCH',
    });
  },

  async deleteNote(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`/notes/${id}`, {
      method: 'DELETE',
    });
  },
};
