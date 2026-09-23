import { v4 as uuidv4 } from 'uuid';
import { query } from '../config/db';
import { MorningPlan, MorningPlanWithTasks, Task } from '../types';
import { TaskModel } from './task.model';

export class MorningPlanModel {
  static async findByDate(userId: string, date: string): Promise<MorningPlanWithTasks | null> {
    const rows = await query<MorningPlan[]>(
      'SELECT * FROM morning_plans WHERE user_id = ? AND plan_date = ? LIMIT 1',
      [userId, date]
    );

    if (!rows[0]) return null;
    const plan = rows[0];

    // Fetch linked tasks if any
    let priority_1_task: Task | null = null;
    let priority_2_task: Task | null = null;
    let priority_3_task: Task | null = null;

    if (plan.priority_1_task_id) {
      priority_1_task = await TaskModel.findById(plan.priority_1_task_id, userId);
    }
    if (plan.priority_2_task_id) {
      priority_2_task = await TaskModel.findById(plan.priority_2_task_id, userId);
    }
    if (plan.priority_3_task_id) {
      priority_3_task = await TaskModel.findById(plan.priority_3_task_id, userId);
    }

    return {
      ...plan,
      planned_study_minutes: Number(plan.planned_study_minutes || 0),
      planned_focus_minutes: Number(plan.planned_focus_minutes || 0),
      priority_1_task,
      priority_2_task,
      priority_3_task,
    };
  }

  static async savePlan(data: {
    user_id: string;
    plan_date: string;
    priority_1: string;
    priority_2?: string | null;
    priority_3?: string | null;
    priority_1_task_id?: string | null;
    priority_2_task_id?: string | null;
    priority_3_task_id?: string | null;
    planned_study_minutes?: number;
    planned_focus_minutes?: number;
    notes?: string | null;
    intention?: string | null;
  }): Promise<MorningPlanWithTasks> {
    const existing = await this.findByDate(data.user_id, data.plan_date);
    const priority1 = data.priority_1.trim();
    const priority2 = data.priority_2 ? data.priority_2.trim() : null;
    const priority3 = data.priority_3 ? data.priority_3.trim() : null;
    const task1Id = data.priority_1_task_id || null;
    const task2Id = data.priority_2_task_id || null;
    const task3Id = data.priority_3_task_id || null;
    const plannedStudyMinutes = Number(data.planned_study_minutes || 0);
    const plannedFocusMinutes = Number(data.planned_focus_minutes || 0);
    const notes = data.notes || null;
    const intention = data.intention || null;

    if (existing) {
      await query(
        `UPDATE morning_plans 
         SET priority_1 = ?, priority_2 = ?, priority_3 = ?,
             priority_1_task_id = ?, priority_2_task_id = ?, priority_3_task_id = ?,
             planned_study_minutes = ?, planned_focus_minutes = ?,
             notes = ?, intention = ?
         WHERE user_id = ? AND plan_date = ?`,
        [
          priority1,
          priority2,
          priority3,
          task1Id,
          task2Id,
          task3Id,
          plannedStudyMinutes,
          plannedFocusMinutes,
          notes,
          intention,
          data.user_id,
          data.plan_date,
        ]
      );
      const updated = await this.findByDate(data.user_id, data.plan_date);
      return updated!;
    } else {
      const id = uuidv4();
      await query(
        `INSERT INTO morning_plans (
          id, user_id, plan_date, priority_1, priority_2, priority_3,
          priority_1_task_id, priority_2_task_id, priority_3_task_id,
          planned_study_minutes, planned_focus_minutes, notes, intention
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          data.user_id,
          data.plan_date,
          priority1,
          priority2,
          priority3,
          task1Id,
          task2Id,
          task3Id,
          plannedStudyMinutes,
          plannedFocusMinutes,
          notes,
          intention,
        ]
      );
      const created = await this.findByDate(data.user_id, data.plan_date);
      return created!;
    }
  }
}
