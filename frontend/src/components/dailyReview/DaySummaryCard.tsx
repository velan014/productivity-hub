import React from 'react';
import { DaySummary } from '../../types';
import { CheckCircle2, Timer, BookOpen, Repeat } from 'lucide-react';

interface DaySummaryCardProps {
  summary: DaySummary;
}

export const DaySummaryCard: React.FC<DaySummaryCardProps> = ({ summary }) => {
  const formatMins = (mins: number) => {
    const h = Math.floor(mins / 60);
    const m = mins % 60;
    if (h > 0 && m > 0) return `${h}h ${m}m`;
    if (h > 0) return `${h} hrs`;
    return `${m} mins`;
  };

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-5">
      <div>
        <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100">
          Day's Productivity Summary
        </h3>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Real activity recorded in the database for this date
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {/* Tasks */}
        <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/40">
          <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
            <CheckCircle2 className="w-4 h-4" />
            <span>Tasks</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {summary.tasksCompleted} / {summary.tasksTotal}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            {summary.tasksRemaining} remaining
          </p>
        </div>

        {/* Focus Time */}
        <div className="p-4 rounded-2xl bg-cyan-50/50 dark:bg-cyan-950/20 border border-cyan-100 dark:border-cyan-900/40">
          <div className="flex items-center gap-1.5 text-cyan-600 dark:text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Timer className="w-4 h-4" />
            <span>Focus Time</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {formatMins(summary.focusMinutes)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Pomodoro sprints
          </p>
        </div>

        {/* Study Time */}
        <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-blue-950/20 border border-blue-100 dark:border-blue-900/40">
          <div className="flex items-center gap-1.5 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
            <BookOpen className="w-4 h-4" />
            <span>Study Time</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {formatMins(summary.studyMinutes)}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Course sessions
          </p>
        </div>

        {/* Habits */}
        <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/40">
          <div className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
            <Repeat className="w-4 h-4" />
            <span>Habits</span>
          </div>
          <p className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 mt-2">
            {summary.habitsCompleted} / {summary.habitsTotal}
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
            Habit logs
          </p>
        </div>
      </div>
    </div>
  );
};
