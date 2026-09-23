import React from 'react';
import { Target, Calendar, Edit2, Trash2, CheckCircle2, RotateCcw } from 'lucide-react';
import { Goal } from '../../types';
import { PriorityBadge } from '../common/Badge';
import { formatDate } from '../../utils/date';
import { cn } from '../../utils/cn';

interface GoalCardProps {
  goal: Goal;
  onEdit: (goal: Goal) => void;
  onDelete: (goal: Goal) => void;
  onProgressChange: (goal: Goal, progress: number) => void;
}

export const GoalCard: React.FC<GoalCardProps> = ({
  goal,
  onEdit,
  onDelete,
  onProgressChange,
}) => {
  const isCompleted = goal.status === 'completed' || goal.progress >= 100;
  const isPaused = goal.status === 'paused';

  const quickSteps = [0, 25, 50, 75, 100];

  return (
    <div
      className={cn(
        'group p-5 rounded-3xl bg-white dark:bg-slate-900 border transition-all duration-200 relative overflow-hidden flex flex-col justify-between shadow-xs',
        isCompleted
          ? 'border-emerald-200 dark:border-emerald-900/40 bg-emerald-50/20 dark:bg-emerald-950/10'
          : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
      )}
    >
      {/* Top Bar: Category, Priority, Actions */}
      <div>
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {goal.category || 'General'}
            </span>
            <PriorityBadge priority={goal.priority} />
            {isPaused && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900">
                Paused
              </span>
            )}
            {isCompleted && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" />
                Completed
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Edit Goal"
              aria-label="Edit Goal"
            >
              <Edit2 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(goal)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 transition-colors"
              title="Delete Goal"
              aria-label="Delete Goal"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title and Description */}
        <h3 className={cn(
          'text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 mb-1 leading-snug',
          isCompleted && 'line-through text-slate-500 dark:text-slate-400'
        )}>
          {goal.title}
        </h3>
        {goal.description && (
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4 line-clamp-2">
            {goal.description}
          </p>
        )}
      </div>

      {/* Progress Section */}
      <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
          <span className="flex items-center gap-1.5">
            <Target className="w-3.5 h-3.5 text-emerald-500" />
            Progress
          </span>
          <span className="text-emerald-600 dark:text-emerald-400 text-sm">
            {goal.progress}%
          </span>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-0.5">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-300 ease-out',
              isCompleted
                ? 'bg-emerald-500'
                : 'bg-gradient-to-r from-emerald-500 to-teal-400'
            )}
            style={{ width: `${goal.progress}%` }}
          />
        </div>

        {/* Quick Progress Buttons */}
        <div className="flex items-center justify-between gap-1 pt-1">
          {quickSteps.map((step) => (
            <button
              key={step}
              type="button"
              onClick={() => onProgressChange(goal, step)}
              className={cn(
                'flex-1 py-1 rounded-md text-[10px] font-semibold transition-all',
                goal.progress === step
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-800/80 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              )}
            >
              {step}%
            </button>
          ))}
        </div>

        {/* Bottom meta: Target Date */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500 pt-1">
          <span className="flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            {goal.target_date ? `Target: ${formatDate(goal.target_date)}` : 'No target date'}
          </span>
          {isCompleted && (
            <button
              onClick={() => onProgressChange(goal, 90)}
              className="text-emerald-600 dark:text-emerald-400 font-semibold hover:underline flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Reopen
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
