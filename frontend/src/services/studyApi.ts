import { apiRequest } from './api';
import {
  ApiResponse,
  Subject,
  SubjectWithStats,
  StudySession,
  StudySessionWithSubject,
  StudySummary,
} from '../types';

export const studyApi = {
  // Subjects
  async getSubjects(): Promise<ApiResponse<{ subjects: SubjectWithStats[] }>> {
    return apiRequest<ApiResponse<{ subjects: SubjectWithStats[] }>>('/subjects', {
      method: 'GET',
    });
  },

  async getSubjectById(id: string): Promise<ApiResponse<{ subject: SubjectWithStats }>> {
    return apiRequest<ApiResponse<{ subject: SubjectWithStats }>>(`/subjects/${id}`, {
      method: 'GET',
    });
  },

  async createSubject(data: Partial<Subject>): Promise<ApiResponse<{ subject: SubjectWithStats }>> {
    return apiRequest<ApiResponse<{ subject: SubjectWithStats }>>('/subjects', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSubject(id: string, updates: Partial<Subject>): Promise<ApiResponse<{ subject: SubjectWithStats }>> {
    return apiRequest<ApiResponse<{ subject: SubjectWithStats }>>(`/subjects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteSubject(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`/subjects/${id}`, {
      method: 'DELETE',
    });
  },

  // Study Sessions
  async getSessions(filters: {
    date?: string;
    startDate?: string;
    endDate?: string;
    subject_id?: string;
    type?: 'today' | 'upcoming' | 'recent' | 'all';
  } = {}): Promise<ApiResponse<{ sessions: StudySessionWithSubject[] }>> {
    return apiRequest<ApiResponse<{ sessions: StudySessionWithSubject[] }>>('/study/sessions', {
      method: 'GET',
      params: filters,
    });
  },

  async getSessionById(id: string): Promise<ApiResponse<{ session: StudySessionWithSubject }>> {
    return apiRequest<ApiResponse<{ session: StudySessionWithSubject }>>(`/study/sessions/${id}`, {
      method: 'GET',
    });
  },

  async createSession(data: Partial<StudySession>): Promise<ApiResponse<{ session: StudySessionWithSubject }>> {
    return apiRequest<ApiResponse<{ session: StudySessionWithSubject }>>('/study/sessions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async updateSession(id: string, updates: Partial<StudySession>): Promise<ApiResponse<{ session: StudySessionWithSubject }>> {
    return apiRequest<ApiResponse<{ session: StudySessionWithSubject }>>(`/study/sessions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  },

  async deleteSession(id: string): Promise<ApiResponse<null>> {
    return apiRequest<ApiResponse<null>>(`/study/sessions/${id}`, {
      method: 'DELETE',
    });
  },

  // Summary
  async getStudySummary(): Promise<ApiResponse<StudySummary>> {
    return apiRequest<ApiResponse<StudySummary>>('/study/summary', {
      method: 'GET',
    });
  },
};
