import { GamificationModel } from '../models/gamification.model';
import { GamificationProfile, AchievementWithStatus } from '../types';

export const XP_CONFIG = {
  TASK_COMPLETED: 10,
  HABIT_COMPLETED: 5,
  FOCUS_SESSION: 10,
  STUDY_SESSION: 10,
  DAILY_REVIEW: 5,
  GOAL_COMPLETED: 20,
  MORNING_PLAN: 5,
};

export class GamificationService {
  /**
   * Calculate level from total XP using deterministic threshold:
   * Level 1: 0 XP
   * Level 2: 100 XP
   * Level 3: 300 XP
   * Level 4: 600 XP
   * Level 5: 1000 XP
   * Level L Base = 50 * L * (L - 1)
   */
  static calculateLevel(xp: number): {
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    progressPercentage: number;
  } {
    let level = 1;
    while (50 * (level + 1) * level <= xp) {
      level++;
    }

    const currentLevelBase = 50 * level * (level - 1);
    const nextLevelTarget = 50 * (level + 1) * level;
    const levelRange = nextLevelTarget - currentLevelBase;
    const progressInLevel = Math.max(0, xp - currentLevelBase);
    const progressPercentage = levelRange > 0 ? Math.min(100, Math.round((progressInLevel / levelRange) * 100)) : 100;

    return {
      level,
      currentLevelXp: progressInLevel,
      nextLevelXp: levelRange,
      progressPercentage,
    };
  }

  /**
   * Sync user gamification profile from actual verified database actions,
   * evaluate achievements, update stats, and return complete GamificationProfile.
   */
  static async syncAndGetProfile(userId: string): Promise<GamificationProfile> {
    // 1. Get real verified counts from the database
    const stats = await GamificationModel.getRealActivityStats(userId);

    // 2. Evaluate and award any newly unlocked achievements
    if (stats.completedTasks >= 1) await GamificationModel.awardAchievement(userId, 'first_task');
    if (stats.completedTasks >= 25) await GamificationModel.awardAchievement(userId, 'task_master');
    if (stats.completedTasks >= 100) await GamificationModel.awardAchievement(userId, 'centurion_tasks');
    if (stats.focusMinutes >= 125) await GamificationModel.awardAchievement(userId, 'focused_mind');
    if (stats.focusMinutes >= 300) await GamificationModel.awardAchievement(userId, 'deep_work_champ');
    if (stats.studyMinutes >= 1) await GamificationModel.awardAchievement(userId, 'study_starter');
    if (stats.studyMinutes >= 600) await GamificationModel.awardAchievement(userId, 'scholar');
    if (stats.currentStreak >= 7) await GamificationModel.awardAchievement(userId, 'streak_builder');
    if (stats.completedProjectsCount >= 1) await GamificationModel.awardAchievement(userId, 'project_finisher');
    if (stats.dailyReviewsCount >= 7) await GamificationModel.awardAchievement(userId, 'daily_reviewer');
    if (stats.morningPlansCount >= 5) await GamificationModel.awardAchievement(userId, 'early_planner');
    if (stats.completedGoalsCount >= 1) await GamificationModel.awardAchievement(userId, 'goal_crusher');

    // 3. Get all achievements with earned status
    const allAchievements = await GamificationModel.getAchievementsWithStatus(userId);
    const earnedAchievements = allAchievements.filter((a) => a.is_earned);
    const achievementBonusXp = earnedAchievements.reduce((acc, curr) => acc + curr.xp_reward, 0);

    // 4. Calculate total base XP strictly from verified activity + bonus
    const baseActionXp =
      stats.completedTasks * XP_CONFIG.TASK_COMPLETED +
      stats.completedHabitsCount * XP_CONFIG.HABIT_COMPLETED +
      Math.floor(stats.focusMinutes / 25) * XP_CONFIG.FOCUS_SESSION +
      Math.floor(stats.studyMinutes / 30) * XP_CONFIG.STUDY_SESSION +
      stats.dailyReviewsCount * XP_CONFIG.DAILY_REVIEW +
      stats.morningPlansCount * XP_CONFIG.MORNING_PLAN +
      stats.completedGoalsCount * XP_CONFIG.GOAL_COMPLETED;

    const totalXp = baseActionXp + achievementBonusXp;
    const { level, currentLevelXp, nextLevelXp, progressPercentage } = this.calculateLevel(totalXp);

    // 5. Update user_gamification table
    const existing = await GamificationModel.getOrCreate(userId);
    const longestStreak = Math.max(existing.longest_streak || 0, stats.currentStreak);

    await GamificationModel.update(userId, {
      xp: totalXp,
      level,
      total_completed_tasks: stats.completedTasks,
      total_focus_minutes: stats.focusMinutes,
      total_study_minutes: stats.studyMinutes,
      current_streak: stats.currentStreak,
      longest_streak: longestStreak,
    });

    return {
      xp: totalXp,
      level,
      currentLevelXp,
      nextLevelXp,
      progressPercentage,
      currentStreak: stats.currentStreak,
      longestStreak,
      totalCompletedTasks: stats.completedTasks,
      totalFocusMinutes: stats.focusMinutes,
      totalStudyMinutes: stats.studyMinutes,
      totalAchievementsEarned: earnedAchievements.length,
      totalAchievementsCount: allAchievements.length,
      recentAchievements: earnedAchievements.slice(0, 3),
    };
  }

  /**
   * Get all achievements with status
   */
  static async getAchievements(userId: string): Promise<AchievementWithStatus[]> {
    // Ensure profile is synced first
    await this.syncAndGetProfile(userId);
    return GamificationModel.getAchievementsWithStatus(userId);
  }
}
