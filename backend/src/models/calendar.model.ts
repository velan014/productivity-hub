import { query } from '../config/db';
import { Task, Goal, FocusSession, HabitLog } from '../types';

export interface CalendarSummary {
  startDate: string;
  endDate: string;
  tasks: Task[];
  goals: Goal[];
  focusSessions: FocusSession[];
  habitLogs: (HabitLog & { habit_name: string; color: string })[];
}

export class CalendarModel {
  static async getEventsForRange(
    userId: string,
    startDate: string,
    endDate: string
  ): Promise<CalendarSummary> {
    const formattedStart = startDate.slice(0, 10);
    const formattedEnd = endDate.slice(0, 10);

    // 1. Tasks
    const tasks = await query<Task[]>(
      `SELECT * FROM tasks 
       WHERE user_id = ? AND due_date IS NOT NULL AND due_date >= ? AND due_date <= ?
       ORDER BY due_date ASC, due_time ASC`,
      [userId, formattedStart, formattedEnd]
    );

    // 2. Goals (target date in range)
    const goals = await query<Goal[]>(
      `SELECT * FROM goals 
       WHERE user_id = ? AND target_date IS NOT NULL AND target_date >= ? AND target_date <= ?
       ORDER BY target_date ASC`,
      [userId, formattedStart, formattedEnd]
    );

    // 3. Focus Sessions
    const focusSessions = await query<FocusSession[]>(
      `SELECT fs.*, t.title as task_title 
       FROM focus_sessions fs
       LEFT JOIN tasks t ON fs.task_id = t.id
       WHERE fs.user_id = ? AND DATE(fs.started_at) >= ? AND DATE(fs.started_at) <= ?
       ORDER BY fs.started_at ASC`,
      [userId, formattedStart, formattedEnd]
    );

    // 4. Habit Logs
    const habitLogs = await query<(HabitLog & { habit_name: string; color: string })[]>(
      `SELECT hl.*, h.name as habit_name, h.color 
       FROM habit_logs hl
       INNER JOIN habits h ON hl.habit_id = h.id
       WHERE hl.user_id = ? AND hl.log_date >= ? AND hl.log_date <= ? AND hl.completed = 1
       ORDER BY hl.log_date ASC`,
      [userId, formattedStart, formattedEnd]
    );

    return {
      startDate: formattedStart,
      endDate: formattedEnd,
      tasks,
      goals,
      focusSessions,
      habitLogs,
    };
  }
}
