import { v4 as uuidv4 } from 'uuid';
import { StudyModel } from '../models/study.model';
import { SubjectWithStats, StudySessionWithSubject, StudySummary } from '../types';

export class StudyService {
  // Subjects
  static async getSubjects(userId: string): Promise<SubjectWithStats[]> {
    return StudyModel.findUserSubjects(userId);
  }

  static async getSubjectById(id: string, userId: string): Promise<SubjectWithStats | null> {
    return StudyModel.findSubjectById(id, userId);
  }

  static async createSubject(userId: string, data: {
    name: string;
    code?: string | null;
    color?: string;
    target_hours?: number;
  }): Promise<SubjectWithStats> {
    const id = uuidv4();
    return StudyModel.createSubject({
      id,
      user_id: userId,
      ...data,
    });
  }

  static async updateSubject(id: string, userId: string, updates: any): Promise<SubjectWithStats | null> {
    return StudyModel.updateSubject(id, userId, updates);
  }

  static async deleteSubject(id: string, userId: string): Promise<boolean> {
    return StudyModel.deleteSubject(id, userId);
  }

  // Study Sessions
  static async getSessions(userId: string, filters: any): Promise<StudySessionWithSubject[]> {
    return StudyModel.findSessions(userId, filters);
  }

  static async getSessionById(id: string, userId: string): Promise<StudySessionWithSubject | null> {
    return StudyModel.findSessionById(id, userId);
  }

  static async createSession(userId: string, data: {
    subject_id: string;
    title: string;
    date: string;
    start_time: string;
    end_time: string;
    notes?: string | null;
  }): Promise<StudySessionWithSubject> {
    const id = uuidv4();
    return StudyModel.createSession({
      id,
      user_id: userId,
      ...data,
    });
  }

  static async updateSession(id: string, userId: string, updates: any): Promise<StudySessionWithSubject | null> {
    return StudyModel.updateSession(id, userId, updates);
  }

  static async deleteSession(id: string, userId: string): Promise<boolean> {
    return StudyModel.deleteSession(id, userId);
  }

  static async getStudySummary(userId: string): Promise<StudySummary> {
    return StudyModel.getStudySummary(userId);
  }
}
