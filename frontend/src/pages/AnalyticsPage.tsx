import React, { useState, useEffect, useCallback } from 'react';
import {
  CheckCircle2,
  Repeat,
  Timer,
  BookOpen,
  FolderGit2,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { analyticsApi } from '../services/analyticsApi';
import { AnalyticsData, AnalyticsRange } from '../types';
import { MetricCard } from '../components/analytics/MetricCard';
import { ProductivityBarChart } from '../components/analytics/ProductivityBarChart';
import { TaskDonutChart } from '../components/analytics/TaskDonutChart';
import { StudyDistributionChart } from '../components/analytics/StudyDistributionChart';
import { FocusTrendChart } from '../components/analytics/FocusTrendChart';
import { DashboardSkeleton } from '../components/common/Skeleton';
import { cn } from '../utils/cn';

export const AnalyticsPage: React.FC = () => {
  const { error } = useToast();

  const [range, setRange] = useState<AnalyticsRange>('week');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchAnalytics = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await analyticsApi.getAnalytics(
        range,
        range === 'custom' ? startDate : undefined,
        range === 'custom' ? endDate : undefined
      );
      setData(res.data);
    } catch (err: any) {
      console.error('Failed to load analytics:', err);
      error(err.message || 'Unable to load analytics data');
    } finally {
      setIsLoading(false);
    }
  }, [range, startDate, endDate, error]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const rangeTabs: { label: string; value: AnalyticsRange }[] = [
    { label: 'Today', value: 'today' },
    { label: 'This Week', value: 'week' },
    { label: 'This Month', value: 'month' },
    { label: 'Custom Range', value: 'custom' },
  ];

  if (isLoading && !data) {
    return <DashboardSkeleton />;
  }

  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h} hrs`;
    return `${m} mins`;
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-300">
      {/* 1. Header & Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Productivity Analytics
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 mt-1">
            Real data-driven insights across tasks, habits, study, focus, and projects
          </p>
        </div>

        {/* Range Pill Selector */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs overflow-x-auto no-scrollbar">
          {rangeTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setRange(tab.value)}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap min-h-[36px]',
                range === tab.value
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Custom Date Inputs if Custom Selected */}
      {range === 'custom' && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">From:</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">To:</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-semibold"
            />
          </div>
          <button
            onClick={fetchAnalytics}
            className="px-3 py-1.5 rounded-xl bg-indigo-600 text-white text-xs font-bold hover:bg-indigo-700"
          >
            Apply
          </button>
        </div>
      )}

      {data && (
        <>
          {/* 2. Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
            <MetricCard
              icon={CheckCircle2}
              title="Task Rate"
              value={`${data.taskMetrics.completionRate}%`}
              subtitle={`${data.taskMetrics.completed} of ${data.taskMetrics.total} done`}
              theme="emerald"
            />

            <MetricCard
              icon={Timer}
              title="Focus Time"
              value={formatMins(data.focusMetrics.totalMinutes)}
              subtitle={`${data.focusMetrics.sessionsCount} sessions (avg ${data.focusMetrics.averageSessionMinutes}m)`}
              theme="cyan"
            />

            <MetricCard
              icon={BookOpen}
              title="Study Hours"
              value={`${data.studyMetrics.totalHours} hrs`}
              subtitle={`${data.studyMetrics.weeklyHours} hrs this week`}
              theme="blue"
            />

            <MetricCard
              icon={Repeat}
              title="Habit Streak"
              value={`${data.habitMetrics.longestStreakMax} days`}
              subtitle={`Avg ${data.habitMetrics.currentStreakAvg}d streak`}
              theme="amber"
            />

            <MetricCard
              icon={FolderGit2}
              title="Projects"
              value={`${data.projectMetrics.active} Active`}
              subtitle={`${data.projectMetrics.averageProgress}% avg progress`}
              theme="purple"
            />
          </div>

          {/* 3. Main Weekly Productivity Chart */}
          <ProductivityBarChart data={data.charts.weeklyProductivity} />

          {/* 4. Two-Column Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            <TaskDonutChart data={data.charts.taskCompletion} />
            <StudyDistributionChart data={data.charts.studyDistribution} />
          </div>

          {/* 5. Focus Trend Chart */}
          <FocusTrendChart data={data.charts.focusTrend} />
        </>
      )}
    </div>
  );
};
