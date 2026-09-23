import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  CheckCircle2,
  Calendar,
  ArrowRight,
  Plus,
  Repeat,
  ChevronRight,
  Timer,
  FileText,
  FolderGit2,
  BookOpen,
  Sun,
  Moon,
  Trophy,
  Bot,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { dashboardApi } from '../services/dashboardApi';
import { taskApi } from '../services/taskApi';
import { DashboardData, Task } from '../types';
import { TaskCard } from '../components/tasks/TaskCard';
import { TaskModal } from '../components/tasks/TaskModal';
import { DeleteConfirmModal } from '../components/tasks/DeleteConfirmModal';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { Button } from '../components/common/Button';
import { PriorityBadge } from '../components/common/Badge';
import { getGreeting, formatDate, formatTime } from '../utils/date';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await dashboardApi.getDashboard();
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load dashboard:', err);
      error(err.message || 'Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  }, [error]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Task actions
  const handleToggleComplete = async (task: Task) => {
    try {
      await taskApi.toggleComplete(task.id);
      success(task.status === 'completed' ? 'Task marked active' : 'Task completed! +10 XP');
      fetchDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to update task');
    }
  };

  const handleDeleteTask = async () => {
    if (!deletingTask) return;
    try {
      await taskApi.deleteTask(deletingTask.id);
      success('Task deleted');
      setDeletingTask(null);
      setIsDeleteModalOpen(false);
      fetchDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to delete task');
    }
  };

  const handleSaveTask = async (taskData: Partial<Task>) => {
    try {
      if (editingTask) {
        await taskApi.updateTask(editingTask.id, taskData);
        success('Task updated');
        setEditingTask(null);
        setIsEditModalOpen(false);
      } else {
        await taskApi.createTask(taskData);
        success('Task created');
        setIsCreateModalOpen(false);
      }
      fetchDashboardData();
    } catch (err: any) {
      error(err.message || 'Failed to save task');
      throw err;
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  const greetingInfo = getGreeting(user?.name ? user.name.split(' ')[0] : 'there');
  const todayTotal = data?.todayTotal || 0;
  const todayCompleted = data?.todayCompleted || 0;
  const completionPercentage = data?.completionPercentage || 0;
  const topPriorityTask = data?.topPriorityTask;
  const todayTasks = data?.todayTasks || [];
  const upcomingTasks = data?.upcomingTasks || [];

  // Phase 2 Metrics
  const habitsTodayCompleted = data?.habitsTodayCompleted ?? 0;
  const habitsTodayTotal = data?.habitsTodayTotal ?? 0;
  const habitsPct = habitsTodayTotal > 0 ? Math.round((habitsTodayCompleted / habitsTodayTotal) * 100) : 0;
  const focusMinutesToday = data?.focusMinutesToday ?? 0;
  const recentNotes = data?.recentNotes || [];

  // Phase 3 Metrics
  const studySummary = data?.studySummaryToday;
  const studyTodayMins = studySummary?.todayMinutes ?? 0;
  const formatStudyTime = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h} hrs`;
    return `${m} mins`;
  };

  const activeProjects = data?.activeProjectsPreview || [];
  const todayStudySessions = data?.todayStudySessions || [];
  const todayMorningPlan = data?.todayMorningPlan;
  const dailyReviewCompleted = data?.todayDailyReviewCompleted;

  // Phase 4 Gamification
  const gamification = data?.gamification;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header Greeting */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            {greetingInfo.greeting}
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            {greetingInfo.subtitle}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <Button
            onClick={() => navigate('/app/ai-assistant')}
            size="md"
            variant="outline"
            leftIcon={<Bot className="w-4 h-4 text-indigo-500" />}
            className="w-full sm:w-auto"
          >
            AI Assistant
          </Button>
          <Button
            onClick={() => setIsCreateModalOpen(true)}
            size="md"
            leftIcon={<Plus className="w-4 h-4" />}
            className="w-full sm:w-auto shadow-sm"
          >
            Add Task
          </Button>
        </div>
      </div>

      {/* 2. Gamification Mini-Banner */}
      {gamification && (
        <div
          onClick={() => navigate('/app/achievements')}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-900/90 via-slate-900 to-slate-950 border border-indigo-500/30 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:border-indigo-400 transition-all shadow-md group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 font-black flex items-center justify-center text-sm shadow-md shadow-amber-400/20 shrink-0">
              L{gamification.level}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Level {gamification.level} • {gamification.xp} Total XP
                </span>
                <Trophy className="w-4 h-4 text-amber-400" />
              </div>
              <p className="text-xs text-indigo-200/80">
                {gamification.currentLevelXp} / {gamification.nextLevelXp} XP to Level {gamification.level + 1} ({gamification.progressPercentage}%)
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/20 border border-orange-500/30 text-orange-300 text-xs font-bold">
              <Flame className="w-4 h-4 text-orange-400 fill-orange-400" />
              <span>{gamification.currentStreak} Day Streak</span>
            </div>
            <span className="text-xs font-bold text-indigo-300 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
              Badges <ArrowRight className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>
      )}

      {/* 3. Daily Review Reminder Prompt (if pending) */}
      {!dailyReviewCompleted && (
        <div
          onClick={() => navigate('/app/daily-review')}
          className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 border border-indigo-200/80 dark:border-indigo-900/50 hover:border-indigo-400 dark:hover:border-indigo-700 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs group"
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/20">
              <Moon className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                Complete today's review
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Take a quick 2-minute reflection on what went well and calibrate for tomorrow
              </p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform self-end sm:self-center">
            Review Day <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      )}

      {/* 3. Today's Progress Bar Row (Tasks, Habits, Focus, Study) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {/* Tasks Progress */}
        <div
          onClick={() => navigate('/app/tasks?tab=today')}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-emerald-300 dark:hover:border-emerald-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" /> Tasks
            </span>
            <span className="text-xs font-extrabold text-emerald-600 dark:text-emerald-400">
              {completionPercentage}%
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {todayCompleted} / {todayTotal}
          </p>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${completionPercentage}%` }} />
          </div>
        </div>

        {/* Habits Progress */}
        <div
          onClick={() => navigate('/app/habits')}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-amber-300 dark:hover:border-amber-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400 flex items-center gap-1.5">
              <Repeat className="w-3.5 h-3.5" /> Habits
            </span>
            <span className="text-xs font-extrabold text-amber-600 dark:text-amber-400">
              {habitsPct}%
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {habitsTodayCompleted} / {habitsTodayTotal}
          </p>
          <div className="w-full h-1.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden mt-2">
            <div className="h-full bg-amber-500 rounded-full" style={{ width: `${habitsPct}%` }} />
          </div>
        </div>

        {/* Focus Sprints */}
        <div
          onClick={() => navigate('/app/focus')}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-cyan-300 dark:hover:border-cyan-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600 dark:text-cyan-400 flex items-center gap-1.5">
              <Timer className="w-3.5 h-3.5" /> Focus
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {focusMinutesToday} min
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Pomodoro time</p>
        </div>

        {/* Study Time */}
        <div
          onClick={() => navigate('/app/study')}
          className="p-4 sm:p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs hover:border-blue-300 dark:hover:border-blue-700 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5" /> Study
            </span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100">
            {formatStudyTime(studyTodayMins)}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Today's courses</p>
        </div>
      </div>

      {/* 4. Morning Plan Top 3 & Top Priority Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Morning Plan Widget (2 Cols) */}
        <div className="lg:col-span-2 p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sun className="w-4 h-4 text-amber-500" />
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Morning Priorities
              </h3>
            </div>
            <button
              onClick={() => navigate('/app/morning-planning')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>{todayMorningPlan ? 'Edit Plan' : 'Set Today’s Plan'}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayMorningPlan ? (
            <div className="space-y-3">
              {todayMorningPlan.intention && (
                <p className="text-xs italic text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/60 p-2.5 rounded-xl border border-slate-100 dark:border-slate-800">
                  "{todayMorningPlan.intention}"
                </p>
              )}

              <div className="space-y-2">
                <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-rose-50/50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/40 text-xs">
                  <span className="w-5 h-5 rounded-md bg-rose-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0">1</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 truncate">{todayMorningPlan.priority_1}</span>
                </div>

                {todayMorningPlan.priority_2 && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40 text-xs">
                    <span className="w-5 h-5 rounded-md bg-amber-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0">2</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{todayMorningPlan.priority_2}</span>
                  </div>
                )}

                {todayMorningPlan.priority_3 && (
                  <div className="flex items-center gap-2.5 p-2.5 rounded-xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40 text-xs">
                    <span className="w-5 h-5 rounded-md bg-blue-500 text-white font-bold flex items-center justify-center text-[10px] shrink-0">3</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{todayMorningPlan.priority_3}</span>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="py-4 text-center sm:text-left space-y-2">
              <p className="text-xs text-slate-500 dark:text-slate-400">
                You haven't set your Top 3 priorities for today yet.
              </p>
              <Button
                size="sm"
                variant="outline"
                onClick={() => navigate('/app/morning-planning')}
                leftIcon={<Sun className="w-3.5 h-3.5 text-amber-500" />}
              >
                Plan My Morning
              </Button>
            </div>
          )}
        </div>

        {/* Top Priority Task Card (1 Col) */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                <Flame className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
                Top Priority Task
              </h3>
            </div>

            {topPriorityTask ? (
              <div className="space-y-2">
                <h4 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 line-clamp-2">
                  {topPriorityTask.title}
                </h4>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                  <PriorityBadge priority={topPriorityTask.priority} />
                  <span>•</span>
                  <span>{topPriorityTask.due_date ? formatDate(topPriorityTask.due_date) : 'No due date'}</span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 py-2">
                No high-priority tasks right now. All caught up!
              </p>
            )}
          </div>

          {topPriorityTask && (
            <div className="pt-3 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingTask(topPriorityTask);
                  setIsEditModalOpen(true);
                }}
                rightIcon={<ArrowRight className="w-3 h-3" />}
              >
                Open
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* 5. Active Projects & Today's Study Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Active Projects Preview */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <FolderGit2 className="w-4 h-4 text-indigo-500" />
              Active Projects
            </h3>
            <button
              onClick={() => navigate('/app/projects')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              View all
            </button>
          </div>

          {activeProjects.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No active projects. Create one to organize larger goals.
            </p>
          ) : (
            <div className="space-y-3">
              {activeProjects.map((p) => (
                <div
                  key={p.id}
                  onClick={() => navigate(`/app/projects?id=${p.id}`)}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-100 dark:border-slate-800 space-y-2 group"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                      {p.name}
                    </h4>
                    <span className="text-xs font-extrabold text-indigo-600 dark:text-indigo-400">
                      {p.progress}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${p.progress}%` }} />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-400">
                    <span>{p.completed_tasks} / {p.total_tasks} tasks</span>
                    <span>{p.due_date ? `Due: ${formatDate(p.due_date)}` : 'Ongoing'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Today's Study Sessions Preview */}
        <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500" />
              Today's Study
            </h3>
            <button
              onClick={() => navigate('/app/study')}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
            >
              View all
            </button>
          </div>

          {todayStudySessions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No study sessions logged for today yet.
            </p>
          ) : (
            <div className="space-y-2.5">
              {todayStudySessions.map((session) => (
                <div
                  key={session.id}
                  onClick={() => navigate('/app/study')}
                  className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300">
                        {session.subject_code || session.subject_name}
                      </span>
                      <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                        {session.title}
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold text-blue-600 dark:text-blue-400 shrink-0">
                    {session.duration_minutes}m
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 6. Main Dashboard Tasks & Upcoming Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Left 2 Cols: Today's Tasks */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">
                Today's Tasks
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Tasks scheduled for today
              </p>
            </div>
            <button
              onClick={() => navigate('/app/tasks?tab=today')}
              className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 flex items-center gap-1 min-h-[36px] px-2 rounded-lg hover:bg-emerald-50 dark:hover:bg-emerald-950/40 transition-colors"
            >
              <span>View all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {todayTasks.length === 0 ? (
            <EmptyState
              icon={<CheckCircle2 className="w-7 h-7" />}
              title="No tasks due today"
              description="Enjoy your free time or schedule a new task to stay ahead."
              actionText="+ Add task"
              actionIcon={<Plus className="w-4 h-4" />}
              onAction={() => setIsCreateModalOpen(true)}
            />
          ) : (
            <div className="space-y-3">
              {todayTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onToggleComplete={handleToggleComplete}
                  onEdit={(t) => {
                    setEditingTask(t);
                    setIsEditModalOpen(true);
                  }}
                  onDelete={(t) => {
                    setDeletingTask(t);
                    setIsDeleteModalOpen(true);
                  }}
                />
              ))}
            </div>
          )}
        </div>

        {/* Right 1 Col: Upcoming & Recent Notes */}
        <div className="space-y-6">
          {/* Upcoming Tasks Section */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-emerald-500" />
                Upcoming
              </h3>
              <button
                onClick={() => navigate('/app/tasks?tab=upcoming')}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                View all
              </button>
            </div>

            {upcomingTasks.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                Nothing scheduled yet.
              </p>
            ) : (
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setEditingTask(task);
                      setIsEditModalOpen(true);
                    }}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer flex items-start justify-between gap-3 group border border-slate-100 dark:border-slate-800"
                  >
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {task.title}
                      </p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1">
                        <span>{formatDate(task.due_date)}</span>
                        {task.due_time && <span>• {formatTime(task.due_time)}</span>}
                      </div>
                    </div>
                    <PriorityBadge priority={task.priority} />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Notes Section */}
          <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-500" />
                Recent Notes
              </h3>
              <button
                onClick={() => navigate('/app/notes')}
                className="text-xs font-medium text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
              >
                View all
              </button>
            </div>

            {recentNotes.length === 0 ? (
              <p className="text-xs text-slate-500 dark:text-slate-400 py-4 text-center">
                No notes captured yet.
              </p>
            ) : (
              <div className="space-y-2.5">
                {recentNotes.map((note) => (
                  <div
                    key={note.id}
                    onClick={() => navigate('/app/notes')}
                    className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer border border-slate-100 dark:border-slate-800"
                  >
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                      {note.title}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate mt-0.5">
                      {note.content || 'Empty note'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Task Edit / Create Modal */}
      <TaskModal
        isOpen={isEditModalOpen || isCreateModalOpen}
        onClose={() => {
          setIsEditModalOpen(false);
          setIsCreateModalOpen(false);
          setEditingTask(null);
        }}
        task={editingTask}
        onSave={handleSaveTask}
        onDelete={(task) => {
          setDeletingTask(task);
          setIsDeleteModalOpen(true);
        }}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingTask(null);
        }}
        task={deletingTask}
        onConfirm={handleDeleteTask}
      />
    </div>
  );
};
