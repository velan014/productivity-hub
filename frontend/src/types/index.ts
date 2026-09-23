export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type ThemeMode = 'light' | 'dark' | 'system';

export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  project_id?: string | null;
  project_name?: string | null;
  project_color?: string | null;
  title: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  category: string;
  due_date: string | null;
  due_time: string | null;
  estimated_minutes: number | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface TaskFilters {
  tab?: 'all' | 'today' | 'upcoming' | 'overdue' | 'completed';
  priority?: TaskPriority | 'all';
  status?: TaskStatus | 'all';
  category?: string;
  project_id?: string;
  search?: string;
  sortBy?: 'due_date' | 'priority' | 'created_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Goals (Phase 2)
export type GoalPriority = 'low' | 'medium' | 'high';
export type GoalStatus = 'active' | 'completed' | 'paused';

export interface Goal {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  category: string;
  priority: GoalPriority;
  status: GoalStatus;
  progress: number;
  start_date: string | null;
  target_date: string | null;
  created_at: string;
  updated_at: string;
  completed_at: string | null;
}

export interface GoalFilters {
  status?: GoalStatus | 'all';
  priority?: GoalPriority | 'all';
  category?: string;
  search?: string;
  sortBy?: 'target_date' | 'progress' | 'priority' | 'created_at' | 'title';
  sortOrder?: 'asc' | 'desc';
}

// Habits (Phase 2)
export type HabitFrequency = 'daily' | 'weekly';

export interface Habit {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  category: string;
  frequency: HabitFrequency;
  target_count: number;
  color: string;
  icon: string;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface HabitLog {
  id: string;
  habit_id: string;
  user_id: string;
  log_date: string;
  completed: boolean;
  completed_at: string;
}

export interface HabitWithStats extends Habit {
  currentStreak: number;
  longestStreak: number;
  isCompletedToday: boolean;
  recentLogs: { [dateStr: string]: boolean };
}

// Focus / Pomodoro (Phase 2)
export type FocusMode = 'focus' | 'short_break' | 'long_break';

export interface FocusSession {
  id: string;
  user_id: string;
  task_id: string | null;
  task_title?: string | null;
  mode: FocusMode;
  planned_minutes: number;
  actual_minutes: number;
  started_at: string;
  ended_at: string;
  completed: boolean;
  created_at: string;
}

export interface FocusStats {
  todayFocusMinutes: number;
  todaySessionsCount: number;
  weekFocusMinutes: number;
  completedSessionsCount: number;
}

// Notes (Phase 2)
export interface Note {
  id: string;
  user_id: string;
  title: string;
  content: string | null;
  category: string;
  is_pinned: boolean;
  created_at: string;
  updated_at: string;
}

export interface NoteFilters {
  category?: string;
  search?: string;
  pinnedOnly?: boolean;
}

// Calendar (Phase 2)
export interface CalendarAggregation {
  startDate: string;
  endDate: string;
  tasks: Task[];
  goals: Goal[];
  focusSessions: FocusSession[];
  habitLogs: (HabitLog & { habit_name: string; color: string })[];
}

// ==========================================================
// Phase 3 Types
// ==========================================================

// Projects (Phase 3)
export type ProjectStatus = 'planning' | 'active' | 'completed' | 'archived';
export type ProjectPriority = 'low' | 'medium' | 'high';

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  priority: ProjectPriority;
  start_date: string | null;
  due_date: string | null;
  color: string;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithStats extends Project {
  total_tasks: number;
  completed_tasks: number;
  progress: number; // 0 - 100
}

export interface ProjectFilters {
  status?: ProjectStatus | 'all';
  priority?: ProjectPriority | 'all';
  search?: string;
  sortBy?: 'due_date' | 'priority' | 'name' | 'created_at' | 'progress';
  sortOrder?: 'asc' | 'desc';
}

// Study Management (Phase 3)
export interface Subject {
  id: string;
  user_id: string;
  name: string;
  code: string | null;
  color: string;
  target_hours: number;
  created_at: string;
  updated_at: string;
}

export interface SubjectWithStats extends Subject {
  completed_hours: number;
  completed_minutes: number;
  progress: number; // 0 - 100
  total_sessions: number;
}

export interface StudySession {
  id: string;
  user_id: string;
  subject_id: string;
  title: string;
  date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  duration_minutes: number;
  notes: string | null;
  created_at: string;
}

export interface StudySessionWithSubject extends StudySession {
  subject_name: string;
  subject_code: string | null;
  subject_color: string;
}

export interface StudySummary {
  todayMinutes: number;
  weekMinutes: number;
  totalHours: number;
  targetHours: number;
  progressPercentage: number;
  todaySessions: StudySessionWithSubject[];
  upcomingSessions: StudySessionWithSubject[];
}

// Daily Review (Phase 3)
export type MoodType = 'great' | 'good' | 'okay' | 'difficult' | 'bad';

export interface DailyReview {
  id: string;
  user_id: string;
  review_date: string; // YYYY-MM-DD
  what_went_well: string | null;
  challenges: string | null;
  learned: string | null;
  improvements: string | null;
  mood: MoodType;
  rating: number; // 1-5
  created_at: string;
  updated_at: string;
}

export interface DaySummary {
  date: string;
  tasksTotal: number;
  tasksCompleted: number;
  tasksRemaining: number;
  focusMinutes: number;
  studyMinutes: number;
  habitsTotal: number;
  habitsCompleted: number;
  goalsProgressAvg: number;
}

// Morning Plan (Phase 3)
export interface MorningPlan {
  id: string;
  user_id: string;
  plan_date: string; // YYYY-MM-DD
  priority_1: string;
  priority_2: string | null;
  priority_3: string | null;
  priority_1_task_id: string | null;
  priority_2_task_id: string | null;
  priority_3_task_id: string | null;
  planned_study_minutes: number;
  planned_focus_minutes: number;
  notes: string | null;
  intention: string | null;
  created_at: string;
  updated_at: string;
}

export interface MorningPlanWithTasks extends MorningPlan {
  priority_1_task?: Task | null;
  priority_2_task?: Task | null;
  priority_3_task?: Task | null;
}

// Analytics (Phase 3)
export type AnalyticsRange = 'today' | 'week' | 'month' | 'custom';

export interface AnalyticsData {
  range: AnalyticsRange;
  startDate: string;
  endDate: string;
  taskMetrics: {
    total: number;
    completed: number;
    pending: number;
    overdue: number;
    completionRate: number;
  };
  habitMetrics: {
    activeCount: number;
    currentStreakAvg: number;
    longestStreakMax: number;
    weeklyCompletionRate: number;
  };
  focusMetrics: {
    totalMinutes: number;
    sessionsCount: number;
    averageSessionMinutes: number;
  };
  studyMetrics: {
    totalHours: number;
    weeklyHours: number;
    subjectWise: {
      subjectId: string;
      subjectName: string;
      color: string;
      hours: number;
      percentage: number;
    }[];
  };
  projectMetrics: {
    total: number;
    active: number;
    completed: number;
    averageProgress: number;
  };
  charts: {
    weeklyProductivity: {
      day: string;
      date: string;
      completedTasks: number;
      focusMinutes: number;
      studyMinutes: number;
    }[];
    taskCompletion: {
      name: string;
      value: number;
      color: string;
    }[];
    studyDistribution: {
      name: string;
      hours: number;
      color: string;
    }[];
    focusTrend: {
      day: string;
      date: string;
      minutes: number;
    }[];
  };
}

// Enhanced Dashboard
export interface DashboardData {
  todayTotal: number;
  todayCompleted: number;
  completionPercentage: number;
  topPriorityTask: Task | null;
  todayTasks: Task[];
  upcomingTasks: Task[];

  // Phase 2 summary additions
  activeGoalsCount?: number;
  nextGoalTarget?: {
    id: string;
    title: string;
    target_date: string | null;
    progress: number;
  } | null;
  habitsTodayCompleted?: number;
  habitsTodayTotal?: number;
  focusMinutesToday?: number;
  recentNotes?: Note[];

  // Phase 3 summary additions
  studySummaryToday?: {
    todayMinutes: number;
    weekMinutes: number;
    weeklyTargetHours: number;
    progressPercentage: number;
  };
  activeProjectsPreview?: ProjectWithStats[];
  todayStudySessions?: StudySessionWithSubject[];
  todayMorningPlan?: MorningPlanWithTasks | null;
  todayDailyReviewCompleted?: boolean;

  // Phase 4 summary additions
  gamification?: {
    xp: number;
    level: number;
    currentLevelXp: number;
    nextLevelXp: number;
    progressPercentage: number;
    currentStreak: number;
    totalCompletedTasks: number;
    totalFocusMinutes: number;
    totalStudyMinutes: number;
    recentAchievement?: Achievement | null;
  };
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  errors?: any;
}

export interface AuthResponseData {
  user: User;
  token: string;
}

export interface ToastMessage {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title?: string;
  message: string;
  duration?: number;
}

// ==========================================================
// Phase 4 Types
// ==========================================================

export interface Achievement {
  id: string;
  code: string;
  name: string;
  description: string;
  icon: string;
  category: 'general' | 'tasks' | 'focus' | 'study' | 'habits' | 'projects' | 'review' | 'planning' | 'goals';
  xp_reward: number;
  created_at: string;
}

export interface AchievementWithStatus extends Achievement {
  is_earned: boolean;
  earned_at: string | null;
}

export interface GamificationProfile {
  xp: number;
  level: number;
  currentLevelXp: number;
  nextLevelXp: number;
  progressPercentage: number;
  currentStreak: number;
  longestStreak: number;
  totalCompletedTasks: number;
  totalFocusMinutes: number;
  totalStudyMinutes: number;
  totalAchievementsEarned: number;
  totalAchievementsCount: number;
  recentAchievements: AchievementWithStatus[];
}

export interface NotificationPreferences {
  user_id: string;
  enabled: boolean;
  morning_plan_enabled: boolean;
  habit_enabled: boolean;
  study_enabled: boolean;
  focus_enabled: boolean;
  daily_review_enabled: boolean;
  updated_at: string;
}

// AI Assistant Types
export interface AiChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface AiTaskSuggestion {
  title: string;
  description?: string;
  priority: TaskPriority;
  estimated_minutes?: number;
  category?: string;
  selected?: boolean;
}

export interface AiDailyPlanSuggestion {
  summary: string;
  topPriorities: string[];
  suggestedStudySubject?: string;
  suggestedFocusBlocks?: string[];
  tips: string[];
}

export interface AiReviewAssistResponse {
  summary: string;
  accomplishmentsPrompt: string;
  challengesPrompt: string;
  reflectionNotes: string;
}

export interface AiStatus {
  configured: boolean;
  model: string;
  provider: string;
}

export interface ExportBackupData {
  version: string;
  exported_at: string;
  user: User;
  tasks: Task[];
  projects: ProjectWithStats[];
  subjects: Subject[];
  study_sessions: StudySession[];
  goals: Goal[];
  habits: Habit[];
  habit_logs: HabitLog[];
  focus_sessions: FocusSession[];
  notes: Note[];
  daily_reviews: DailyReview[];
  morning_plans: MorningPlan[];
  gamification: any;
  achievements: AchievementWithStatus[];
}

