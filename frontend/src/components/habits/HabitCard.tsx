import React from 'react';
import { Flame, Check, Edit2, Trash2 } from 'lucide-react';
import { HabitWithStats } from '../../types';
import { cn } from '../../utils/cn';

interface HabitCardProps {
  habit: HabitWithStats;
  onToggleToday: (habit: HabitWithStats) => void;
  onEdit: (habit: HabitWithStats) => void;
  onDelete: (habit: HabitWithStats) => void;
}

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  onToggleToday,
  onEdit,
  onDelete,
}) => {
  // Generate last 7 days list for display
  const days = [];
  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().slice(0, 10);
    const dayName = dayLabels[d.getDay()];
    const isCompleted = !!habit.recentLogs?.[dateStr];
    const isToday = i === 0;
    days.push({ dateStr, dayName, isCompleted, isToday });
  }

  const colorClasses: { [key: string]: { bg: string; text: string; border: string; activeBtn: string } } = {
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/40',
      text: 'text-emerald-600 dark:text-emerald-400',
      border: 'border-emerald-200 dark:border-emerald-800',
      activeBtn: 'bg-emerald-600 text-white shadow-emerald-500/20',
    },
    cyan: {
      bg: 'bg-cyan-50 dark:bg-cyan-950/40',
      text: 'text-cyan-600 dark:text-cyan-400',
      border: 'border-cyan-200 dark:border-cyan-800',
      activeBtn: 'bg-cyan-600 text-white shadow-cyan-500/20',
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/40',
      text: 'text-blue-600 dark:text-blue-400',
      border: 'border-blue-200 dark:border-blue-800',
      activeBtn: 'bg-blue-600 text-white shadow-blue-500/20',
    },
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/40',
      text: 'text-indigo-600 dark:text-indigo-400',
      border: 'border-indigo-200 dark:border-indigo-800',
      activeBtn: 'bg-indigo-600 text-white shadow-indigo-500/20',
    },
    purple: {
      bg: 'bg-purple-50 dark:bg-purple-950/40',
      text: 'text-purple-600 dark:text-purple-400',
      border: 'border-purple-200 dark:border-purple-800',
      activeBtn: 'bg-purple-600 text-white shadow-purple-500/20',
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/40',
      text: 'text-rose-600 dark:text-rose-400',
      border: 'border-rose-200 dark:border-rose-800',
      activeBtn: 'bg-rose-600 text-white shadow-rose-500/20',
    },
    amber: {
      bg: 'bg-amber-50 dark:bg-amber-950/40',
      text: 'text-amber-600 dark:text-amber-400',
      border: 'border-amber-200 dark:border-amber-800',
      activeBtn: 'bg-amber-600 text-white shadow-amber-500/20',
    },
  };

  const activeTheme = colorClasses[habit.color || 'emerald'] || colorClasses.emerald;

  return (
    <div className="group p-5 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-3">
        {/* Left: Checkbox + Name */}
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onToggleToday(habit)}
            className={cn(
              'w-7 h-7 mt-0.5 rounded-xl flex items-center justify-center transition-all shrink-0 border min-h-[28px] min-w-[28px]',
              habit.isCompletedToday
                ? `${activeTheme.activeBtn} border-transparent scale-105 shadow-sm`
                : 'border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 hover:border-emerald-500 dark:hover:border-emerald-400'
            )}
            aria-label={`Mark ${habit.name} as ${habit.isCompletedToday ? 'incomplete' : 'complete'} today`}
          >
            {habit.isCompletedToday && <Check className="w-4 h-4 stroke-[3]" />}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className={cn(
                'text-base font-bold text-slate-900 dark:text-slate-100 truncate',
                habit.isCompletedToday && 'line-through text-slate-500 dark:text-slate-400'
              )}>
                {habit.name}
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">
                {habit.category || 'General'}
              </span>
            </div>

            {habit.description && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">
                {habit.description}
              </p>
            )}

            {/* Streaks pill */}
            <div className="flex items-center gap-3 mt-2 text-xs font-semibold">
              <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                {habit.currentStreak} day streak
              </span>
              {habit.longestStreak > 0 && (
                <span className="text-slate-400 text-[11px]">
                  (Best: {habit.longestStreak}d)
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
          <button
            onClick={() => onEdit(habit)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Edit Habit"
            aria-label="Edit Habit"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDelete(habit)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
            title="Delete Habit"
            aria-label="Delete Habit"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 7-Day History Track */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
        <div className="flex items-center justify-between gap-1">
          {days.map((day) => (
            <div
              key={day.dateStr}
              className="flex flex-col items-center gap-1 flex-1 text-center"
            >
              <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                {day.dayName}
              </span>
              <div
                className={cn(
                  'w-7 h-7 rounded-xl flex items-center justify-center text-xs font-bold transition-all',
                  day.isCompleted
                    ? `${activeTheme.bg} ${activeTheme.text} font-bold border ${activeTheme.border}`
                    : 'bg-slate-100 dark:bg-slate-800/60 text-slate-300 dark:text-slate-600',
                  day.isToday && 'ring-1.5 ring-emerald-500 ring-offset-1'
                )}
                title={`${day.dateStr}: ${day.isCompleted ? 'Completed' : 'Missed'}`}
              >
                {day.isCompleted ? '✓' : '✕'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
