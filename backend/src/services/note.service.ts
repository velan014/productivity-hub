import { NoteModel } from '../models/note.model';
import { Note, NoteFilters } from '../types';

export class NoteService {
  static async getNotes(userId: string, filters: NoteFilters = {}): Promise<Note[]> {
    return NoteModel.findUserNotes(userId, filters);
  }

  static async getNoteById(id: string, userId: string): Promise<Note | null> {
    return NoteModel.findById(id, userId);
  }

  static async createNote(data: {
    user_id: string;
    title?: string;
    content?: string | null;
    category?: string;
    is_pinned?: boolean;
  }): Promise<Note> {
    return NoteModel.create(data);
  }

  static async updateNote(
    id: string,
    userId: string,
    data: {
      title?: string;
      content?: string | null;
      category?: string;
      is_pinned?: boolean;
    }
  ): Promise<Note | null> {
    return NoteModel.update(id, userId, data);
  }

  static async togglePin(id: string, userId: string): Promise<Note | null> {
    return NoteModel.togglePin(id, userId);
  }

  static async deleteNote(id: string, userId: string): Promise<boolean> {
    return NoteModel.delete(id, userId);
  }

  static async getCategories(userId: string): Promise<string[]> {
    return NoteModel.getCategories(userId);
  }

  static async getRecentNotes(userId: string, limit: number = 3): Promise<Note[]> {
    return NoteModel.getRecentNotes(userId, limit);
  }
}
