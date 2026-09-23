import { TaskModel } from '../models/task.model';
import { GoalModel } from '../models/goal.model';
import { HabitModel } from '../models/habit.model';
import { FocusModel } from '../models/focus.model';
import { NoteModel } from '../models/note.model';
import { ProjectModel } from '../models/project.model';
import { StudyModel } from '../models/study.model';
import { MorningPlanModel } from '../models/morningPlan.model';
import { DailyReviewModel } from '../models/dailyReview.model';
import { GamificationService } from './gamification.service';
import { DashboardData } from '../types';

export class DashboardService {
  static async getDashboardData(userId: string): Promise<DashboardData> {
    const todayStr = new Date().toISOString().slice(0, 10);

    // 1. Phase 1 Task Stats
    const taskStats = await TaskModel.getDashboardStats(userId);

    // 2. Phase 2, Phase 3 & Phase 4 Enhancements
    const [
      goalStats,
      habitSummary,
      focusStats,
      recentNotes,
      allProjects,
      studySummary,
      todayPlan,
      todayReview,
      gamificationProfile,
    ] = await Promise.all([
      GoalModel.getStats(userId),
      HabitModel.getTodaySummary(userId),
      FocusModel.getStats(userId),
      NoteModel.getRecentNotes(userId, 3),
      ProjectModel.findUserProjects(userId, { status: 'active' }),
      StudyModel.getStudySummary(userId),
      MorningPlanModel.findByDate(userId, todayStr),
      DailyReviewModel.findByDate(userId, todayStr),
      GamificationService.syncAndGetProfile(userId),
    ]);

    return {
      ...taskStats,
      // Phase 2
      activeGoalsCount: goalStats.activeCount,
      nextGoalTarget: goalStats.nextTargetGoal
        ? {
            id: goalStats.nextTargetGoal.id,
            title: goalStats.nextTargetGoal.title,
            target_date: goalStats.nextTargetGoal.target_date,
            progress: goalStats.nextTargetGoal.progress,
          }
        : null,
      habitsTodayCompleted: habitSummary.completed,
      habitsTodayTotal: habitSummary.total,
      focusMinutesToday: focusStats.todayFocusMinutes,
      recentNotes: recentNotes,

      // Phase 3
      studySummaryToday: {
        todayMinutes: studySummary.todayMinutes,
        weekMinutes: studySummary.weekMinutes,
        weeklyTargetHours: studySummary.targetHours,
        progressPercentage: studySummary.progressPercentage,
      },
      activeProjectsPreview: allProjects.slice(0, 3),
      todayStudySessions: studySummary.todaySessions.slice(0, 3),
      todayMorningPlan: todayPlan,
      todayDailyReviewCompleted: !!todayReview,

      // Phase 4
      gamification: {
        xp: gamificationProfile.xp,
        level: gamificationProfile.level,
        currentLevelXp: gamificationProfile.currentLevelXp,
        nextLevelXp: gamificationProfile.nextLevelXp,
        progressPercentage: gamificationProfile.progressPercentage,
        currentStreak: gamificationProfile.currentStreak,
        totalCompletedTasks: gamificationProfile.totalCompletedTasks,
        totalFocusMinutes: gamificationProfile.totalFocusMinutes,
        totalStudyMinutes: gamificationProfile.totalStudyMinutes,
        recentAchievement: gamificationProfile.recentAchievements[0] || null,
      },
    };
  }
}

